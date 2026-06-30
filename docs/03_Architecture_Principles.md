# 03 Architecture Principles

Version: 1.0

Status: Active

Owner: William

Related Documents:

- 01_Project_Overview.md
- 02_System_Architecture.md

---

# Purpose

本文件记录 4D AI Web 的长期 Architecture Principles。

这些原则用于指导 Web、Flutter App、Backend、Cloudflare、Supabase 与 Shared Data 相关开发。

本文件关注长期架构原则，不记录暂时性 UI 决策、产品配置或单次功能取舍。

---

# Principle 001

## Web、Flutter App、Backend 独立维护

4D AI 包含 Web、Flutter App 与 Backend 三个独立项目。

三个项目应独立开发、独立维护、独立发布，并保持独立 Git 工作流程。

不要为了方便，在未经明确授权的情况下跨项目修改。

---

# Principle 002

## Web 与 App 共用帐号，但 Frontend 独立

Web 与 Flutter App 可以共享帐号与部分用户资料。

可以共享：

- Supabase Auth
- User Profile
- Subscription
- Favourite Numbers
- AI Recommendation
- User Settings

不共享：

- Frontend
- UI Components
- Page Structure
- Client-side Business Logic

Web 不是 Flutter App 的网页版本。

Flutter App 也不是 Web 的移动包装。

---

# Principle 003

## Latest Results 来源为 Cloudflare Provider JSON

Latest Results 属于高频读取资料。

Web 默认读取 Cloudflare Provider JSON。

不要让 Web 直接依赖 Backend Database 作为 Latest Results 的主要来源。

这样可以保持：

- 全球 CDN 速度
- Backend 负载较低
- Web 与 App 数据来源一致
- Provider 输出契约稳定

---

# Principle 004

## Provider JSON Contract 不应由 Web 修改

Provider JSON Contract 属于数据发布层与消费层之间的契约。

Web 是 Provider JSON 的消费者，不应为了单一页面便利而改写 Provider JSON Contract。

如果 Provider JSON Contract 需要改变，应先设计、记录、评估影响，再修改 Backend / Publisher 与所有消费端。

---

# Principle 005

## Shared Authentication 使用 Supabase

Web 与 Flutter App 的 Shared Authentication 使用 Supabase Auth。

会员状态、用户资料与跨设备同步资料应围绕统一帐号体系设计。

涉及 Authentication 或 Subscription 的修改，默认属于高风险修改。

---

# Principle 006

## Shared Data 必须先设计

任何新增 Shared Data 都应先定义：

- Ownership
- Source of Truth
- Read Path
- Write Path
- Cache Strategy
- Failure Behavior
- Consumer Impact

不要在 Web、Flutter App、Backend 之间临时复制资料结构，避免长期耦合。

---

# Principle 007

## Backend、Cloudflare、Shared Data 默认先 Read-only 再修改

当开发涉及以下范围时：

- Backend
- Cloudflare
- Supabase
- Provider JSON
- Shared Data
- Production Deployment

默认先进行 Read-only 检查。

确认 source of truth、影响范围与当前状态后，再决定是否修改。

---

# Principle 008

## 默认采用 Small Commits

长期维护需要清楚 Git History。

不同主题应拆成不同 commit。

建议分开：

- UI 修改
- Dev Tool 修改
- Documentation 修改
- Architecture 修改
- Backend / Data 修改

这样有利于 review、rollback 与 release tracking。

---

# Principle 009

## 默认使用 npm run dev:clean

如果项目提供：

npm run dev:clean

本地 Next.js 开发与验证时，应优先使用该命令。

该流程用于减少 stale cache、webpack runtime、vendor-chunks 与 dev server 残留问题。

如果 dev:clean 不可用，再使用标准 npm run dev。

---

# Principle 010

## 长期设计应记录于 docs

长期设计原则、架构边界、数据契约与发布流程，应记录在 docs。

不要只依赖聊天记录、临时说明或个人记忆。

docs 是未来开发者、Codex、GPT 与 William 自己维护项目时的长期 source of truth。

---

# Principle 011

## UI 或产品配置不属于长期架构原则

以下内容不应记录为 Architecture Principle：

- 单个组件的位置
- 单个工具是否显示
- 临时页面布局
- 短期产品策略
- 一次性 UI 调整

这些内容可以记录在产品文档、设计文档、release note 或具体 issue 中。

---

# Summary

4D AI Web 的长期架构原则是：

Web、Flutter App、Backend 独立维护。

共享帐号。

共享部分资料。

不共享前端。

Latest Results 读取 Cloudflare Provider JSON。

Authentication 使用 Supabase。

Provider JSON Contract 不由 Web 临时修改。

高风险范围先 Read-only 再修改。

默认 Small Commits。

默认使用 dev:clean。

长期知识记录于 docs。
