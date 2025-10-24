import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

// 配置参数
const MODEL_URL = 'https://alphacephei.com/vosk/models/vosk-model-cn-0.15.zip';
const TMP_DIR = '/tmp/vosk-model';
const MODEL_NAME = 'vosk-model-cn-0.15';

/**
 * 确保Vosk模型已下载并解压到/tmp目录
 * @returns 模型目录路径
 */
export async function ensureModel(): Promise<string> {
  // 检查模型是否已存在
  const modelPath = path.join(TMP_DIR, MODEL_NAME);
  if (fs.existsSync(modelPath)) {
    console.log('Vosk模型已存在，跳过下载');
    return modelPath;
  }

  console.log('正在下载Vosk模型...');

  try {
    // 创建临时目录
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    // 下载模型zip文件
    const zipPath = path.join(TMP_DIR, 'model.zip');
    const res = await fetch(MODEL_URL);

    if (!res.ok) {
      throw new Error(`模型下载失败: ${res.status} ${res.statusText}`);
    }

    // 保存zip文件
    const fileStream = fs.createWriteStream(zipPath);
    await new Promise<void>((resolve, reject) => {
      res.body?.on('error', reject);
      fileStream.on('error', reject);
      fileStream.on('finish', resolve);
      res.body?.pipe(fileStream);
    });

    console.log('正在解压模型文件...');

    // 解压模型
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(TMP_DIR, true);

    // 清理zip文件
    fs.unlinkSync(zipPath);

    console.log('Vosk模型下载并解压完成');
    return modelPath;
  } catch (error) {
    console.error('模型处理失败:', error);
    throw new Error(`模型处理失败: ${(error as Error).message}`);
  }
}