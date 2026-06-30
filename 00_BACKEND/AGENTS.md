# AGENTS.md

# AI Operating Manual

This repository is designed for AI-assisted software development.

The `docs/` directory is the single source of truth for the project. Source code implements the documented knowledge.

Every AI agent must read the relevant documentation before making any implementation, modification, or architectural decision.

---

# Core Principles

1. Documentation is the source of truth.
2. Source code is the implementation.
3. Git stores history; documentation stores the latest truth.
4. Never duplicate knowledge.
5. One document has one responsibility.
6. Update documentation whenever implementation changes.
7. Prefer updating existing documents instead of creating new ones.

---

# Documentation Structure

```text
docs/

├── README.md
│
├── 00_Project/
├── 01_Global/
├── 02_Modules/
├── 03_Workflows/
├── 04_Decisions/
└── 99_Templates/
```

---

# Reading Strategy

Never read the entire documentation.

Always load only the minimum documentation required for the current task.

Read documentation using this order.

Project

↓

Global

↓

Module Index

↓

Module Documentation

↓

Workflow (if needed)

↓

Architecture Decisions (if needed)

---

# Reading Guide

## General Project Understanding

Read

```
docs/README.md

↓

docs/00_Project/00_Index.md

↓

docs/01_Global/00_Index.md
```

---

## Developing a Feature

Read

```
docs/02_Modules/<Module>/00_Index.md
```

Then continue only with the referenced documents inside that module.

Example

```
docs/02_Modules/Orders/

00_Index.md

↓

30_Business_Rules.md

↓

50_Database.md

↓

60_API.md

↓

70_Backend.md
```

Only read files required for the current task.

---

## Developing Cross-Module Features

Read

```
Module Index

↓

Module Documentation

↓

Workflow
```

Example

```
Orders

↓

Payments

↓

03_Workflows/30_Checkout.md
```

---

## UI Tasks

Read

```
docs/01_Global/90_Design_System.md

↓

docs/02_Modules/<Module>/80_Frontend.md
```

---

## Backend Tasks

Read

```
docs/02_Modules/<Module>/70_Backend.md
```

Read Database or API documentation only when required.

---

## Database Tasks

Read

```
docs/02_Modules/<Module>/50_Database.md
```

Never infer schema from source code.

---

## API Tasks

Read

```
docs/02_Modules/<Module>/60_API.md
```

Never infer API contracts from controllers.

---

## Architecture Questions

Read

```
docs/04_Decisions/

↓

Relevant ADR
```

---

# Module Ownership

Every business capability belongs to exactly one Module.

Each Module owns its own documentation.

Every module contains

- Overview
- Concepts
- Business Rules
- User Flow
- Database
- API
- Backend
- Frontend
- Events
- Testing

Never document module-specific knowledge outside its module.

---

# Workflow

Workflow documentation only describes interactions between multiple modules.

Do not duplicate workflow inside module documentation.

Modules explain themselves.

Workflows explain collaboration.

---

# Decisions

Architecture Decision Records explain WHY.

Implementation documents explain HOW.

Never mix both.

---

# Templates

Always create new documentation using the templates inside

```
docs/99_Templates/
```

Do not invent custom documentation structures.

---

# Documentation Maintenance

Whenever implementation changes

1. Update the corresponding Module.
2. Update Workflow if the business process changes.
3. Update ADR if architecture changes.
4. Keep documentation synchronized with implementation.

---

# Graphify

Documentation is optimized for Graphify.

Every document should be

- Atomic
- Focused
- Small
- Easy to index

Every folder starts with an `00_Index.md`.

Index files summarize the folder and guide AI to the relevant documents instead of loading every file.

---

# Writing Style

- Clear
- Concise
- Consistent
- Human readable
- AI readable

Prefer bullet points.

Avoid duplication.

---

# Golden Rule

If an implementation cannot be justified by documentation,

the implementation should not exist.
