# Tukai — Discover sections (Next.js 16)

Two reusable, presentational sections extracted from the Tukai **Discover** page:

| Component | File | Purpose |
|---|---|---|
| `HappeningToday` | `components/HappeningToday.tsx` | Horizontal rail of experience cards (community shown, no rating — these are upcoming). |
| `DiscoverByCity` | `components/DiscoverByCity.tsx` | Horizontal rail of city tiles with a gradient overlay. |

Built for **Next.js 16 (App Router)**. Both are **Server Components** — they ship zero client JS; navigation is handled by `next/link` and images by `next/image`.

## Install into a Next.js 16 project

1. Copy `components/`, `lib/types.ts`, and (optionally) `lib/sampleData.ts` into your project.
2. Make sure the `@/*` path alias resolves to your project root. A Next.js app created with `create-next-app` already has this in `tsconfig.json`:
   ```jsonc
   { "compilerOptions": { "paths": { "@/*": ["./*"] } } }
   ```
   (See `tsconfig.paths.json` here for the exact snippet.)
3. Allow the image host(s) you use in `next.config.ts` (see the included file). The demo data uses `images.unsplash.com`.

## Usage

```tsx
import HappeningToday from "@/components/HappeningToday";
import DiscoverByCity from "@/components/DiscoverByCity";
import { happeningToday, discoverByCity } from "@/lib/sampleData";

export default function DiscoverPage() {
  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 36px 80px" }}>
      <HappeningToday items={happeningToday} subtitle="Thursday, 19th March" />
      <DiscoverByCity items={discoverByCity} />
    </main>
  );
}
```

See `app/page.tsx` for the same example wired as a route.

## Props

### `HappeningToday`
| Prop | Type | Default |
|---|---|---|
| `items` | `ExperienceCard[]` | — (required) |
| `title` | `string` | `"Happening Today"` |
| `subtitle` | `string` | `"Thursday, 19th March"` |
| `seeAllHref` | `string` | `"/experiences"` |

### `DiscoverByCity`
| Prop | Type | Default |
|---|---|---|
| `items` | `CityCard[]` | — (required) |
| `title` | `string` | `"Discover by City"` |
| `subtitle` | `string` | `"Where will you go next?"` |
| `seeAllHref` | `string` | `"/discover"` |

Types live in `lib/types.ts` (`ExperienceCard`, `CityCard`). Wire `items` to your own data source — shape your records to those interfaces.

## Notes

- **Styling** is inline (no Tailwind/CSS dependency) so the components drop in anywhere. The brand green is `#066349`, ink `#1F2937`, teal `#013334`.
- **Font**: components read `var(--font-tukai)` and fall back to Satoshi / system UI. Set `--font-tukai` (e.g. via `next/font`) on a parent if you want the exact brand face.
- **Community + no rating**: experience cards show the organising community and omit a rating, matching the product rule that only past experiences carry ratings.
