# Vendored dependencies

## three.js 0.185.0

`three.module.min.js` and `three.core.min.js` are copied verbatim from the npm
package `three@0.185.0` (`node_modules/three/build/`). MIT licensed; the licence
header is preserved at the top of each file.

They are vendored rather than bundled because the static site has no bundler:
`scripts/build-pages.mjs` copies directories, and `vite.config.js` builds only
the React contact page. Adding a second Rollup entry would emit a hash-named
chunk that `index.html` cannot reference without a templating step.

`three` is pinned to the exact version in `package.json` devDependencies so the
version is declared and auditable, and so these files can be regenerated:

```bash
npm ci
cp node_modules/three/build/three.module.min.js js/vendor/
cp node_modules/three/build/three.core.min.js  js/vendor/
```

SHA-256 (first 16 hex chars) of the files as committed:

| File | Size | sha256 |
|---|---|---|
| `three.module.min.js` | 357 KB | `86bcee248b64f44b` |
| `three.core.min.js` | 376 KB | `0e9dd2793e01d0d9` |

Only `three.module.min.js` is imported; it re-exports from `three.core.min.js`,
which is why both are present.

three.js publishes breaking changes on minor releases, so do not widen the pin.

## GSAP 3.13.0 + ScrollTrigger

`gsap.min.js` and `ScrollTrigger.min.js` are the UMD builds from
`gsap@3.13.0/dist/` (fetched from the npm package via jsDelivr). GreenSock
standard license — free for this use; header preserved in each file.

Loaded as deferred classic scripts from `index.html` (they expose `gsap` and
`ScrollTrigger` globals), so they never block render and never appear in the
budget check's critical-path sum. Everything that uses them runs at
`DOMContentLoaded`, which deferred scripts are guaranteed to precede.

| File | Size | sha256 (first 16) |
|---|---|---|
| `gsap.min.js` | 71 KB | `96c01b81f44a3290` |
| `ScrollTrigger.min.js` | 43 KB | `308219390e5e3b84` |

To regenerate:

```bash
curl -sL -o js/vendor/gsap.min.js https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js
curl -sL -o js/vendor/ScrollTrigger.min.js https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js
```
