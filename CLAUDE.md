# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based writing companion application for 6th-grade students. The platform gamifies writing education with 7 progressive writing tools and AI-powered feedback.

## Technology Stack

- **Framework**: Next.js 14/15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Development Commands

### Local Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── data/          # Static data (writing tools definitions)
├── lib/           # Utilities and state management
├── types/         # TypeScript type definitions
└── styles/        # Global styles
```

## Key Architecture Patterns

### State Management
- Uses Zustand for global state management
- Persists data to localStorage using zustand/middleware
- Main store in `src/lib/store.ts`
- Progress tracking for writing tools and student achievements

### Writing Tools System
- 7 progressive writing tools defined in `src/data/tools.ts`
- Each tool has unlock conditions based on prerequisites, mastery levels, and practice counts
- Tools include: 观察者之眼, 具体化, 慢镜头, 五感法, 对比法, 深度挖掘, 节奏感, and 自由写作
- Each tool includes: name, description, mantra, examples, exercises, and comprehension tests

### Data Flow
1. Writing tools defined statically in `src/data/tools.ts`
2. User progress tracked in Zustand store
3. Essays saved to localStorage with version history
4. AI feedback generated via external API (user-provided API keys)

### Key Components
- Tool pages (`src/app/tools/[id]/page.tsx`) - Display writing tool information and comprehension tests
- Writing page (`src/app/write/page.tsx`) - Main writing interface with AI feedback
- Progress tracking (`src/app/progress/page.tsx`) - Student progress dashboard
- Settings (`src/app/settings/page.tsx`) - AI configuration

### Important Implementation Details
- No backend - all data stored in browser localStorage
- AI feedback requires user to configure their own API key
- Writing tools have unlock conditions based on progress
- Each essay can have multiple versions with feedback history
- Daily challenges and habit tracking for engagement