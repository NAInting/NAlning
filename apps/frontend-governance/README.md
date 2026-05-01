# Edu AI Frontend v1

这是把前端工程脚手架方案真正落成的第一版 Vue 3 工程骨架。

## 当前包含

1. `Vue 3 + Vite + TypeScript`
2. `Vue Router + Pinia + Vue Query`
3. 四端页面壳：`student / teacher / guardian / admin`
4. Shared UI 基础组件
5. 本地 mock 数据与异步 API 层
6. `MSW` 预留骨架

## 当前定位

这不是完整产品代码，而是“能继续编码的真实工程起点”。

它已经适合：

1. 前端继续开发 `Phase A / B / C`
2. 接入 mock 数据做页面联调
3. 后续逐步替换成真实后端接口

## 当前状态

1. 已完成 `npm install`
2. 已通过 `npm run build`
3. 构建产物已生成在 `dist/`

## 启动

```bash
npm install
npm run dev
```

## 说明

1. 开发阶段默认直接使用本地 mock API 函数，不依赖后端服务。
2. `src/mocks/msw` 已预留，后续可以按需要切换到浏览器级请求拦截。
3. 角色切换通过左侧导航完成，便于单人开发时快速浏览四端页面。
