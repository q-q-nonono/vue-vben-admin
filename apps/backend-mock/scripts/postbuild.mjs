// 构建后处理：从 /tmp/ 临时构建产物复制必要的文件到 .vercel/output/
// 构建在 /tmp/ 中进行，Vercel 监视器无法看到临时目录里的 35+ .func symlink

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(dir, '..');

const tmpOutputDir = '/tmp/vben-nitro-output';
const vercelOutputDir = join(projectRoot, '.vercel', 'output');
const funcDir = join(vercelOutputDir, 'functions', '__fallback.func');

// 1. 删除旧的 .vercel/output，重建目录结构
await rm(vercelOutputDir, { recursive: true, force: true });
await mkdir(funcDir, { recursive: true });

// 2. 复制 __fallback.func 的内容（这是唯一的 Serverless Function）
const srcFuncDir = join(tmpOutputDir, 'functions', '__fallback.func');
await cp(srcFuncDir, funcDir, { recursive: true });

// 3. 从 /tmp/config.json 复制并过滤 routes
const tmpConfigPath = join(tmpOutputDir, 'config.json');
const config = JSON.parse(await readFile(tmpConfigPath, 'utf8'));
// 只保留 headers 规则、filesystem handle、和 __fallback 通配路由
config.routes = config.routes.filter(
  (r) => r.headers || r.handle || r.dest === '/__fallback',
);
await writeFile(
  join(vercelOutputDir, 'config.json'),
  JSON.stringify(config, null, 2),
);

// 4. 清理临时目录
await rm(tmpOutputDir, { recursive: true, force: true });

process.stderr.write(
  '[postbuild] done - /tmp outputs cleaned, .vercel/output/ built with 1 function\n',
);
