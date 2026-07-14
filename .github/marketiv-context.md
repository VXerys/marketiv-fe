---
description: Use when implementing or planning any feature in this workspace so the agent keeps Marketiv product context, business rules, and user-space boundaries as the primary source of truth.
applyTo: "**"
---

# MARKETIV: CORE PRODUCT KNOWLEDGE

## 1. Vision and Mission

Marketiv is a hybrid marketplace platform that connects UMKM (especially in tier-2 cities such as Sukabumi) with micro creators. The goal is to democratize fair digital marketing with no early financial loss risk for UMKM, while creating fair income opportunities for creators.

## 2. The Dual-Ecosystem (Strict Separation)

Marketiv has two user spaces that are isolated in UI and UX:

- UMKM Space (/app/umkm/*): UI must be very simple because regional UMKM digital literacy can be low. Focus on spending metrics dashboard and order creation.
- Creator Space (/app/creator/*): UI can be more interactive for job discovery, portfolio, and earnings metrics.

System rule:

- UMKM components or state must never leak into Creator pages.
- Creator components or state must never leak into UMKM pages.

## 3. Core Features (Two Modes)

### A. Campaign Mode (Viral / Performance-Based)

This is a pay-per-view marketing service.

Business logic:

- UMKM creates a brief (AI-assisted) and uploads raw assets.
- Creator claims a job.
- Creator edits the video.
- Creator publishes on the creator own social account.

Absolute restriction:

- Chat or direct communication between UMKM and Creator is strictly forbidden in this mode. This removes bureaucracy and revision drama.

Payment:

- Payout is based on achieved views, with fraud-view detection.

### B. Rate Card Mode (Consultative / Influencer)

This is a premium fixed-price service.

Business logic:

- UMKM browses creator catalog.
- UMKM initiates chat.
- Both parties negotiate price and deliverables.
- Deal is secured through escrow.
- Creator executes content.

Absolute restriction:

- Negotiation chat must exist in this mode.

Mandatory additional requirement:

- When content is published, the system must enforce use of social Collab Post features (Instagram or TikTok) so UMKM receives direct audience traffic from the creator.

## 4. Tech Stack and Architecture Alignment

Technical stack and architecture guidance must follow the existing global rules in .github/copilot-instructions.md.
This file defines product context, business model boundaries, and feature intent.

## 5. P2MW Compliance (Business Goals)

Every feature should support P2MW 2025 reporting goals:

- Speed priority: push MVP delivery quickly.
- Data export readiness: always provide hooks or extraction points for User Retention Rate, total GMV, and total Views for progress reporting.

## 6. Build Intent Guardrails

Use this context to validate every implementation decision:

- Is the feature implemented in the correct user space (UMKM or Creator)?
- Is the selected mode behavior correct (Campaign vs Rate Card)?
- Are mode-specific restrictions enforced, not optional?
- Does the implementation preserve MVP speed and reporting readiness?
