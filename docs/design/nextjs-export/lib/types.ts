// Shared types for the exported Tukai Discover sections.

/** A single experience card (e.g. an item in "Happening Today"). */
export interface ExperienceCard {
  /** Stable unique id (used as React key). */
  id: string;
  /** Experience title. */
  title: string;
  /** Secondary line, e.g. "Nairobi · 6.4 Kms". */
  meta: string;
  /** Display price, e.g. "Ksh. 600/person". */
  price: string;
  /** Name of the community that organises the experience. */
  host: string;
  /** Cover image URL. */
  imageUrl: string;
  /** Destination route for the card, e.g. "/experiences/karura-forest-loop". */
  href: string;
}

/** A single city tile (e.g. an item in "Discover by City"). */
export interface CityCard {
  /** City name, e.g. "Nairobi". */
  name: string;
  /** Count label, e.g. "120+ experiences". */
  count: string;
  /** Cover image URL. */
  imageUrl: string;
  /** Destination route, e.g. "/discover?city=nairobi". */
  href: string;
}
