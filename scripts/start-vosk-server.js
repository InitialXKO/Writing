#!/usr/bin/env node

/**
 * Vosk服务器快速启动脚本
 *
 * 此脚本会检查并启动Vosk语音识别服务器
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SERVER_DIR = path.join(__dirname, '..', 'server');
const SERVER_FILE = path.join(SERVER_DIR, 'index.js');

// 检查服务器文件是否存在
if (!fs.existsSync(SERVER_FILE)) {
  console.log('❌ Vosk服务器文件不存在');
  console.log('请先运行配置脚本:');
  console.log('  npm run setup-vosk');
  process.exit(1);
}

// 检查依赖是否已安装
const nodeModulesPath = path.join(SERVER_DIR, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ 服务器依赖未安装');
  console.log('请先运行配置脚本:');
  console.log('  npm run setup-vosk');
  process.exit(1);
}

// 启动服务器
console.log('🚀 启动Vosk语音识别服务器...');

const serverProcess = spawn('node', ['index.js'], {
  cwd: SERVER_DIR,
  stdio: 'inherit'
});

serverProcess.on('close', (code) => {
  console.log(`服务器进程退出，退出码: ${code}`);
});

serverProcess.on('error', (error) => {
  console.error('❌ 启动服务器时发生错误:', error.message);
  console.log('请确保已正确安装所有依赖');
});

console.log('✅ Vosk服务器启动中...');
console.log('💡 服务器将在后台运行');
console.log('💡 按 Ctrl+C 可以停止服务器');