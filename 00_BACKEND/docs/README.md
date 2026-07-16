# Project Knowledge Base

Welcome to the project's Knowledge Base.

This directory contains the complete documentation of the software system.

It is designed as the **single source of truth** for both developers and AI agents.

Every business rule, architectural decision, API contract, workflow, and implementation guideline should originate from this documentation.

---

# Documentation Philosophy

The documentation follows five fundamental principles.

1. Documentation is the source of truth.
2. Source code implements the documented knowledge.
3. One fact exists in one location.
4. Every document has a single responsibility.
5. Git stores history; documentation stores the latest truth.

---

# Knowledge Base Architecture

```text
Project
    │
    ▼
Global Standards
    │
    ▼
Business Modules
    │
    ▼
Business Workflows
    │
    ▼
Architecture Decisions
```

---

# Documentation Structure

```text
docs/

├── README.md
│
├── 00_Project/
│   ├── 00_Index.md
│   ├── 10_Vision.md
│   ├── 20_Scope.md
│   ├── 30_Roadmap.md
│   ├── 40_Tech_Stack.md
│   └── 50_Project_Rules.md
│
├── 01_Global/
│   ├── 00_Index.md
│   ├── 10_Glossary.md
│   ├── 20_Coding_Standards.md
│   ├── 30_Naming_Convention.md
│   ├── 40_Folder_Structure.md
│   ├── 50_Security_Guidelines.md
│   ├── 60_Error_Handling.md
│   ├── 70_Testing_Strategy.md
│   ├── 80_Deployment.md
│   └── 90_Design_System.md
│
├── 02_Modules/
│   ├── 00_Index.md
│   ├── 10_Domain_Model.md
│   │
│   ├── Authentication/
│   │   ├── 00_Index.md
│   │   ├── 10_Overview.md
│   │   ├── 20_Concepts.md
│   │   ├── 30_Business_Rules.md
│   │   ├── 40_User_Flow.md
│   │   ├── 60_API.md
│   │   ├── 70_Backend.md
│   │   ├── 80_Frontend.md
│   │   ├── 90_Events.md
│   │   └── 100_Testing.md
│   │
│   ├── Users/
│   ├── Campaigns/
│   ├── RateCards/
│   ├── Chat/
│   ├── Offers/
│   ├── Orders/
│   ├── Payments/
│   ├── AI/
│   ├── Notifications/
│   └── ...
│
├── 03_Workflows/
│   ├── 00_Index.md
│   ├── 10_Registration.md
│   ├── 20_Campaign_PPV.md
│   ├── 30_RateCard_Order.md
│   ├── 40_Submission_Fraud.md
│   ├── 50_Withdrawal.md
│   ├── 60_Dispute.md
│   └── ...
│
├── 04_Decisions/
│   ├── 00_Index.md
│   ├── ADR-001.md
│   ├── ADR-002.md
│   └── ADR-xxx.md
│
└── 99_Templates/
    ├── 00_Index.md
    ├── Module_Template.md
    ├── Workflow_Template.md
    ├── ADR_Template.md
    ├── API_Template.md
    ├── Database_Template.md
    ├── Business_Rules_Template.md
    └── Screen_Template.md
```

---

# Layer Responsibilities

## 00_Project

Contains project-level documentation.

Purpose

- Vision
- Scope
- Roadmap
- Tech Stack
- Project Rules

Read `00_Index.md` first.

---

## 01_Global

Contains standards shared by every module.

Purpose

- Glossary
- Coding Standards
- Naming Convention
- Folder Structure
- Security
- Error Handling
- Testing
- Deployment
- Design System

Read `00_Index.md` first.

---

## 02_Modules

The core of the Knowledge Base.

Every business capability belongs to exactly one module.

Each module is self-contained.

Every module follows the same structure where relevant. Documents that do not apply to a module are omitted instead of creating empty placeholders.

```text
Module/

├── 00_Index.md
├── 10_Overview.md
├── 20_Concepts.md
├── 30_Business_Rules.md
├── 40_User_Flow.md
├── 50_Database.md      # only if the module owns collections/tables
├── 60_API.md
├── 70_Backend.md
├── 80_Frontend.md
├── 90_Events.md
└── 100_Testing.md
```

Always read `00_Index.md` before opening any module documentation.

The index summarizes the module and tells both developers and AI which documents should be read for a specific task.

---

## 03_Workflows

Workflow documentation connects multiple modules.

Examples

- Registration
- Checkout
- Refund
- Order Fulfillment

Always read `00_Index.md` before opening workflow documentation.

---

## 04_Decisions

Architecture Decision Records (ADR).

Explain why important technical decisions were made.

Always read `00_Index.md` first to identify the relevant decision.

---

## 99_Templates

Contains official templates for creating documentation.

Every new document should follow these templates.

---

# Reading Guide

## General Understanding

```text
README

↓

00_Project/00_Index

↓

01_Global/00_Index
```

---

## Feature Development

```text
Module/

↓

00_Index

↓

Related Documents
```

---

## Cross-Module Development

```text
Module

↓

Workflow
```

---

## Architecture

```text
Project

↓

Decision Records
```

---

# Documentation Rules

- One document = one responsibility.
- One concept = one owner.
- One fact = one location.
- Never duplicate information.
- Every folder starts with `00_Index.md`.
- Always read the Index before reading other documents in the same folder.

---

# AI-First Design

The documentation is optimized for AI-assisted software development.

Every folder begins with an Index document that summarizes its contents and acts as the entry point for both developers and AI agents.

This enables AI to retrieve only the necessary context instead of reading every document inside the folder.

---

# Final Principle

The purpose of this documentation is to describe the software system.

The source code is only one implementation of that knowledge.
