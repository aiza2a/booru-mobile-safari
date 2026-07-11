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

## 阶段 3：触摸与详情稳定性（已关闭）
- [x] 防止同一次长按重复触发分享（run `29145057951`）
- [x] 长按交互状态机与点击抑制（run `29145313100`）
- [x] 禁止 Safari 原生图片拖动预览（run `29145504019`）
- [x] 分享期间保持长按预览并锁定滚动（run `29145740709`）
- [x] 三种列表布局统一卡片触摸入口
- [x] 四站长按行为基本验收
- [x] 加载中点击遮罩可立即关闭详情
- [x] 原生分享拒绝或取消时静默恢复
- [x] 详情返回后双向重激活邻近图片（run `29146986682`）
- [x] 云端 lint/日期测试/build 成功
- [x] Stay 阶段 3验收，允许推进阶段 4

## 阶段 4：iOS UI 重构（进行中）
- [x] 左侧仅保留 Yandere、Konachan、Konachan Safe、Danbooru、Gelbooru
- [x] Konachan Safe 保持独立域名和独立绿色入口，显示名统一为 Konachan
- [x] 五站使用清晰、统一风格的本地 SVG Icon
- [x] 建立深浅主题 iOS 语义色变量（未改顶栏结构和空间分配）
- [ ] 深色 iOS 语义色完整覆盖
- [ ] 浅色 iOS 语义色完整覆盖
- [x] 设置/菜单/搜索/日期控件统一
- [x] 顶部浮动液态玻璃操作控件（保持原空间分配）
- [x] 详情动态图片环境背景与玻璃操作栏
- [x] 左右侧边栏液态玻璃材质
- [x] 减少动态效果与无毛玻璃环境降级
- [ ] 清理 MD3 阴影、涟漪与高饱和组件
- [ ] Stay 验收
- [ ] Userscripts 兼容验收

> 规则：阶段未通过验收，不进入下一阶段。
