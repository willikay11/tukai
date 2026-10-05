import type { ExperienceCard, CityCard } from "@/lib/types";

const img = (id: string, w = 560) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

/** Sample data for the "Happening Today" rail. */
export const happeningToday: ExperienceCard[] = [
  { id: "e3", title: "Karura Forest Loop", meta: "Nairobi · 6.4 Kms", price: "Ksh. 600/person", host: "Karura Sunday Walkers", imageUrl: img("1441974231531-c6227db76b6e"), href: "/experiences/karura-forest-loop" },
  { id: "e2", title: "Ngong Hills Ridge", meta: "Kajiado · 11 Kms", price: "Ksh. 1,500/person", host: "Ngong Dawn Striders", imageUrl: img("1501785888041-af3ef285b470"), href: "/experiences/ngong-hills-ridge" },
  { id: "e6", title: "Hell's Gate Gorge Ride", meta: "Naivasha · 14 Kms", price: "Ksh. 2,000/person", host: "Rift Valley Overlanders", imageUrl: img("1527004013197-933c4bb611b3"), href: "/experiences/hells-gate-gorge-ride" },
  { id: "e9", title: "Menengai Crater Walk", meta: "Nakuru · 8 Kms", price: "Ksh. 1,500/person", host: "Karura Sunday Walkers", imageUrl: img("1469474968028-56623f02e42e"), href: "/experiences/menengai-crater-walk" },
  { id: "e7", title: "Kereita Forest & Waterfall", meta: "Kimende · 9 Kms", price: "Ksh. 1,200/person", host: "Trails And Us", imageUrl: img("1433086966358-54859d0ed716"), href: "/experiences/kereita-forest-waterfall" },
  { id: "e5", title: "Mt Longonot Crater Rim", meta: "Naivasha · 13.5 Kms", price: "Ksh. 1,800/person", host: "Peak Seekers", imageUrl: img("1464822759023-fed622ff2c3b"), href: "/experiences/mt-longonot-crater-rim" },
];

/** Sample data for the "Discover by City" rail. */
export const discoverByCity: CityCard[] = [
  { name: "Nairobi", count: "120+ experiences", imageUrl: img("1441974231531-c6227db76b6e"), href: "/discover?city=nairobi" },
  { name: "Diani", count: "41 experiences", imageUrl: img("1533105079780-92b9be482077"), href: "/discover?city=diani" },
  { name: "Naivasha", count: "38 experiences", imageUrl: img("1414235077428-338989a2e8c0"), href: "/discover?city=naivasha" },
  { name: "Mombasa", count: "64 experiences", imageUrl: img("1519046904884-53103b34b206"), href: "/discover?city=mombasa" },
  { name: "Nakuru", count: "29 experiences", imageUrl: img("1469474968028-56623f02e42e"), href: "/discover?city=nakuru" },
  { name: "Nanyuki", count: "22 experiences", imageUrl: img("1551632811-561732d1e306"), href: "/discover?city=nanyuki" },
];
