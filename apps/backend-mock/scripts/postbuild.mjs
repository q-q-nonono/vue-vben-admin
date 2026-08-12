// 构建后处理：合并 Vercel 路由和函数，避免超出 Hobby 免费计划 12 个函数限制
import { lstat, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(dir, '..', '.vercel', 'output');
const functionsDir = join(outputDir, 'functions');

// 1. 清理 config.json：只保留 header 规则、静态文件处理和 fallback 通配路由
const configPath = join(outputDir, 'config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
config.routes = config.routes.filter(
  (r) =>
    r.headers || r.handle || r.dest === '/__fallback' || r.dest === '/[...]',
);
await writeFile(configPath, JSON.stringify(config, null, 2));
process.stderr.write('[postbuild] config.json routes cleaned\n');

// 2. 删除 api/ 下所有独立 .func 文件/目录（只保留 __fallback.func）
async function removeFuncs(dirPath) {
  let entries;
  try {
    entries = await readdir(dirPath);
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = await lstat(fullPath);
    if (stat.isDirectory() && entry.endsWith('.func')) {
      await rm(fullPath, { recursive: true, force: true });
      process.stderr.write(`[postbuild] removed ${fullPath}\n`);
    } else if (stat.isSymbolicLink() && entry.endsWith('.func')) {
      await rm(fullPath, { force: true });
      process.stderr.write(`[postbuild] removed symlink ${fullPath}\n`);
    } else if (stat.isDirectory()) {
      await removeFuncs(fullPath);
    }
  }
}
await removeFuncs(functionsDir);

process.stderr.write(
  '[postbuild] done - all individual .func entries removed, only __fallback remains\n',
);
