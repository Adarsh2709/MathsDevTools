# Math Tools by Adarsh

A clean, fast collection of math calculators and notes designed to help while coding or studying. Built with semantic HTML, modern CSS, and lightweight JavaScript. Deployed easily to static hosts (e.g., Vercel).

## Features
- **Home landing** with About, Blog links, Tools grid, and usage guidance.
- **Calculators** for Logarithm, Prime checking, Primes in range, Base conversion, Quadratic and Cubic equations, and Power operations.
- **Theory & Notes** panels on each page for quick concept refreshers.
- **Unified theme** (dark-first) with glass panels, gridlines, and responsive layout.
- **Service Worker** for basic offline caching and faster reloads.
- **Footer** branding: “Made with ❤ — Adarsh Jha, Developer”.

## Pages
- `index.html` — Landing page (About, Blog, Tools, How to Use)
- `logarithm.html` — Logarithm Calculator (relations, change-of-base, graphs)
- `prime.html` — Prime Checker + factorization
- `primes-range.html` — Primes in Range (segmented sieve)
- `base-converter.html` — Base Converter (integers + fractions)
- `quadratic.html` — Quadratic Calculator (discriminant, roots, vertex)
- `cubic.html` — Cubic Calculator (real roots via Cardano / trigonometric)
- `power.html` — Power operations (exponents, roots)

Key assets:
- `styles.css` — Global styles and theme
- `site.js` — Service worker registration + active nav highlight
- `sw.js` — Caching of core assets and CDNs
- Page scripts: `app.js` (logarithm), `prime.js`, `primes-range.js`, `base.js`, `quadratic.js`, `cubic.js`, `power.js`

## Local Development
1. Clone the repo.
2. Serve the folder via a local HTTP server (required for the Service Worker and CDNs):
```bash
# Python 3
python -m http.server 5500 -d "/path/to/CalPro"
# or Node (http-server)
# npx http-server "/path/to/CalPro" -p 5500
```
3. Open `http://localhost:5500/` in your browser.

## Deploying to Vercel
1. Import the repository into Vercel.
2. Framework preset: **Other** (static site).
3. Build command: **None**.
4. Output directory: project root (static files).
5. Ensure `index.html` is the landing page. All other pages are linked via relative paths.

## Notes
- If a CDN is slow, pages still load — the Service Worker caches common libraries on first successful load.
- For best results, do one hard refresh after first deploy to prime the cache.

## About
Made with ❤ — Adarsh Jha, Developer
- Blog: https://myblog-roan-five.vercel.app/
- Contact: https://myblog-roan-five.vercel.app/contacts.html

## License
MIT
