// 构建后处理：合并 Vercel 路由，避免超出 Hobby 免费计划 12 个函数限制
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const configPath = join(dir, '..', '.vercel', 'output', 'config.json');

const config = JSON.parse(await readFile(configPath, 'utf8'));

// 只保留 header 规则、静态文件处理和 fallback 通配路由
// 去掉所有独立 API 路由（它们会被 __fallback 统一处理）
config.routes = config.routes.filter(
  (r) =>
    r.headers || r.handle || r.dest === '/__fallback' || r.dest === '/[...]',
);

await writeFile(configPath, JSON.stringify(config, null, 2));
process.stderr.write(
  '[postbuild] merged routes to __fallback, Serverless Functions count reduced\n',
);
