# Node 16 compatibility – issues and trade-offs

## Why the project required Node 20+

The stack was chosen with **Vite 7**, **React Router 7**, and **ESLint 9**. Those versions require a newer Node for several reasons:

1. **Vite 7**  
   Uses Node 20+ only. It relies on modern Node APIs (e.g. `crypto.getRandomValues`) and drops support for older runtimes to simplify the codebase and improve performance.

2. **React Router 7**  
   Declares `engines.node: ">=20.0.0"` so they can depend on current Node behaviour and avoid testing on older versions.

3. **ESLint 9 + flat config**  
   ESLint 9 and the new “flat” config format target Node 18+. Several plugins (e.g. `@eslint/js`, `globals`) also require Node 18+.

4. **Security and maintenance**  
   Node 16 reached end-of-life in September 2023. Newer tools often assume a maintained Node version for security and compatibility.

So the “issue” is: **the original dependency set was designed for Node 20+, not for Node 16.**

---

## What we changed for Node 16

To run on **Node 16** (and most systems that only have 16 installed), the project was downgraded to versions that support Node 16:

| Package              | Before (Node 20+) | After (Node 16) | Note |
|----------------------|-------------------|------------------|------|
| **vite**             | ^7.3.1            | ^4.5.0          | Vite 4 supports Node 14.18+, 16+, 18+. |
| **@vitejs/plugin-react** | ^5.1.1        | ^4.0.0          | Matches Vite 4. |
| **react-router-dom** | ^7.13.0           | ^6.22.0         | v6 supports Node 12+; API used here is the same (`Routes`, `Route`, `element`). |
| **eslint**           | ^9.39.1           | ^8.57.0         | ESLint 8 supports Node 12+. |
| **@eslint/js**       | ^9.39.1           | (removed)       | Replaced by `.eslintrc.cjs` for ESLint 8. |
| **eslint-plugin-react-hooks** | ^7.0.1   | ^4.6.0         | v4 works with ESLint 8 and Node 16. |
| **eslint-plugin-react-refresh** | ^0.4.24 | ^0.4.5   | Kept for Vite React refresh lint. |
| **globals**          | ^16.5.0           | ^13.24.0        | Older globals works on Node 16. |
| **React**            | ^19.2.0           | ^18.2.0         | React 18 has broad tooling support on Node 16. |

- **`package.json`**  
  - `engines.node` set to `">=16.0.0"` so the project is explicit about supporting Node 16.  
- **ESLint**  
  - Switched from the ESLint 9 flat config (`eslint.config.js`) to an ESLint 8–compatible **`.eslintrc.cjs`** so linting runs on Node 16 without the new config format.

No application code was changed; only dependency versions and lint config.

---

## Trade-offs of running on Node 16

| Aspect              | Node 20+ (original)     | Node 16 (current config)      |
|---------------------|-------------------------|--------------------------------|
| **Where it runs**   | Only on Node 20+       | Node 16, 18, 20, etc.         |
| **Dev/build speed** | Vite 7 is faster       | Vite 4 is still fast, but slower than 7. |
| **Features**        | Latest Vite/Router/ESLint | Older major versions, fewer new features. |
| **Security**        | Node 20 LTS supported  | Node 16 is EOL; no security fixes.        |
| **Future**          | Aligned with current ecosystem | May need more work to upgrade later.   |

So: **you gain “runs on all systems” (including Node 16) and give up some speed and “latest” features.** For many teams that’s acceptable until they can standardize on Node 18 or 20.

---

## Recommendation

- **Use Node 16** only where you must (e.g. locked-down or legacy systems). Prefer **Node 18 LTS** or **Node 20 LTS** where possible for security and tooling.
- **When you can move off Node 16**, you can upgrade back to Vite 7, React Router 7, and ESLint 9 and remove this compatibility layer.

---

## How to run

```bash
# Node 16, 18, or 20
node -v   # should be >= 16.0.0
npm install
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```
