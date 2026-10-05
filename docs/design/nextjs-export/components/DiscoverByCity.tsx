import Link from "next/link";
import Image from "next/image";
import type { CityCard } from "@/lib/types";

export interface DiscoverByCityProps {
  /** Section heading. Defaults to "Discover by City". */
  title?: string;
  /** Muted subtitle next to the heading. */
  subtitle?: string;
  /** Route for the "See all" link. */
  seeAllHref?: string;
  /** City tiles to render in the horizontal rail. */
  items: CityCard[];
}

/**
 * "Discover by City" — a horizontally scrolling rail of city tiles with a
 * dark gradient overlay and the city name + experience count.
 *
 * Server Component (no client JS): navigation is handled by <Link>.
 */
export default function DiscoverByCity({
  title = "Discover by City",
  subtitle = "Where will you go next?",
  seeAllHref = "/discover",
  items,
}: DiscoverByCityProps) {
  return (
    <section style={{ marginTop: 38, fontFamily: "var(--font-tukai, 'Satoshi', system-ui, sans-serif)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1F2937", letterSpacing: "-0.3px", margin: 0 }}>
          {title}
        </h2>
        <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500, flex: 1 }}>{subtitle}</span>
        <Link
          href={seeAllHref}
          style={{ fontSize: 13, fontWeight: 700, color: "#066349", whiteSpace: "nowrap", textDecoration: "none" }}
        >
          See all
        </Link>
      </div>

      <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "16px 0 6px", scrollbarWidth: "none" }}>
        {items.map((city) => (
          <Link
            key={city.name}
            href={city.href}
            style={{
              position: "relative",
              width: 200,
              height: 150,
              flex: "none",
              borderRadius: 16,
              overflow: "hidden",
              background: "#013334",
              textDecoration: "none",
            }}
          >
            <Image src={city.imageUrl} alt={city.name} fill sizes="200px" style={{ objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(1,51,52,0.85), rgba(1,51,52,0))",
              }}
            />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>{city.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{city.count}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
