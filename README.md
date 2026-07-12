# Booru Mobile Safari

中文 | [English](./README.en.md)

Booru Mobile Safari 是一个**仅面向 iPhone Safari / Stay 的用户脚本**。它只保留手机端浏览所需能力，不追求桌面浏览器兼容，也不再覆盖其他 Booru 站点。

## 项目定位

- 仅支持手机端使用
- 仅支持 5 个站点：
  - Yande.re
  - Konachan.com
  - Konachan.net
  - Danbooru
  - Gelbooru
- 仅保留浏览、搜索、日期筛选、详情、分享和移动端设置
- 不包含桌面端适配、图片下载、批量下载、Fancybox、FSA、其他站点兼容层

## 当前功能

- 移动端瀑布流浏览
- 日 / 周 / 月 / 年 / 范围日期筛选
- 标签搜索与自动补全
- iOS 风格顶栏、侧栏、设置面板
- 图片详情查看与左右切换
- 长按分享作品链接
- 深浅主题与基础布局设置

## 支持站点

| 站点 | 地址 |
|---|---|
| Yande.re | https://yande.re |
| Konachan | https://konachan.com |
| Konachan Safe | https://konachan.net |
| Danbooru | https://danbooru.donmai.us |
| Gelbooru | https://gelbooru.com |

## 不再包含

以下内容已从本项目目标中移除或不再保证：

- 桌面端专用交互与布局
- 其他 Booru / Rule34 / Sankaku / Zerochan / Nozomi 等站点兼容
- 图片下载、批量下载、下载队列、导出 URL
- Fancybox 详情模式
- File System Access / FSA 存储目录功能

## 安装

[安装最新用户脚本](https://raw.githubusercontent.com/aiza2a/booru-mobile-safari/main/booru-mobile-safari.user.js)

推荐在以下环境中使用：

- iPhone Safari + 用户脚本扩展
- Stay

## 开发与构建

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run verify:dates
pnpm run build
```

构建输出：

- `dist/booru-mobile-safari.user.js`
- `booru-mobile-safari.user.js`

## 许可证与来源

本项目基于原始开源项目的移动端分支重构与精简而来，继续遵循 **MIT License**。

原始来源和衍生关系请见 [LICENSE](./LICENSE)。
