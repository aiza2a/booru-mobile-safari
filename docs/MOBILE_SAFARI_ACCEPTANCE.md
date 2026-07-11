# Mobile Safari 改造验收清单

## 阶段 1：数据正确性
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

## 阶段 2：统一日期组件
- [ ] 公共 DateFilter 状态
- [ ] 最近/日期模式
- [ ] 日/周/月/年
- [ ] 日期选择与前后移动
- [ ] URL 状态恢复
- [ ] 站点能力动态显示
- [ ] 云端 lint/build 成功
- [ ] Stay 实机验收

## 阶段 3：触摸与详情稳定性
- [ ] 分享期间保持长按预览
- [ ] 四站长按行为一致
- [ ] 详情关闭无黑帧
- [ ] 详情关闭无布局位移
- [ ] 精确恢复滚动位置
- [ ] 云端 lint/build 成功
- [ ] Stay 实机验收

## 阶段 4：iOS UI 重构
- [ ] 深色 iOS 语义色完整覆盖
- [ ] 浅色 iOS 语义色完整覆盖
- [ ] 设置/菜单/搜索/日期控件统一
- [ ] 清理 MD3 阴影、涟漪与高饱和组件
- [ ] Stay 验收
- [ ] Userscripts 兼容验收

> 规则：阶段未通过验收，不进入下一阶段。
