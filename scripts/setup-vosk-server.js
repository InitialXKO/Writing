#!/usr/bin/env node

/**
 * Vosk服务器自动化配置脚本
 *
 * 此脚本会自动：
 * 1. 检查系统环境
 * 2. 安装必要的依赖
 * 3. 下载并配置Vosk模型
 * 4. 启动Vosk语音识别服务器
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// 配置参数
const CONFIG = {
  MODEL_URL: 'https://alphacephei.com/vosk/models/vosk-model-cn-0.15.zip',
  MODEL_NAME: 'vosk-model-cn-0.15',
  SERVER_PORT: 3001,
  TEMP_DIR: path.join(__dirname, '..', 'temp'),
  MODELS_DIR: path.join(__dirname, '..', 'models'),
  SERVER_DIR: path.join(__dirname, '..', 'server')
};

// 创建必要的目录
function createDirectories() {
  const dirs = [CONFIG.TEMP_DIR, CONFIG.MODELS_DIR, CONFIG.SERVER_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ 创建目录: ${dir}`);
    }
  });
}

// 检查系统依赖
function checkDependencies() {
  console.log('🔍 检查系统依赖...');

  try {
    execSync('node --version', { stdio: 'pipe' });
    console.log('✓ Node.js 已安装');
  } catch (error) {
    console.error('❌ 未找到 Node.js，请先安装 Node.js');
    process.exit(1);
  }

  try {
    execSync('npm --version', { stdio: 'pipe' });
    console.log('✓ npm 已安装');
  } catch (error) {
    console.error('❌ 未找到 npm，请先安装 npm');
    process.exit(1);
  }
}

// 安装服务器依赖
async function installServerDependencies() {
  console.log('📦 安装服务器依赖...');

  const packageJson = {
    "name": "vosk-speech-recognition-server",
    "version": "1.0.0",
    "description": "Vosk语音识别服务器",
    "main": "index.js",
    "scripts": {
      "start": "node index.js",
      "dev": "node index.js"
    },
    "dependencies": {
      "vosk": "^0.3.3",
      "express": "^4.18.0",
      "cors": "^2.8.5",
      "adm-zip": "^0.5.10"
    }
  };

  const packageJsonPath = path.join(CONFIG.SERVER_DIR, 'package.json');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install'], {
      cwd: CONFIG.SERVER_DIR,
      stdio: 'inherit'
    });

    install.on('close', (code) => {
      if (code === 0) {
        console.log('✓ 服务器依赖安装完成');
        resolve();
      } else {
        console.error('❌ 服务器依赖安装失败');
        reject(new Error('安装失败'));
      }
    });
  });
}

// 下载Vosk模型
async function downloadModel() {
  console.log('📥 下载Vosk中文模型...');

  const modelPath = path.join(CONFIG.MODELS_DIR, CONFIG.MODEL_NAME);
  if (fs.existsSync(modelPath)) {
    console.log('✓ 模型已存在，跳过下载');
    return;
  }

  const zipPath = path.join(CONFIG.TEMP_DIR, 'model.zip');

  // 使用curl下载模型
  try {
    console.log('正在下载模型文件...');
    execSync(`curl -L -o "${zipPath}" "${CONFIG.MODEL_URL}"`, {
      stdio: 'inherit'
    });

    console.log('正在解压模型文件...');
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(CONFIG.MODELS_DIR, true);

    // 清理临时文件
    fs.unlinkSync(zipPath);

    console.log('✓ 模型下载并解压完成');
  } catch (error) {
    console.error('❌ 模型下载失败:', error.message);
    throw error;
  }
}

// 创建服务器文件
function createServerFiles() {
  console.log('📝 创建服务器文件...');

  // 创建主服务器文件
  const serverCode = `
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// 动态加载Vosk模块
let vosk = null;
let canUseVosk = false;

try {
  vosk = require('vosk');
  canUseVosk = true;
  console.log('✓ Vosk模块加载成功');
} catch (error) {
  console.warn('⚠ Vosk模块加载失败:', error.message);
  console.log('语音识别功能将不可用');
}

const app = express();
const PORT = process.env.PORT || ${CONFIG.SERVER_PORT};

// 中间件
app.use(cors());
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// Vosk模型和识别器
let model = null;
let isModelReady = false;

// 初始化Vosk模型
async function initializeModel() {
  if (!canUseVosk) {
    console.log('Vosk不可用，跳过模型初始化');
    return;
  }

  try {
    const modelPath = path.join(__dirname, '..', 'models', '${CONFIG.MODEL_NAME}');

    if (!fs.existsSync(modelPath)) {
      throw new Error(\`模型文件不存在: \${modelPath}\`);
    }

    console.log('正在加载Vosk模型...');
    model = new vosk.Model(modelPath);
    isModelReady = true;
    console.log('✓ Vosk模型加载完成');
  } catch (error) {
    console.error('❌ Vosk模型加载失败:', error.message);
    isModelReady = false;
  }
}

// 语音识别端点
app.post('/api/recognize', async (req, res) => {
  if (!canUseVosk || !isModelReady) {
    return res.status(503).json({
      text: '语音识别服务不可用。请检查服务器配置。',
      confidence: 0.0,
      words: []
    });
  }

  try {
    const audioBuffer = req.body;

    // 创建识别器
    const recognizer = new vosk.Recognizer({ model: model, sampleRate: 16000 });

    try {
      // 将Buffer转换为Int16Array
      const int16Array = new Int16Array(audioBuffer);

      // 喂入音频数据
      recognizer.acceptWaveform(int16Array);

      // 获取最终结果
      const result = recognizer.finalResult();

      // 返回结果
      res.json({
        text: result.text || '',
        confidence: result.confidence || 0.9,
        words: result.result?.map(word => ({
          word: word.word,
          start: word.start,
          end: word.end
        })) || []
      });
    } finally {
      // 清理识别器
      recognizer.free();
    }
  } catch (error) {
    console.error('语音识别错误:', error);
    res.status(500).json({
      text: '语音识别过程中发生错误',
      confidence: 0.0,
      words: []
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: canUseVosk && isModelReady ? 'ready' : 'initializing',
    voskAvailable: canUseVosk,
    modelReady: isModelReady,
    message: canUseVosk && isModelReady
      ? 'Vosk语音识别服务已就绪'
      : 'Vosk语音识别服务正在初始化'
  });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(\`📡 Vosk语音识别服务器运行在端口 \${PORT}\`);
  await initializeModel();

  if (canUseVosk && isModelReady) {
    console.log('🎉 语音识别服务已准备就绪');
  } else {
    console.log('⚠ 语音识别服务不可用，请检查配置');
  }
});
`;

  const serverPath = path.join(CONFIG.SERVER_DIR, 'index.js');
  fs.writeFileSync(serverPath, serverCode);

  console.log('✓ 服务器文件创建完成');
}

// 启动服务器
function startServer() {
  console.log('🚀 启动Vosk服务器...');

  const serverProcess = spawn('node', ['index.js'], {
    cwd: CONFIG.SERVER_DIR,
    stdio: 'inherit'
  });

  serverProcess.on('close', (code) => {
    console.log(\`服务器进程退出，退出码: \${code}\`);
  });

  console.log(\`✅ Vosk服务器已在端口 \${CONFIG.SERVER_PORT} 启动\`);
  console.log('💡 服务器正在后台运行，您可以关闭此窗口');
  console.log('💡 要停止服务器，请使用任务管理器或 kill 命令');
}

// 主函数
async function main() {
  console.log('🤖 Vosk服务器自动化配置脚本');
  console.log('================================');

  try {
    // 检查依赖
    checkDependencies();

    // 创建目录
    createDirectories();

    // 安装依赖
    await installServerDependencies();

    // 下载模型
    await downloadModel();

    // 创建服务器文件
    createServerFiles();

    // 启动服务器
    startServer();

    console.log('\\n🎉 Vosk服务器配置完成！');
    console.log(\`🌐 API端点: http://localhost:\${CONFIG.SERVER_PORT}/api/recognize\`);
    console.log(\`💚 健康检查: http://localhost:\${CONFIG.SERVER_PORT}/api/health\`);

  } catch (error) {
    console.error('❌ 配置过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main();
}

module.exports = { main };