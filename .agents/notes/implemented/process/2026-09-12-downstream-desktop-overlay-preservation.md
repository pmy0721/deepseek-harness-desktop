# Agent Note: Preserve downstream Desktop behavior across upstream updates

Status: implemented

English | [中文](2026-09-12-downstream-desktop-overlay-preservation.zh.md)

## Problem

The personal Desktop distribution follows upstream DeepSeek Harness releases while retaining user-visible behavior and documentation that upstream does not own. An upstream merge can resolve a shared file to the upstream version without a build failure, silently removing the downstream application icon, version presentation, update history, provenance, or locally installed plugin activation. A successful compile therefore does not prove that the personal distribution survived the update.

## Decision

Every upstream Desktop update starts with an inventory of downstream-only commits, source paths, installed profile packages, and observable user behavior. After the merge, the maintainer compares the result with the merge's first parent and classifies each removal as retained by adaptation, replaced by an explicitly verified upstream mechanism, or deferred as a named regression. Deployment waits until the root bilingual Desktop history, packaged application icon, compact sidebar release badge, installed external plugin graph, and shared user data have direct evidence.

Repository tests pin the root English and Chinese Desktop sections, the electron-builder icon configuration, and the sidebar badge behavior. Runtime verification checks the installed application's version and icon, starts the packaged Host, inspects the reserved Desktop profile's exact plugin graph, and confirms that shared Sessions remain visible. Features that changed architecture, including window chrome, tray lifecycle, restart policy, logging, and local unsigned packaging, require an explicit keep-or-replace decision instead of being inferred from file presence.

## Alternatives considered

**Accept the upstream side for every merge conflict and restore visible differences later.** This makes compilation easy but treats untested deletion as a valid resolution and misses features that users notice only after installation.

**Rely on Git history and manual memory.** The removed work remains recoverable, but neither mechanism fails the update before deployment. Small presentation and profile differences are especially easy to omit.

**Keep a long-lived patch file for the complete Desktop tree.** A whole-tree patch would resist upstream architecture improvements and produce large, brittle conflicts. The inventory and focused checks preserve intended outcomes while allowing their implementations to change.

## Consequences

- An upstream update has a downstream preservation phase in addition to build and package validation.
- Removing a personalized feature requires an explicit recorded disposition rather than an implicit merge result.
- Root Desktop history, the branded application icon, and the compact version badge fail focused tests when an upstream sync drops them.
- Installed third-party plugins and shared data remain deployment evidence because they are user state, not repository fixtures.
- The audit can retain a newer upstream mechanism without carrying obsolete implementation files when it proves the same or better user outcome.
