const fs = require('fs-extra');
const path = require('path');

// 源路径：node_modules中的Monaco Editor文件
const sourcePath = path.resolve(process.cwd(), 'node_modules/monaco-editor/min/vs');

// 目标路径：public目录下的Monaco Editor文件
const targetPath = path.resolve(process.cwd(), 'public/monaco-editor/min/vs');

// 确保目标目录存在
fs.ensureDirSync(path.dirname(targetPath));

// 复制文件
try {
  fs.copySync(sourcePath, targetPath, { overwrite: true });
  console.log('Monaco Editor文件已成功复制到public目录！');
} catch (err) {
  console.error('复制Monaco Editor文件时出错:', err);
} 