# Booru Mobile Safari 完整实施计划与交接说明

> 仓库：`https://github.com/aiza2a/yandere-masonry`
>
> 开发分支：`mobile-safari`
>
> 上游：`asadahimeka/yandere-masonry`
>
> 主要运行环境：iPhone Safari + Stay；Userscripts 为辅助兼容环境。
>
> 本文是后续对话继续开发的唯一主计划。开始工作前必须先读本文和 `docs/MOBILE_SAFARI_ACCEPTANCE.md`。

## 1. 项目目标

将原本面向桌面浏览器的用户脚本改造成以 iPhone Safari 为第一目标的 Booru 浏览器，重点支持：

- Yande.re
- Konachan.com
- Konachan.net
- Danbooru
- Gelbooru

次要保留站点入口：

- Rule34
- Safebooru
- Zerochan
- Pixiv Viewer
- Moeview：`https://moeview.app/`

核心目标：

1. 移动端原生触摸操作，不依赖 hover、右键和键盘。
2. 默认分享帖子详情链接，不分享图片 CDN 直链。
3. 所有主要站点提供统一日期筛选框架。
4. 深色和浅色界面均符合 iOS 原生视觉习惯。
5. Stay 中稳定运行，依赖失败时不出现永久黑屏。
6. 每阶段完成后必须通过自动构建、接口验证和用户实机验收。

## 2. 强制执行规则

### 2.1 阶段门禁

严格按照以下顺序执行：

1. 数据正确性
2. 统一日期组件
3. 触摸与详情稳定性
4. iOS UI 重构

前一阶段未通过以下三项，不得进入下一阶段：

- GitHub Actions `lint` 成功
- GitHub Actions `build` 成功
- 用户在 Stay 中明确确认可用

### 2.2 修改规则

- 每次修改前读取目标文件当前内容。
- 一次提交只处理一个明确子问题。
- 不把多个未验证修复同时混入同一测试版本。
- 所有站点 URL 和参数必须先真实访问验证。
- 不把“构建成功”等同于“运行正确”。
- 不再使用 `document-start` 隐藏整页内容。
- 保持 `@run-at document-end`，以 Stay 兼容性为优先。

### 2.3 构建发布

本机 iSH 的 Node/pnpm 存在下载包内部断言问题，因此：

- 本机用于编辑和静态检查。
- 正式 lint/build 使用 GitHub Actions。
- Workflow：`.github/workflows/mobile-build.yml`
- 构建产物自动写入分支根目录：`booru-mobile-safari.user.js`
- 安装 URL：
  `https://raw.githubusercontent.com/aiza2a/yandere-masonry/mobile-safari/booru-mobile-safari.user.js`

注意：本地 Git 工作树与远程 MCP 提交历史没有同步。本地 `git status` 会显示大量修改，不能据此判断远程未提交。核验远程状态应使用 GitHub API/MCP。

## 3. 当前已完成内容

### 3.1 仓库与构建

- 已 fork 到 `aiza2a/yandere-masonry`。
- 已创建 `mobile-safari` 分支。
- 已建立 GitHub Actions lint/build/artifact 流程。
- 构建产物可直接安装。
- 最新已确认的阶段 1 基础修复构建：GitHub Actions run `29135626891`，状态成功。

### 3.2 Stay 黑屏修复

已确认黑屏源于：

- `document-start` 过早接管页面。
- CSS 隐藏 `body` 全部子元素后，替换后的 `#app` 仍被隐藏。
- 清空原页面后再加载 CDN 依赖，任一依赖失败会永久黑屏。

现行策略：

- `@run-at document-end`
- 先加载依赖，成功后才替换页面
- Vue 先加载；Vuetify、Vue I18n、XML Parser 后续加载
- 依赖有超时和错误处理
- 依赖失败时保留原站页面

### 3.3 移动导航和侧栏

底部导航已从 `App.vue` 移除。快捷入口移动到左侧侧栏。

左侧站点列表保留：

- Yande.re
- Konachan
- Konachan Safe
- Danbooru
- Gelbooru
- Rule34
- Safebooru
- Zerochan
- Pixiv Viewer
- Moeview

Yande.re/Konachan 左侧快捷入口：

- 首页
- 人气作品
- 随机作品
- 图集

Danbooru 左侧快捷入口：

- 首页
- 最多观看
- 最受欢迎
- 热度最高
- 画集

Gelbooru 左侧快捷入口：

- 首页
- 评分最高
- 最近更新
- 画集

### 3.4 分享链接

规范帖子 URL 已实现：

- Yande.re：`https://yande.re/post/show/{id}`
- Konachan：`https://konachan.com/post/show/{id}` 或 `.net`
- Danbooru：`https://danbooru.donmai.us/posts/{id}`
- Gelbooru：`https://gelbooru.com/index.php?page=post&s=view&id={id}`

来源分享支持识别：

- X / Twitter
- Pixiv
- FANBOX
- Fantia
- 其他来源域名

### 3.5 长按基础行为

已禁用 Safari 原生图片长按菜单：

```css
-webkit-touch-callout: none;
-webkit-user-select: none;
```

已实现脚本长按计时、预览遮罩和帖子分享。当前仍需在阶段 3 重构状态机，原因见后文。

### 3.6 设置

已增加：

- “长按立即分享帖子”，默认关闭
- 手机主题切换

用户最终文字要求：

```text
界面主题                         [开关]
切换浅色或深色显示（默认深色开启）
```

开关右侧不得显示“深色”文字。

### 3.7 人气日期基础

Yande.re 手机人气日期显示已改为 `MM-DD`。

已修复 Yande.re 最近人气切换不能改变内容的问题：不再使用 `history.pushState + refreshPosts`，而是跳转完整 URL：

```text
/post/popular_recent?period=1d&_wf=1
/post/popular_recent?period=1w&_wf=1
/post/popular_recent?period=1m&_wf=1
/post/popular_recent?period=1y&_wf=1
```

## 4. 已验证的站点能力

## 4.1 Yande.re

已验证日期查询：

```text
date:2026-07-07
date:2026-06-01..2026-06-03
date:>=2026-06-01 date:<=2026-06-03
```

API 示例：

```text
https://yande.re/post.json?tags=date%3A2026-07-07
```

指定日期人气页面：

```text
/post/popular_by_day?day=7&month=7&year=2026
/post/popular_by_week?day=7&month=7&year=2026
/post/popular_by_month?day=7&month=7&year=2026
```

最近人气：

```text
/post/popular_recent?period=1d
/post/popular_recent?period=1w
/post/popular_recent?period=1m
/post/popular_recent?period=1y
```

## 4.2 Konachan

问题：

- `/post.json` 在服务器测试中被 Cloudflare 返回 403。
- 首页、随机页面曾出现图片完全空白。
- 人气页面可加载，说明站点页面本身可用。

当前修复策略：

- `konachan.com/post` 和 `konachan.net/post` 强制使用同源 HTML 回退。
- 从 HTML 内的 `Post.register(...)` 提取帖子数据。
- 解析器已从简单正则改为逐行解析，避免嵌套 JSON 被截断。

待实机验证：

- 首页
- 随机
- 指定日期
- 周/月/年范围
- `.com` 与 `.net` 都需测试

## 4.3 Danbooru

已确认页面和 JSON：

```text
/explore/posts/viewed.json?date=2026-07-07&scale=day
/explore/posts/viewed.json?date=2026-07-07&scale=week
/explore/posts/viewed.json?date=2026-07-07&scale=month
/explore/posts/viewed.json?date=2026-07-07&scale=year

/explore/posts/popular.json?date=2026-07-07&scale=day
/explore/posts/popular.json?date=2026-07-07&scale=week
/explore/posts/popular.json?date=2026-07-07&scale=month
/explore/posts/popular.json?date=2026-07-07&scale=year
```

已验证 `.json` 返回帖子数组。

注意：测试中 Most Viewed 的不同 scale 前几个结果可能相同，不能只比较第一页前两个 ID 判断参数无效。应使用：

- 页面标题和 URL
- 返回数量
- 前 20 个 ID 集合
- 多个历史日期

Danbooru 其他入口：

```text
首页：/posts
热度最高：/posts?d=1&tags=order:rank
画集：/pools/gallery
```

探索页面数据适配已添加到：

- `src/api/danbooru.ts`
- `src/api/index.ts`
- `src/store/actions/site.ts`

## 4.4 Gelbooru

已确认搜索语法：

```text
sort:score:desc
sort:updated:desc
date:2026-07-07
date:>=2026-07-01 date:<=2026-07-07
```

已确认 Pool 页面：

```text
/index.php?page=pool&s=list
```

Gelbooru 没有 Danbooru 对等的官方“最多观看/最受欢迎”，禁止伪造入口。

日期语义注意：

- `date:` 更可能是帖子发布日期。
- `sort:updated:desc` 是更新时间排序。
- “最近更新 + 日期范围”界面必须标注日期筛选的是发布日期范围，除非进一步确认存在更新时间条件。

## 5. 阶段 1：数据正确性实施记录

当前状态：**阶段 1 已根据用户 Stay 实机反馈正式关闭。阶段 2 的公共状态、能力矩阵、统一移动日期组件和多站路由接入已完成代码与云端构建，等待 Stay 实机验收。**

### 5.0 本阶段交付

- `src/utils/date-filter.ts`：日期范围、移动、显示、未来日期限制和 URL 参数解析。
- `src/utils/site-date-routes.ts`：五站日期能力矩阵与 URL 构建器。
- `src/utils/moebooru-html.ts`：括号深度解析 `Post.register(...)`，避免嵌套 JSON 截断。
- `scripts/verify-site-date-routes.mjs`：日期和 URL 单元测试。
- `scripts/verify-moebooru-html.mjs`：Konachan HTML fixture 测试。
- `scripts/verify-live-date-routes.mjs`：Yande.re、Danbooru、Gelbooru 实时接口抽样。
- `.github/workflows/mobile-build.yml`：CI 增加 `pnpm run verify:dates` 门禁。

验证结果：

- Yande.re `1d/1w/1m/1y` 前 20 个帖子 ID 为 4 个不同集合。
- Yande.re 日期与日期区间实时 API 返回数据。
- Danbooru Viewed、Popular 的周期接口实时返回数据。
- Danbooru 历史 `order:rank` 返回空数组，已按计划降级为 `order:score`，实时返回数据。
- Gelbooru 首页日期、评分日期区间、更新排序日期区间均返回有效 HTML。
- Konachan 服务端和浏览器自动化均遇到 Cloudflare challenge；解析器只能通过 fixture 自动验证，必须由 Stay 实机完成最终门禁。
- GitHub Actions run `29136700283`：lint、日期测试和 build 全部成功。

### 5.1 公共日期工具

文件：`src/utils/date-filter.ts`

已有：

```ts
type DateScale = 'day' | 'week' | 'month' | 'year'
getDateRange(date, scale)
buildDateTags(date, scale)
```

必须补充：

- `shiftDateRange(date, scale, offset)`
- `formatDateDisplay(date, scale)`
- 未来日期限制
- URL 参数解析和恢复
- 时区稳定处理，避免 UTC 导致日期偏移

### 5.2 Yande.re 首页日期

入口需支持：

- 日：`date:YYYY-MM-DD`
- 周：`date:>=start date:<=end`
- 月：同上
- 年：同上

数据验证：

- 每种周期至少选择两个不同历史时间。
- 比较前 20 个帖子 ID 集合。
- URL 中保留日期和周期状态。

### 5.3 Konachan 首页日期和随机

使用 HTML 回退：

- 首页无标签
- 随机：`order:random`
- 日/周/月/年：使用与 Moebooru 相同的日期标签

验证：

- HTML 是否含 `Post.register(`
- 提取帖子数量是否大于 0
- `postView / previewUrl / sampleUrl / fileUrl` 是否有效
- `.com` 和 `.net` 分别验证

若 `Post.register` 在不同页面结构不同：

- 搜索所有无 `src` 的 script
- 按行提取 `Post.register(...)`
- 必要时使用括号深度解析，不使用非贪婪正则截取嵌套对象

### 5.4 Danbooru 日期

#### 首页

```text
/posts?tags=date:YYYY-MM-DD
/posts?tags=date:>=start date:<=end
```

#### 最多观看

```text
/explore/posts/viewed?date=YYYY-MM-DD&scale=day|week|month|year
```

#### 最受欢迎

```text
/explore/posts/popular?date=YYYY-MM-DD&scale=day|week|month|year
```

#### 热度最高

首选：

```text
/posts?tags=order:rank date:>=start date:<=end
```

若历史范围与 `order:rank` 不兼容，降级：

```text
/posts?tags=order:score date:>=start date:<=end
```

#### 画集

不显示帖子日期周期。后续只做：

- 名称搜索
- 最近创建
- 最近更新

### 5.5 Gelbooru 日期

#### 首页

```text
tags=date:YYYY-MM-DD
tags=date:>=start date:<=end
```

#### 评分最高

```text
tags=sort:score:desc date:YYYY-MM-DD
tags=sort:score:desc date:>=start date:<=end
```

#### 最近更新

```text
tags=sort:updated:desc date:YYYY-MM-DD
tags=sort:updated:desc date:>=start date:<=end
```

界面说明必须明确：日期按发布日期范围过滤，再按更新时间倒序。

#### 画集

不显示帖子日期周期。

### 5.6 阶段 1 自动验证脚本

应新增：

```text
scripts/verify-site-date-routes.mjs
```

验证内容：

- URL 构建结果
- 日期范围计算
- 周起止日期
- 月末和闰年
- 每站能力矩阵
- Danbooru Explore JSON 转换
- Konachan HTML fixture 解析

不直接依赖实时站点作为唯一 CI 测试，避免 Cloudflare 和网络波动。实时接口验证作为手动验收脚本单独运行。

### 5.7 阶段 1 完成状态

已满足：

- lint 成功
- build 成功
- 自动 URL/日期测试成功
- Yande.re、Danbooru、Gelbooru 实时接口抽样成功
- Konachan / Konachan Safe 首页与随机在 Stay 实机确认可加载
- 用户确认 Yande.re / Konachan 火焰模式属于最近周期语义

阶段 1 已关闭，进入阶段 2。

## 6. 阶段 2：统一日期组件（当前阻塞，禁止进入阶段 3）

### 6.0 2026-07-11 实机失败记录

阶段 2 **不能视为完成**。虽然路由、状态解析、lint、自动测试与 build 均通过，但 Stay 实机持续出现以下阻断问题：

1. **Yande.re / Konachan 日期面板只显示标题**
   - 弹层能显示“选择日期”和 `July 2026`。
   - 星期、日期网格完全为空白。
   - Danbooru 曾在旧结构中显示完整月历，但统一组件改造后同样可能出现空白。
   - 多次调整 `.ios-date-sheet`、`full-width`、`min-height`、`overflow`、延迟挂载均未解决。

2. **Danbooru 自定义范围不可用**
   - 代码中存在 `rangeStart / rangeEnd`、范围路由和双 `v-date-picker`。
   - 实机界面没有形成稳定可操作的开始/结束日期选择流程。
   - 不能标记为已实现。

3. **顶部遮挡问题只部分修复**
   - 已删除重复/禁用的下一周期按钮占位，并取消 `.mobile-date-filter` 的 `overflow:hidden`。
   - 仍需在不同日期长度、周跨月范围和小屏设备上验证不会覆盖全屏/设置按钮。

4. **悬浮搜索已接入但未完成实机验收**
   - `MobileSearchFab.vue` 已接入公共 `store.showMobileSearch`。
   - 需要确认按钮显示条件、Safari 底栏避让、搜索面板打开和隐藏状态。

### 6.0.1 已尝试但失败的路径

以下路径禁止不经分析机械重复：

- 在 `.v-date-picker-table` 上强制 `min-height`：会破坏 Vuetify 内部行高，日期网格消失。
- 单纯给 `v-date-picker` 添加 `full-width`：Y/K 仍只显示月份标题。
- 在 `v-dialog` 内延迟一帧挂载日期选择器：无效。
- 反复切换外层 `overflow:auto/visible/hidden`：没有解决根因。
- 把原本工作在 Danbooru 的日期选择器直接嵌入统一 Sheet：不同站点表现仍不一致。

### 6.0.2 下一位执行者必须先做的诊断

1. 用 Safari Web Inspector 或临时调试样式读取空白状态下：
   - `.v-picker` 实际高度
   - `.v-date-picker-table` 实际高度
   - `table/tbody/tr` 的 `display`、高度和可见性
   - 是否被项目早期全局日期 CSS 覆盖
2. 重点审查 `src/styles/custom.css` 第 218 行附近的全局规则：
   - `.v-date-picker-table>table>thead>tr>th`
   - 使用 `:before` 替换星期文字的规则
   - 这些旧规则可能与 Vuetify 当前渲染结构或 iOS WebKit 冲突
3. 建立最小隔离组件：
   - 页面只挂载原生 `<v-dialog><v-date-picker /></v-dialog>`
   - 不使用 `.ios-date-sheet`、不使用项目日期 CSS
   - 先在 Stay 验证完整月历，再逐条恢复样式
4. 若 Vuetify 在 Stay 中仍不稳定，停止使用 `v-date-picker`，改为自建轻量日历：
   - 原生 `input[type=date]` 可作为最低风险基线
   - 或用 7×6 CSS Grid 自绘月历，不依赖 Vuetify 内部高度计算
5. 自定义范围应在单日期稳定后实现：
   - 第一步选择开始日期
   - 第二步选择结束日期
   - 同一个稳定日历复用两次，不要同时渲染两个 Vuetify 月历
   - 仅 Y/K 首页、Danbooru 首页、Danbooru 历史高分开放范围

### 6.0.3 当前相关文件

- `src/components/MobileDateFilter.vue`
- `src/store/date-filter.ts`
- `src/utils/date-filter.ts`
- `src/utils/parse-date-route.ts`
- `src/utils/site-date-routes.ts`
- `src/config/site-capabilities.ts`
- `src/styles/custom.css`
- `src/components/MobileSearchFab.vue`

当前最后一次成功构建：Actions run `29141774444`，提交 `01cb3e0`。**构建成功不代表日期 UI 可用。**

### 6.0.4 2026-07-11 自绘月历修复候选（等待 Stay 验收）

为绕开 Stay 中 Vuetify `v-date-picker` 只显示月份标题、日期网格为空白的问题，提交 `b9b7dca` 完成以下修改：

- 新增 `src/components/MobileCalendarGrid.vue`，使用固定 7×6 CSS Grid 渲染单月历，不依赖 Vuetify 日期表格内部高度计算。
- Yande.re、Konachan 与 Danbooru 的日/周日期选择统一改用自绘月历。
- 自定义范围改为同一个月历分两步选择：先开始日期，再结束日期；选择完整后才允许“查看结果”。
- 月份选择使用原生 `input[type=month]`，年份继续使用轻量按钮网格。
- 删除 `custom.css` 中全局覆盖 `.v-date-picker-table` 星期表头并用 `:before` 注入文字的旧规则，避免继续影响 Vuetify DOM。
- 未添加 `full-width`、日期表格 `min-height` 或 overflow 补丁，未同时渲染两个日期选择器。

验证状态：

- 无依赖日期路由、路由解析与 Konachan HTML fixture 测试通过。
- GitHub Actions run `29142352766` 成功，包含依赖安装、lint、`verify:dates` 和 build；artifact 已生成。
- 本地完整 pnpm 验证因新克隆工作区在当前 iSH pnpm 中未识别项目而未执行，云端 CI 已完成等价门禁。
- **尚未通过 Stay 实机验收**：月历网格可见性、日期选择后的 URL/顶部显示/帖子一致性、自定义范围结果、顶部遮挡和悬浮搜索均待确认。
- 阶段 2 继续保持阻塞，禁止进入阶段 3、阶段 4。

### 6.1 组件设计

新增：

```text
src/components/MobileDateFilter.vue
src/store/date-filter.ts
src/config/site-capabilities.ts
```

状态：

```ts
interface DateFilterState {
  mode: 'latest' | 'date'
  scale: 'day' | 'week' | 'month' | 'year'
  date: string
  routeKind: 'home' | 'popular' | 'viewed' | 'ranked' | 'updated'
}
```

### 6.2 交互

统一显示：

```text
[最近｜日期] [日｜周｜月｜年] ‹ 07-07 ›
```

规则：

- 日显示 `MM-DD`
- 周显示 `MM-DD ~ MM-DD`
- 月显示 `YYYY-MM`
- 年显示 `YYYY`
- 点击日期打开日历
- 左右箭头按周期移动
- 禁止未来时间
- URL 可恢复状态

### 6.3 能力矩阵

按站点和页面决定是否显示：

- Y/K 首页：日期
- Y/K 人气：最近 + 日期
- Danbooru 首页：日期
- Danbooru Viewed/Popular：日期 + 四周期
- Danbooru Ranked：日期 + 四周期
- Gelbooru 首页/评分/更新：日期 + 四周期
- Pool 页面：不显示

### 6.4 路由构建器

新增统一函数：

```ts
buildDateRoute(site, routeKind, state)
```

组件不得直接拼接站点 URL。

## 7. 阶段 3：触摸与详情稳定性实施计划

### 7.1 长按状态机

目标流程：

```text
idle → pressing → previewing → sharing → restoring → idle
```

用户要求：

- 360ms 左右进入长按
- 图片放大、背景模糊
- 分享面板出现期间图片保持放大
- 用户完成或取消分享后才恢复
- 不误触普通单击
- 各站点和所有布局行为一致

当前问题：

- 预览可能在 `navigator.share()` 前被清除。
- 不同 `<img>` / `<v-img>` / virtual / justified 绑定不同。

改造方案：

- 新增统一 `MobilePostCard` 或透明触摸层。
- 长按事件绑定卡片外层。
- `await sharePost(post)` 完成后再清空预览。
- `touchend` 中调用 `navigator.share()`，保持用户激活。
- 分享期间锁定滚动。
- 使用 pointer/touch 状态阻止 click。

### 7.2 详情闪黑与位移

原因候选：

- `v-dialog` 锁定/恢复滚动
- 图片 loading 状态重置
- 瀑布流重新计算
- 缩略图重新解码

修复：

- 打开详情前记录 `scrollY`
- 记录卡片 rect 和图片 aspect ratio
- 列表组件保持挂载
- 关闭详情时延迟卸载遮罩
- 关闭动画结束后恢复 scrollY
- 图片卡片固定 aspect ratio
- 详情图加载时显示缩略图占位
- 只有图片 ID 改变才重置 loading

### 7.3 阶段 3 验收

- 连续打开关闭 20 张图片无黑帧
- 返回位置误差小于一个卡片间距
- 长按 20 次无误触普通点击
- 分享完成/取消后预览正确恢复
- 四站行为一致

## 8. 阶段 4：iOS UI 重构实施计划

### 8.1 原则

- 不再使用 MD3 视觉语言
- 不使用夸张彩色圆 FAB
- 不使用强阴影和涟漪
- 使用 iOS 系统字体和语义色
- 深浅主题分别完整设计

### 8.2 语义色

深色：

```css
--system-background: #000000;
--secondary-system-background: #1c1c1e;
--tertiary-system-background: #2c2c2e;
--label: #ffffff;
--secondary-label: #98989d;
--separator: rgba(84,84,88,.65);
```

浅色：

```css
--system-background: #f2f2f7;
--secondary-system-background: #ffffff;
--tertiary-system-background: #f2f2f7;
--label: #000000;
--secondary-label: #6c6c70;
--separator: rgba(60,60,67,.29);
```

### 8.3 需要覆盖的组件

- 顶部栏
- 左侧站点抽屉
- 右侧设置抽屉
- 搜索面板
- 日期组件
- 菜单
- Snackbar
- 开关
- 输入框
- 图片详情操作栏
- 长按预览
- 加载/空状态/错误状态

### 8.4 主题设置最终文本

```text
界面主题                         [开关]
切换浅色或深色显示（默认深色开启）
```

不得在开关右侧显示“深色”。

## 8.6 阶段 4 当前真实问题与 AI 执行说明（2026-07-11）

以下内容是给后续 AI / 代理直接执行的交接说明。**以用户最新截图为准，不要相信早先“已完成”的口头结论。**

### A. 用户当前真实要求

#### 顶栏
用户要的是：

- 左：菜单按钮，独立悬浮
- 中：**一个整体的圆角玻璃胶囊**
  - 全部模式：只显示 `[网格][日期]`
  - 日期模式：动态增长为 `[网格/日期][周期][左箭头][日期][右箭头]`
  - 箭头必须完全处于胶囊边界内
  - 这是一个整体背景，不是多个独立透明按钮
- 右：全屏、设置，独立悬浮
- 顶栏整条横向背景尽量透明，能看到下面图片内容
- 灵动岛/时间附近网页区域不应再额外铺黑色条

#### 详情查看页
用户明确不要：

- 大图毛玻璃背景
- 当前图片放大铺满作为背景
- 关闭时状态栏或背景突然变黑

用户要的是：

- 主图居中、圆角、左右留白
- 底部操作栏居中、左右对称、可半透明毛玻璃
- 背景只要**透明或轻微暗色透明层**，不要大图环境背景
- 打开和关闭详情时不要黑屏闪烁

### B. 当前已确认的错误实现

1. **主页中间胶囊曾被错误拆成多个独立透明按钮**
   - 正确做法是一个整体玻璃框，只包裹实际内容
   - 不要再给内部单个按钮单独加外层玻璃

2. **详情背景曾持续注入当前图片作为全屏背景**
   - 根因是 `PostDetail.vue` 中的 `detailAmbientSnapshot / detailAmbientStyle / detail-ambient-bg`
   - 这部分必须彻底移除，不要继续保留图片 URL 注入逻辑

3. **详情开关闪烁根因主要来自 `v-dialog` 黑底与背景层时序冲突**
   - 打开：`v-dialog` 先出现，背景/主图后出现
   - 关闭：背景或主图先消失，暴露黑底
   - 不应继续在这套层级上做补丁式修复

### C. 强制执行约束

- **不要**再使用大图毛玻璃背景方案
- **不要**再注入 `background-image` 到详情背景层
- **不要**再把顶栏中间胶囊拆成多个独立玻璃按钮
- **不要**在未验证前宣称“已完成”
- 修改时优先保持：
  - 日期路由逻辑不变
  - 长按状态机不变
  - 分享互斥逻辑不变
  - 四站数据获取逻辑不变

### D. 推荐实现方案

#### D1. 顶栏

目标结构：

```text
[菜单按钮]   [一个整体玻璃胶囊：模式/周期/箭头/日期]   [全屏] [设置]
```

实现原则：

- `.v-app-bar` 透明，只做定位
- 中间胶囊使用 `inline-flex` 或 `width: fit-content`
- 全部/最近模式按内容宽度显示
- 日期模式允许动态增长，但不铺满整行
- 右侧留空区域完全透明
- 菜单、全屏、设置保持独立悬浮按钮

#### D2. 移动端详情页

**推荐直接为移动端实现自定义 fixed overlay，不再依赖 `v-dialog` 作为主容器。**

建议结构：

```html
<div class="mobile-detail-overlay" v-if="store.showImageSelected">
  <div class="mobile-detail-backdrop"></div>
  <div class="mobile-detail-content">
    <img class="mobile-detail-image" />
  </div>
  <div class="mobile-detail-nav">...</div>
</div>
```

原则：

- 背景层只允许：
  - `rgba(8,9,12,.18~.28)`
  - 可选极轻微 `backdrop-filter`
- **不允许使用当前图片作为背景图**
- 主图单独居中，左右留白，圆角 16~18px
- 底部操作栏独立玻璃胶囊，左右对称

#### D3. 详情开关动画

只对主图和底部栏做动画：

- 打开：`opacity 0 -> 1`，`scale(.985) -> 1`
- 关闭：`opacity 1 -> 0`，`scale(1) -> .985`
- 背景层保持稳定，不做淡入淡出或缩放
- overlay 最后一帧再卸载
- 图片邻近刷新必须在 overlay 完全关闭后触发

### E. 推荐提交顺序

1. `mobile: replace mobile detail dialog with fixed overlay`
2. `mobile: remove ambient image background from detail`
3. `mobile: stabilize detail open close transition`
4. `mobile: refine unified date glass capsule`
5. `mobile: expose content behind transparent top bar`

### F. 必测矩阵

每次修改后都要在 Stay 实机验证：

1. 首页全部模式顶栏
2. 日期模式顶栏
3. 横图详情
4. 纵图详情
5. 打开/关闭同一张图 10 次
6. 连续切换前后图片
7. Yandere / Konachan / Konachan Safe / Danbooru / Gelbooru 各测一次

重点观察：

- 顶栏中间胶囊是否整体动态增长
- 箭头是否出框
- 顶栏透明区是否能看到底下图片
- 详情是否仍出现放大背景图
- 开关详情是否仍闪黑
- 状态栏附近是否突然变黑
- 主图左右边距与圆角是否稳定
- 底部操作栏是否严格左右对称

### G. 当前阶段判断

- 阶段 4 仍未完成
- 当前文档中的部分“已完成”只表示代码曾尝试实现，不代表最新实机状态正确
- 若与最新截图冲突，以最新截图为准


- iOS 深色和浅色均无 MD3 强特征
- 文本对比度足够
- Safe Area 正确
- 所有按钮点击区域至少 44×44
- 侧栏和设置项使用分组列表
- 开关颜色、分隔线、背景层级一致
- 无白闪、黑闪、主题切换残留色

## 9. 已知问题与禁止回归

### 9.0 当前最高优先级阻塞

- 阶段 2 日期 Sheet 在 Stay 中只显示月份标题，日期网格为空白。
- Danbooru 自定义日期范围尚不可操作。
- 不得因为 CI/build 成功而宣称日期 UI 完成。
- 下一位执行者必须先完成最小隔离日历诊断，或改用原生/自绘日历。

### 9.1 不得重新引入

- `document-start` + 全页隐藏
- 长按分享图片 CDN URL
- 底部导航占据图片空间
- 列表右下角刷新 FAB
- 详情右上角重复分享按钮
- 手机顶部主题按钮
- 侧栏无关站点和关于区域

### 9.2 仍需解决

- Konachan HTML 回退实机验证
- Danbooru/Gelbooru 日期组件尚未接入
- 长按预览未保持到分享结束
- 详情关闭闪黑和位置移动
- 浅色主题覆盖不完整
- 当前 iOS CSS 只是过渡层，不是最终 UI

## 10. 关键文件

```text
header.config.js                         用户脚本元数据
src/prepare.ts                           启动与依赖加载
src/App.vue                              根布局
src/components/AppBar.vue                顶部、人气日期、搜索、沉浸
src/components/NavDrawer.vue             左侧快捷入口和站点列表
src/components/SettingsDrawer.vue        右侧设置
src/components/PostList.vue              瀑布流、长按、加载
src/components/PostDetail.vue            图片详情、来源分享
src/components/ImmersiveExit.vue          沉浸退出
src/store/actions/post.ts                 帖子加载状态
src/store/actions/site.ts                 站点数据动作路由
src/store/settings.ts                     用户设置
src/api/moebooru.ts                       Yande.re/Konachan
src/api/danbooru.ts                       Danbooru
src/api/gelbooru.ts                       Gelbooru
src/api/booru.ts                          通用 Booru 查询
src/utils/share.ts                        帖子/来源分享
src/utils/date-filter.ts                  日期范围工具
src/styles/custom.css                     当前样式
.github/workflows/mobile-build.yml        云端构建发布
docs/MOBILE_SAFARI_ACCEPTANCE.md          验收清单
```

## 11. 新对话启动指令

新对话中直接使用：

```text
继续 aiza2a/yandere-masonry 的 mobile-safari 改造。
先读取 docs/MOBILE_SAFARI_IMPLEMENTATION_PLAN.md 和 docs/MOBILE_SAFARI_ACCEPTANCE.md。
严格按阶段门禁执行，当前从阶段 1 数据正确性继续，不进入阶段 2。
```

## 12. 清理计划

用户已允许安装 Node/npm/pnpm，但要求最终确认可行后清理。

在用户最终验收前不得清理。最终清理范围：

- Alpine `nodejs`、`npm`
- 全局 pnpm
- `/root/yandere-masonry-build`
- npm/pnpm 缓存
- `/var/minis/workspace/push_mobile.py`
- `/var/minis/workspace/push_files_small.py`
- 其他仅为本项目构建产生的临时文件

不得删除：

- `/var/minis/workspace/booruwf_review/masonry`
- 最终 `.user.js`
- 仓库文档
- 用户附件
