# Booru Mobile Safari

[中文](./README.md) | English

Booru Mobile Safari is a **mobile-only userscript for iPhone Safari / Stay**. It is intentionally scoped to phone browsing and does not aim to support desktop browsers or a broad multi-site compatibility matrix.

## Project Scope

- Mobile-only
- Only 5 supported sites:
  - Yande.re
  - Konachan.com
  - Konachan.net
  - Danbooru
  - Gelbooru
- Keeps only the features needed for phone browsing, search, date filtering, detail view, sharing, and mobile settings
- No desktop adaptation, no image downloading, no batch downloading, no Fancybox, no FSA, no non-target site compatibility layer

## Included Features

- Mobile masonry browsing
- Day / week / month / year / range filters
- Tag search and autocomplete
- iOS-style app bar, drawer, and settings
- Image detail view with previous/next navigation
- Long-press sharing of post links
- Dark / light theme and basic mobile layout options

## Supported Sites

| Site | URL |
|---|---|
| Yande.re | https://yande.re |
| Konachan | https://konachan.com |
| Konachan Safe | https://konachan.net |
| Danbooru | https://danbooru.donmai.us |
| Gelbooru | https://gelbooru.com |

## Explicitly Removed

The following are outside the scope of this project:

- Desktop-only UI and interaction paths
- Compatibility for Rule34 / Sankaku / Zerochan / Nozomi / other non-target sites
- Image download, batch download, download queue, URL export
- Fancybox-based detail mode
- File System Access / FSA storage features

## Install

[Install latest userscript](https://raw.githubusercontent.com/aiza2a/booru-mobile-safari/main/booru-mobile-safari.user.js)

Recommended environments:

- iPhone Safari with a userscript extension
- Stay

## Development

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run verify:dates
pnpm run build
```

Build outputs:

- `dist/booru-mobile-safari.user.js`
- `booru-mobile-safari.user.js`

## License and Upstream Attribution

This project is a mobile-focused derivative and reduction of an upstream open-source project. It continues to use the **MIT License**.

See [LICENSE](./LICENSE) for the exact license text and attribution notes.
