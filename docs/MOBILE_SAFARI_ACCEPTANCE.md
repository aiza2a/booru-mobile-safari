# Mobile Safari 改造验收清单

## 阶段 1：数据正确性（已关闭）
- [x] Yande.re 最近人气 1d/1w/1m/1y 内容实际变化（实时接口前 20 个 ID 集合共 4 组）
- [x] Yande.re 首页按日/周/月/年查询（日期与范围语法实时验证）
- [x] Konachan / Konachan Safe 首页可加载（Stay 实机确认）
- [x] Konachan / Konachan Safe 随机可加载（Stay 实机确认）
- [x] Konachan 首页按日/周/月/年查询（数据路由与 HTML 回退通过；统一控件在阶段 2 实现）
- [x] Danbooru 首页日期筛选（路由与 API 语法验证）
- [x] Danbooru 最多观看 day/week/month/year（Explore JSON 实时验证）
- [x] Danbooru 最受欢迎 day/week/month/year（Explore JSON 实时验证）
- [x] Danbooru 热度最高日期筛选（历史范围使用 `order:score`，实时返回数据）
- [x] Gelbooru 首页日期筛选（实时 HTML 验证）
- [x] Gelbooru 评分最高近期筛选（实时 HTML 验证）
- [x] Gelbooru 最近更新近期筛选（按发布日期过滤、更新时间倒序；实时 HTML 验证）
- [x] 日期范围、路由构建和 Konachan HTML fixture 自动测试
- [x] 云端 lint/日期测试/build 成功（run `29136700283`）
- [x] Stay 实机验收（Yande.re、Konachan 首页/随机及阶段 1 数据路径确认）

## 阶段 2：统一日期组件（已关闭）
- [x] 公共 DateFilter 状态
- [x] 最近/日期模式的数据和路由基础
- [x] 日/周/月/年路由与状态恢复
- [x] 日期前后移动路由
- [x] URL 状态恢复基础参数
- [x] 站点能力动态显示
- [x] Yande.re / Konachan 使用 iOS 原生单日期月历（Stay 实机确认）
- [x] Danbooru 使用同一原生日期选择路径
- [x] 原生两步日期区间选择（开始日期 → 结束日期 → 查看结果）
- [x] 范围路由与 URL 状态恢复
- [x] 顶部日期组件无透明按钮占位
- [x] 右下角悬浮搜索可见并可打开搜索面板
- [x] 云端 lint/日期测试/build 成功（run `29144441536`）
- [x] Stay 阶段 2 总验收（用户确认可推进阶段 3）

## 阶段 3：触摸与详情稳定性（代码完成，待 Stay 总验收）
- [x] 防止同一次长按重复触发分享（run `29145057951`）
- [x] 长按交互状态机与点击抑制（run `29145313100`）
- [x] 禁止 Safari 原生图片拖动预览（run `29145504019`）
- [x] 分享期间保持长按预览并锁定滚动（run `29145740709`）
- [x] 三种列表布局统一卡片触摸入口
- [ ] 四站长按行为 Stay 总验收
- [x] 详情内容保持挂载并使用缩略图连续占位（提交 `12208c4`）
- [x] 卡片锚点与双帧滚动位置恢复（提交 `12208c4`）
- [x] 云端 lint/日期测试/build 成功（run `29146007493`）
- [ ] 详情关闭无黑帧（Stay 验收）
- [ ] 详情关闭无布局位移（Stay 验收）
- [ ] 精确恢复滚动位置（Stay 验收）
- [ ] Stay 阶段 3 总验收

## 阶段 4：iOS UI 重构
- [ ] 左侧站点仅保留 Yande.re、Konachan、Danbooru、Gelbooru、Rule34
- [ ] Konachan Safe 从站点主列表移除或统一命名后并入 Konachan 入口
- [ ] 五站使用清晰、统一风格的本地 Icon 资产
- [ ] 深色 iOS 语义色完整覆盖
- [ ] 浅色 iOS 语义色完整覆盖
- [ ] 设置/菜单/搜索/日期控件统一
- [ ] 清理 MD3 阴影、涟漪与高饱和组件
- [ ] Stay 验收
- [ ] Userscripts 兼容验收

> 规则：阶段未通过验收，不进入下一阶段。
