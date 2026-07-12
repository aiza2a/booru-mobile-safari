# Booru Mobile Safari

面向 iPhone Safari / Stay 的轻量 Booru 用户脚本，仅支持以下站点：

- Yande.re
- Konachan.com
- Konachan.net
- Danbooru
- Gelbooru

## 功能

- 手机端瀑布流浏览
- 日、周、月、年和自定义日期范围
- 标签搜索与自动补全
- iOS 风格侧栏、设置和图片详情
- 长按分享作品链接
- 深浅主题与移动端布局设置

本项目不包含桌面端适配、图片下载、批量下载、Fancybox、FSA，以及其他 Booru 站点兼容代码。

## 安装

[安装最新用户脚本](https://raw.githubusercontent.com/aiza2a/booru-mobile-safari/main/booru-mobile-safari.user.js)

推荐在 iPhone 的 Stay 或兼容用户脚本的 Safari 扩展中安装。

## 开发

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run verify:dates
pnpm run build
```

构建结果：`dist/yandere-masonry.user.js`

## 来源与许可证

本项目由 `asadahimeka/yandere-masonry` 分支改造、移动端适配并精简而来，保留 MIT License 及原作者署名。
