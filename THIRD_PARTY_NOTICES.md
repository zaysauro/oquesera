# Third-party notices

Kumo One is a modified distribution of open-source software. This file lists
the main third-party components and their licenses. The full license text of
every npm package ships inside `node_modules/<package>/LICENSE*` and is the
authoritative source.

## 1. Base platform

| Component | License | Use in Kumo One |
|---|---|---|
| [SimplerDevelopment](https://github.com/SimplerDevelopment/SimplerDevelopment) © SimplerDevelopment | Apache-2.0 | Entire application base: multi-tenant portal, admin, CRM, CMS and visual editor, bookings, projects/Kanban, contracts/e-sign, surveys, automations, MCP server, billing. Imported at upstream commit `2b6b7cc`; modifications are in this repo's history after commit `6d81a6a`. |

Apache-2.0 obligations we follow: the original `LICENSE` is kept unchanged at
the repository root; `NOTICE` states the attribution and that the files were
modified; upstream copyright headers are preserved; the public site footer
and `/sobre` credit the upstream project. The Kumo One name, logo and copy are
our own and do not use SimplerDevelopment trademarks.

## 2. Direct npm dependencies by license

Generated from `package.json` (dependencies + devDependencies) and each
package's declared license on 2026-11-01.

| License | Count | Packages |
|---|---|---|
| MIT | 102 | @anthropic-ai/sdk, @codemirror/autocomplete, @codemirror/commands, @codemirror/lang-html, @codemirror/lang-markdown, @codemirror/language, @codemirror/state, @codemirror/view, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @hookform/resolvers, … |
| Apache-2.0 | 11 | @ai-sdk/anthropic, @ai-sdk/openai-compatible, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @playwright/test, ai, drizzle-orm, googleapis, playwright, sharp, typescript |
| ISC | 6 | c8, d3-delaunay, knip, lucide-react, next-auth, pixelmatch |
| BSD-2-Clause | 2 | dotenv, leaflet |
| BSD-3-Clause | 1 | bcryptjs |
| (MIT OR GPL-3.0-or-later) | 1 | jszip |
| Apache-2.0 WITH LLVM-exception | 1 | mousetrap |
| MIT-0 | 1 | nodemailer |
| Unlicense | 1 | postgres |
| Hippocratic-2.1 | 1 | react-leaflet |
| BlueOak-1.0.0 | 1 | tar |

### Licenses that need attention

| Package | License | Decision |
|---|---|---|
| `gsap` | GSAP "Standard no-charge" license (not open source; restricts use in products that compete with Webflow) | **Removed.** Kumo One ships a website builder, so the restriction could apply. Its two uses (decorative 3D marketing scenes) now use `components/three/tween.ts`. |
| `react-leaflet` | Hippocratic License 2.1 (ethical-source, not OSI-approved) | Kept for the CRM company map (`components/portal/CompanyMapImpl.tsx`). Commercial use is allowed subject to the license's human-rights conditions. **Have counsel review**; if unacceptable, replace with direct `leaflet` (BSD-2-Clause) usage. |
| `jszip` | MIT OR GPL-3.0-or-later | Used under MIT. |
| `mousetrap` | Apache-2.0 WITH LLVM-exception | Permissive; attribution kept. |
| `postgres` | Unlicense | Public-domain dedication; no obligations. |
| `tar` | BlueOak-1.0.0 | Permissive. |
| `nodemailer` | MIT-0 | Permissive. |

Transitive dependencies were not audited one by one. Before a commercial
launch run a full scan (for example `npx license-checker --production
--summary`) and keep its output with the release.

## 3. External services (not redistributed)

These are called over the network when configured; their terms apply to the
operator's account, not to this code: PostgreSQL host, Vercel, S3-compatible
storage (AWS S3, Cloudflare R2, MinIO), Stripe, Resend, Anthropic, OpenAI or
any OpenAI-compatible endpoint, Google Workspace, Microsoft, Zoom, DropboxSign,
Sentry, Upstash. See `DEPLOYMENT.md`.

## 4. Fonts and assets

- Kumo One logo, favicon and Open Graph image: original artwork created for
  this project (`public/brand/`, `scripts/kumo-build-icons.ts`).
- Google Fonts loaded through `next/font` (Inter, Geist, DM Sans, Playfair
  Display and those chosen by website templates) are under the SIL Open Font
  License 1.1.
- Material Icons (self-hosted, `public/fonts/`) are Apache-2.0 (Google).
- Upstream screenshots and marketing media under `public/screenshots/` and
  `marketing/` belong to the upstream project and are not used by the Kumo One
  public site.
