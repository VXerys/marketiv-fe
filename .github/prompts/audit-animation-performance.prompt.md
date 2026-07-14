---
description: "Use when auditing a Next.js/React animated component for memory leaks, frame drops, and GSAP lifecycle risks, then return RCA, action plan, and code fix. Keywords: animation audit, gsap safety, jank, memory leak, rca."
argument-hint: "Paste component code or file path to audit"
agent: "agent"
---
Gunakan aturan global [copilot instructions](../copilot-instructions.md), skill [audit gsap safety](../skills/audit-gsap-safety/SKILL.md), dan instruction [animation performance audit](../instructions/animation-performance-audit.instructions.md).

Tugas:
- Audit ketat performa animasi komponen yang diberikan.
- Temukan potensi memory leak, lifecycle violation, dan sumber frame drop.
- Verifikasi integrasi GSAP, ScrollTrigger, Lenis, Next.js image optimization, dan browser API safety.

Format output wajib:
1. Root Cause Analysis (bullet singkat dan berbasis bukti).
2. Action Plan (langkah konkret berurutan).
3. Code Fix utuh siap copy-paste.

Input user:
{{input}}
