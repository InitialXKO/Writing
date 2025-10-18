# 六年级作文成长手册 - 游戏化学习平台

一个基于Next.js的无后端作文学习平台，帮助六年级学生通过游戏化的方式掌握写作技巧。

## 功能特点

- 🎮 **游戏化学习**：7个写作工具关卡，循序渐进
- 📝 **实时写作**：内置作文编辑器，支持实时保存
- 🤖 **AI批改**：支持自定义API密钥的AI作文批改（BYOK）
- 📊 **进度追踪**：本地存储学习进度和作文记录
- 📱 **响应式设计**：适配各种设备屏幕

## 技术栈

- **前端框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **状态管理**：Zustand + localStorage
- **动画**：Framer Motion
- **图标**：Lucide React
- **部署**：Vercel静态导出

## 本地开发

1. 安装依赖：
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. 启动开发服务器：
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 构建和部署

1. 构建生产版本：
```bash
npm run build
# or
yarn build
# or
pnpm build
```

2. 启动生产服务器：
```bash
npm start
# or
yarn start
# or
pnpm start
```

## Vercel部署

这个项目已经配置为支持Vercel的静态导出部署：

1. 将代码推送到GitHub仓库
2. 在[Vercel官网](https://vercel.com)登录并导入项目
3. 选择你的GitHub仓库
4. Vercel会自动检测Next.js配置并设置正确的构建设置
5. 点击"Deploy"开始部署

## 项目结构

```
src/
├── app/           # Next.js App Router页面
├── components/    # 可复用组件
├── data/          # 静态数据
├── lib/           # 工具函数和状态管理
├── types/         # TypeScript类型定义
└── styles/        # 全局样式
```

## 无后端设计

- 所有数据存储在浏览器的localStorage中
- AI批改功能需要用户配置自己的API密钥
- 支持自定义API端点（如DeepSeek、Moonshot等兼容OpenAI格式的服务）

## 自定义配置

1. **AI API配置**：
   - 在"设置"页面配置API密钥
   - 可选择不同的AI模型
   - 支持自定义API端点

2. **写作工具内容**：
   - 修改 `src/data/tools.ts` 来调整写作工具内容
   - 可以添加更多练习题目和示例

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License