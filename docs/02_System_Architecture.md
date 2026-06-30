# 02 System Architecture

Version: 1.0

Status: Active

Owner: William

Related Documents:

- 01_Project_Overview.md

---

# Purpose

本文件定义 4D AI Web 的整体系统架构。

所有涉及 Web、Flutter App、Backend、Cloudflare、Supabase 的开发，都应遵循本文件。

---

# Overall Architecture

```text
                   User
                     │
                     ▼
         Cloudflare CDN + Edge Network
                     │
                     ▼
      Cloudflare Workers (OpenNext)
                     │
                     ▼
            Next.js Application
             ┌───────────────┐
             │               │
             ▼               ▼
 Cloudflare Provider JSON   Supabase
             │               │
             ▼               ▼
      Latest Results    Auth / Subscription
```

---

# Deployment Runtime

Production Runtime:

Cloudflare Workers (OpenNext)

Build Tool:

opennextjs-cloudflare

Deploy Command:

npm run cf:deploy

Deployment Configuration:

wrangler.toml

---

# Project Separation

系统分成三个独立项目：

## 1. Web

负责：

- Website
- SEO
- Landing Pages
- Tools
- AI Interface

位置：

C:\Users\William\Documents\4D AI Web

---

## 2. Flutter App

负责：

- Mobile Experience
- Offline Package
- Native Features
- Push Notification

位置：

C:\Users\William\Documents\4d AI

---

## 3. Backend

负责：

- Polling
- Publishing
- Provider Processing
- Cloudflare JSON
- Data Synchronization

位置：

C:\Users\William\Documents\4d AI safe backup 2026-05-10\4d-polling

---

# Shared Components

Web 与 Flutter App 可以共享：

- Supabase Auth
- User Profile
- Subscription
- Favourite Numbers
- AI Recommendation
- User Settings

Frontend 不共享。

---

# Data Sources

## Latest Results

来源：

Cloudflare Provider JSON

Web 不应直接改写 Provider JSON。

---

## History

目前：

Flutter App 使用 Local Pack。

不要为了 Web 改成直接查询 Supabase。

---

## Authentication

Supabase Auth。

Web 与 Flutter App 共用帐号。

---

## Subscription

Supabase。

统一会员状态。

---

# Architecture Principles

1. Web、App、Backend 独立维护。
2. 不为了方便修改其他项目。
3. 不改变 Provider JSON Contract。
4. 新增共享资料必须先设计。
5. 优先保持长期稳定，而不是短期方便。

---

# High Risk Components

以下属于高风险：

- grand_dragon
- nine_lotto
- Provider JSON
- Latest Results
- Subscription
- Authentication

修改前必须进行影响评估。

---

# Development Rule

如果开发涉及：

- Backend
- Cloudflare
- Supabase
- Shared Data

应先进行 Read-only 检查。

确认影响范围后再修改。

---

# Future Architecture

未来预计加入：

- AI API
- Payment
- Admin Portal
- Analytics
- Affiliate System

这些功能应保持与现有架构兼容。

---

# Summary

4D AI Web 采用：

Web

+

Flutter App

+

Backend

三项目独立维护。

共享帐号。

共享部分资料。

不共享前端。

所有新增开发都应遵循此架构。
