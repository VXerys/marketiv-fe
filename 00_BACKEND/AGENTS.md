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

## Service Layer

Read

```
docs/01_Global/20_Coding_Standards.md

↓

docs/01_Global/40_Folder_Structure.md
```

Application services must be written in TypeScript.

Use `.ts` for service files under:

- `src/services/`
- `src/modules/<feature>/services/`

Service files are the only layer that should wrap Appwrite SDK calls for application code. Do not call Appwrite SDK directly from routes, pages, or UI components.

Do not put Appwrite Function implementation code in `src/services/`. Appwrite Functions belong under `functions/<function-id>/`.

---

## Appwrite Development

Read

```
docs/01_Global/40_Folder_Structure.md
```

Appwrite Function source code must be written under

```
functions/<function-id>/
```

Each function directory owns its own source and package files. The default function entrypoint is

```
functions/<function-id>/src/main.js
```

Do not place Appwrite Function implementation code in `src/` or in the repository root.

Appwrite project configuration and generation scripts are maintained under

```
appwrite/
```

The generated Appwrite configuration lives at

```
appwrite/appwrite.json
```

The generator script lives at

```
appwrite/generate_appwrite_json.js
```

When adding, removing, or renaming an Appwrite Function, keep these in sync:

- `functions/<function-id>/`
- `appwrite/appwrite.json`
- `appwrite/generate_appwrite_json.js`
- relevant module documentation in `docs/02_Modules/<Module>/`

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

# Agent Skills

Agents may use repository-local skills installed under:

```text
.agents/skills/<skill-name>/SKILL.md
```

Use a skill only when the task matches its purpose. Read the selected `SKILL.md` before applying its workflow.

Available skills:

- `appwrite-cli` — Appwrite CLI project management, deployments, config, and CI/CD mode.
- `api-designer` — REST or GraphQL API design, OpenAPI specs, API architecture.
- `code-documenter` — technical documentation, docstrings, OpenAPI/Swagger, user guides.
- `code-reviewer` — code review, bug risk, security risk, maintainability, test coverage.
- `database-optimizer` — slow query analysis, indexes, query optimization, database performance.
- `devops-engineer` — Docker, CI/CD, Kubernetes, Terraform, deployment automation.
- `find-skills` — discover or install additional agent skills.
- `fullstack-guardian` — full-stack feature implementation with frontend, backend, and security.
- `nestjs-expert` — NestJS modules, controllers, services, DTOs, guards, interceptors, tests.

Skill usage rules:

- Project documentation remains the source of truth.
- Skill instructions complement project documentation; they do not override it.
- If a skill conflicts with `docs/` or this `AGENTS.md`, follow the project documentation and note the conflict.
- Do not load every skill by default. Load only the smallest relevant skill for the task.

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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
