/** @type {import('next').NextConfig} */
const nextConfig = {
  // 为Vercel部署配置标准Next.js应用
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  // 添加输出目录配置
  distDir: '.next',
  // 解决Vercel部署时的JavaScript语法错误
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    return config;
  }
}

module.exports = nextConfig