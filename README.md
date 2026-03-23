# Peach 2026 — 互动绘本画册制作 SOP

> 桃子小三班 AI 体验课 · 互动绘本网页
> 线上地址：[peach2026.vercel.app](https://peach2026.vercel.app)

---

## 这是什么？

一套**可复用的互动绘本画册制作流程**。从课程脑暴到最终上线，全流程由 AI 协作完成。

本项目是第一个实例：为幼儿园小朋友制作的 AI 体验课互动绘本，老师在课堂上投屏翻页讲课。

## 项目结构

```
peach2026/
├── index.html                 # 主页面（自研轻量翻页器）
├── css/theme.css              # 视觉主题（Bluey 风格）
├── js/app.js                  # 交互逻辑（翻页/提示/全屏）
├── public/images/             # 全部插画素材（AI 生成）
├── scripts/
│   └── generate-images.js     # 批量图片生成脚本（含全部 prompt）
├── docs/
│   ├── course-outline.md      # 课程大纲（脑暴输出）
│   ├── design-spec.md         # 设计规格（页面结构+动效）
│   ├── style-dna.md           # 风格 DNA（色板+质感+prompt 后缀）
│   └── characters-reference.jpg  # 角色参考图
├── vercel.json                # Vercel 部署配置
└── README.md                  # 本文件
```

---

## 制作 SOP（可复用流程）

### Phase 0：脑暴 → 课程大纲

**输入**：主题想法、目标受众、时长要求
**输出**：`docs/course-outline.md`

1. 和爸爸对话，明确核心理念（本项目：不教概念，只让孩子体验）
2. 确定环节递进逻辑（认识→提问→编故事→画画→视频→约定）
3. 每个环节细化：
   - 老师台词（逐字稿级别）
   - 互动引导话术
   - 备用问题/素材池（冷场应急）
   - 时间分配
4. 输出完整课程大纲 markdown

**关键原则**：大纲要细到「老师照着念就能上课」的程度。

### Phase 1：风格定义 → Style DNA

**输入**：参考风格（如 Bluey、Pixar、水彩风等）
**输出**：`docs/style-dna.md`

1. 确定视觉风格参考（本项目：Bluey / Ludo Studio）
2. 定义 6 个维度：
   - Shape Language（形状语言）
   - Linework（线条风格）
   - Lighting & Shadows（光影）
   - Background（背景处理）
   - Texture（质感）
   - Color Palette（色板，具体 hex 值）
3. 编写 **Prompt Suffix**：一段固定后缀文本，附在每张图的 prompt 后面，确保风格统一
4. 如有角色，制作角色参考图并定义文字描述

**Prompt Suffix 模板**：
```
Style: [风格参考]. Shape language [形状特征]. Linework [线条规则].
Lighting [光照]. Shadows [阴影规则]. Background [背景处理].
Texture [质感]. Color palette [色板hex值]. Mood: [情绪关键词].
[尺寸规格].
```

### Phase 2：页面规划 → Design Spec

**输入**：课程大纲 + Style DNA
**输出**：`docs/design-spec.md`

1. 将大纲每个环节拆成具体页面（每页 = 1 个重点句 + 1 张插画）
2. 用表格列出每页的：
   - 页码 / ID
   - 主文字（绘本上显示的大字）
   - 插图描述（给 AI 画的场景描述）
   - 老师提示（隐藏的引导话术）
   - 动效建议
3. 确定总页数、章节划分
4. 确定交互方式（翻页、提示、全屏等）
5. 确定技术方案（本项目：纯静态 HTML，无框架依赖）

### Phase 3：生成脚本 → Batch Image Generation

**输入**：Design Spec 的页面表格 + Style DNA + 角色参考图
**输出**：`scripts/generate-images.js` + `public/images/*.png`

1. 将每页的插图描述转化为精确的 image prompt
2. 角色一致性处理：
   - 有角色的页面：附上角色参考图（base64）+ 角色文字描述
   - 无角色的页面：纯场景 prompt
3. 每条 prompt = **场景描述** + **Style DNA Prompt Suffix**
4. 编写批量生成脚本：
   - 检测已有图片，跳过不重复生成
   - 限速（每张间隔 3 秒）
   - 支持多种 API 响应格式
   - 输出日志（成功/失败/文件大小）
5. 运行脚本，检查生成结果

**图片生成 API 配置（本项目）**：
- 模型：`gemini-3-pro-image-preview`（通过 LiteLLM 代理）
- 尺寸：16:9 横版（适配投屏）
- 格式：PNG

**Prompt 编写技巧**：
- 主角描述要具体到服装颜色、发型、表情
- 场景要包含情绪氛围词（cozy, magical, warm）
- 动作要明确（waving, pointing, sitting on）
- 避免抽象指令，用具象描述

### Phase 4：页面开发 → Interactive Storybook

**输入**：Design Spec + 生成的图片
**输出**：`index.html` + `css/theme.css` + `js/app.js`

1. HTML 结构：每页一个 `.slide` div，`data-bg` 指向图片路径
2. CSS 主题：
   - 全屏背景图 + 底部渐变文字区
   - 顶部章节标签 HUD
   - 底部控制栏（翻页/页码/提示/全屏）
   - 老师提示浮层
   - 竖屏提示（请横屏查看）
   - 响应式适配
3. JS 交互：
   - 键盘翻页（←→空格）
   - 触屏滑动翻页
   - 左右点击区域翻页（适合投屏触控）
   - 老师提示开关
   - 全屏切换
   - 进度条
   - 视频占位 toast

### Phase 5：检查 → 发布

**输入**：完整项目
**输出**：线上可访问链接

1. 本地预览通览全部页面
2. 对照课程大纲逐项检查：
   - 文案是否对齐
   - 插画风格是否统一
   - 交互是否正常
   - 老师提示是否准确
3. Git commit + push
4. Vercel 自动部署（GitHub 关联）
5. 验证线上版本

---

## 复用指南：做一本新画册

要做新主题的画册，按以下步骤：

### 1. 复制项目骨架
```bash
cp -r peach2026 my-new-book
cd my-new-book
rm -rf public/images/*.png  # 清空旧图片
rm -rf .git && git init     # 新的 git 历史
```

### 2. 替换内容
- 改 `docs/course-outline.md`（新主题大纲）
- 改 `docs/style-dna.md`（如需新风格）
- 改 `docs/design-spec.md`（新页面规划）
- 改 `scripts/generate-images.js` 的 SLIDES 数组（新 prompt）
- 改 `index.html` 的 slide 结构

### 3. 生成 + 部署
```bash
node scripts/generate-images.js  # 批量生成图片
# 检查后
git add -A && git commit -m "init" && git push
# Vercel 自动部署
```

---

## 技术细节

### 图片生成 API
- **Base URL**: `https://litellm.vllm.yesy.dev/v1`
- **模型**: `gemini-3-pro-image-preview`（高质量）/ `gemini-3.1-flash-image-preview`（快速）
- **角色一致性**: 通过 base64 参考图 + 文字描述实现

### 部署
- **GitHub**: `david-srp/peach2026`
- **Vercel**: 静态部署，push 后自动发布
- **域名**: `peach2026.vercel.app`

### 交互快捷键
| 快捷键 | 功能 |
|--------|------|
| ← → | 翻页 |
| 空格 | 下一页 |
| H | 切换老师提示 |
| F | 切换全屏 |

---

## 本项目时间线

| 时间 | 里程碑 |
|------|--------|
| 2026-03-22 23:30 | 课程脑暴 + 大纲定稿 |
| 2026-03-23 01:00 | Style DNA + Design Spec |
| 2026-03-23 02:00 | 页面骨架 + 首批 7 张图 |
| 2026-03-23 02:40 | v1 上线（部分图片） |
| 2026-03-23 10:15 | 交互升级（控制栏/HUD/提示面板） |
| 2026-03-23 10:25 | 30 张缺失图片批量补全（30/30 成功） |
| 2026-03-23 10:55 | v2 全量发布 |
| 2026-03-23 11:15 | v2.1 修 bug（HUD同步/视频toast/布局） |
| 2026-03-23 13:30 | v2.2 UI 微调（控制栏遮挡/标题去重） |

---

_Made with ❤️ by 淘气汀 🚗_
