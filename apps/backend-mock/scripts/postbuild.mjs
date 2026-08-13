// 构建后处理：清理临时构建产物，只保留 __fallback.func，再转移到 .vercel/output/
// 先构建到临时目录避免 Vercel 在构建过程中就扫描到多余的 .func 文件
import {
  lstat,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const tempOutputDir = join(dir, '..', '.nitro-vercel-output');
const finalOutputDir = join(dir, '..', '.vercel', 'output');
const functionsDir = join(tempOutputDir, 'functions');

// 1. 清理 config.json：只保留 header 规则、静态文件处理和 fallback 通配路由
const configPath = join(tempOutputDir, 'config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
config.routes = config.routes.filter(
  (r) => r.headers || r.handle || r.dest === '/__fallback',
);
await writeFile(configPath, JSON.stringify(config, null, 2));
process.stderr.write('[postbuild] config.json routes cleaned\n');

// 2. 删除所有独立的 .func 文件/目录（只保留 __fallback.func）
async function removeFuncs(dirPath, isRoot = false) {
  let entries;
  try {
    entries = await readdir(dirPath);
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = await lstat(fullPath);
    if (isRoot && entry === '__fallback.func') {
      continue; // 保留根目录的 __fallback.func
    }
    if (stat.isDirectory() && entry.endsWith('.func')) {
      await rm(fullPath, { recursive: true, force: true });
      process.stderr.write(`[postbuild] removed ${fullPath}\n`);
    } else if (stat.isSymbolicLink() && entry.endsWith('.func')) {
      await rm(fullPath, { force: true });
      process.stderr.write(`[postbuild] removed symlink ${fullPath}\n`);
    } else if (stat.isDirectory()) {
      await removeFuncs(fullPath, false);
    }
  }
}
await removeFuncs(functionsDir, true);

// 3. 删除整个 api/ 目录树（里面只剩下空目录和已删除的 symlink）
const apiDir = join(functionsDir, 'api');
try {
  await rm(apiDir, { recursive: true, force: true });
  process.stderr.write('[postbuild] removed api/ directory tree\n');
} catch {
  // 可能不存在，忽略
}

// 4. 转移到 .vercel/output/（替换已存在的）
try {
  await rm(finalOutputDir, { recursive: true, force: true });
} catch {
  // 可能不存在，忽略
}
await rename(tempOutputDir, finalOutputDir);

process.stderr.write(
  '[postbuild] done - cleaned output moved to .vercel/output/\n',
);
