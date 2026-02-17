# 📋 Logging & Documentation Protocol

## 🚀 Purpose
To ensure all architectural shifts and major feature implementations are documented with clarity and traceability.

---

## 🏗️ 1. Mandatory Implementation Review
Every major task or refactor must be accompanied by a **Step-by-Step Flow Review** stored in `.ai-knowledge/`.

### Structure:
1.  **Goal**: The high-level objective.
2.  **Flow process**: Broken down into logical steps (e.g., Step 1: Backend Setup, Step 2: Hook Migration).
3.  **Affected Files**: List of modified files per step.
4.  **Verification**: How to confirm the flow works as intended.

---

## 📝 2. Change Summary Standards
Summaries must be formatted using the following headers:
- **🛠️ Implementation Summary**
- **🐛 Bugs Fixed**
- **✨ New Features**
- **🌊 Affected Flows** (Explicitly describe the before and after state of the data flow)

---

## 📔 3. Knowledge Base Synchronization
When core architecture changes (e.g., moving from proxy to direct integration):
- Update `architecture-map.md`.
- Update `api-delegation.md`.
- Create a new `implementation-review-<feature>.md`.

---

## 🚨 4. Protocol for Logging
1.  **Trace**: Log the exact call chain affected by the change.
2.  **Explain**: Why the specific flow set (Step 1, Step 2...) was chosen.
3.  **Plan**: State the implementation steps before execution.
4.  **Confirm**: Document the final state after execution.
