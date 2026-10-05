import Link from "next/link";
import Image from "next/image";
import type { ExperienceCard } from "@/lib/types";

export interface HappeningTodayProps {
  /** Section heading. Defaults to "Happening Today". */
  title?: string;
  /** Muted subtitle next to the heading, e.g. a date. */
  subtitle?: string;
  /** Route for the "See all" link. */
  seeAllHref?: string;
  /** Experiences to render in the horizontal rail. */
  items: ExperienceCard[];
}

/**
 * "Happening Today" — a horizontally scrolling rail of experience cards.
 *
 * Server Component (no client JS): navigation is handled by <Link>.
 * Upcoming experiences intentionally do NOT show a rating; each card shows
 * the organising community instead.
 */
export default function HappeningToday({
  title = "Happening Today",
  subtitle = "Thursday, 19th March",
  seeAllHref = "/experiences",
  items,
}: HappeningTodayProps) {
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
        {items.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            style={{ width: 240, flex: "none", textDecoration: "none", color: "inherit" }}
          >
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 165, background: "#EEF0EE" }}>
              <Image src={it.imageUrl} alt={it.title} fill sizes="240px" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: "10px 2px 0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", lineHeight: 1.3 }}>{it.title}</div>
              <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>{it.meta}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#066349",
                  marginTop: 4,
                }}
              >
                <CommunityIcon />
                <span>{it.host}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#066349", marginTop: 6 }}>{it.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CommunityIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx={9} cy={8} r={3} />
      <path d="M3.5 19c.6-3 2.6-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
      <path d="M16.5 8.7a2.5 2.5 0 11.1 4.9" />
      <path d="M18 14.6c2 .4 3.3 1.9 3.7 4.4" />
    </svg>
  );
}
