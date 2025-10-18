/** @type {import('next').NextConfig} */
const nextConfig = {
  // 为Vercel部署移除output: 'export'
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
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