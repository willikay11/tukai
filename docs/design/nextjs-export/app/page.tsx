import HappeningToday from "@/components/HappeningToday";
import DiscoverByCity from "@/components/DiscoverByCity";
import { happeningToday, discoverByCity } from "@/lib/sampleData";

// Example App Router page that renders both exported Discover sections.
// Both are Server Components — no "use client" needed.
export default function DiscoverPage() {
  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 36px 80px" }}>
      <HappeningToday items={happeningToday} subtitle="Thursday, 19th March" />
      <DiscoverByCity items={discoverByCity} />
    </main>
  );
}
