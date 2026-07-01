# 4D AI Web

Version: 1.0

---

# Project Overview

4D AI Web 是 4D AI 产品生态中的官方网站。

它不是 Flutter App 的网页版本，而是一个独立维护的 Web Frontend。

Web 与 Flutter App 共用用户帐号及部分数据，但两个前端必须独立开发、独立维护、独立发布。

---

# Vision

建立一个现代化、快速、安全、可长期维护的 4D Lottery Web 平台。

未来将提供：

- Latest Results
- History Search
- AI Recommendation
- Favourite Numbers
- Hot & Cold Analysis
- Trend Analysis
- Package Ranking
- Membership
- Cross-device Sync

---

# Project Goals

本项目目标：

- 快速载入
- SEO 友善
- Mobile First
- 全球 CDN 部署
- 与 Flutter App 共用帐号系统
- 长期可维护

本项目不是：

- Flutter App Web Export
- Backend Server
- Data Polling System
- Cloudflare Publisher

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Authentication

- Supabase Auth

## Deployment

- Cloudflare Workers (OpenNext)

## Source Control

- GitHub

## AI

- OpenAI
- Future AI Services

---

# Repository Structure

## Web

C:\Users\William\Documents\4d AI Web

## Flutter App

C:\Users\William\Documents\4d AI

## Backend

C:\Users\William\Documents\4d AI safe backup 2026-05-10\4d-polling

三个项目独立维护。

除非明确授权，否则不要跨项目修改。

---

# High Level Architecture

```
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

# Responsibility

## Web

负责：

- Website UI
- SEO
- Landing Pages
- Member Pages
- Tools
- AI Interface

---

## Flutter App

负责：

- Mobile Experience
- Native Features
- Offline Package
- Push Notification

---

## Backend

负责：

- Polling
- Publishing
- Provider Data
- Cloudflare JSON
- Database Synchronization

---

# Data Sources

## Latest Results

来源：

Cloudflare Provider JSON

---

## History

来源：

30-day Local Pack

---

## Authentication

来源：

Supabase

---

## Subscription

来源：

Supabase

---

## AI

来源：

未来 AI API

---

# Design Principles

整个网站遵循以下原则：

1. Simple

保持简单。

2. Fast

速度优先。

3. Readable

代码容易阅读。

4. Reusable

组件尽量重复利用。

5. Safe

默认不要影响 Flutter App 与 Backend。

---

# Development Principles

开发时：

优先：

小步修改。

Build。

检查。

Commit。

不要一次修改多个系统。

如果涉及：

- Backend
- Supabase
- Cloudflare
- Shared Data

先设计。

后修改。

---

# Release Workflow

Development

↓

Build

↓

Human Review

↓

Commit

↓

Push

↓

Cloudflare Workers Deployment (OpenNext)

↓

Production Verification

---

# Documentation

docs 目录用于保存整个项目的重要知识。

包括：

- Project Overview
- Architecture
- API Contracts
- UI Design
- Coding Standards
- Deployment
- Troubleshooting
- Product Roadmap

所有长期设计原则，都应记录在 docs，而不是散落于聊天记录。

---

# Long-term Vision

4D AI 最终目标是建立完整的产品生态。

包括：

- Web
- Flutter App
- Backend
- AI
- Membership
- Cloudflare Infrastructure

所有系统可以独立演进，但共享统一帐号、统一数据与统一产品体验。

未来所有重大架构决策，应优先记录到 docs，确保任何开发者、Codex 或 GPT 都能理解整个系统，而不仅仅理解当前代码。
