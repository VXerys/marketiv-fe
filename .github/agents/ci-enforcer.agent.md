# CI Enforcer Agent

Purpose

This agent documents the expectations for the CI pipeline and how automated checks should be interpreted by reviewers and maintaners.

Behavior

- Ensure PRs run `CI` (lint + typecheck + build) on `master`.
- Surface failing checks and recommend next steps (fix lint, update types, or run build locally).
- For domain-specific warnings (animation/data), the agent annotates the PR with references to the matching instruction files in `.github/instructions/`.

Invocation

Used by the `pre-merge-quality-gate` workflow to produce a human-friendly summary of checks.
