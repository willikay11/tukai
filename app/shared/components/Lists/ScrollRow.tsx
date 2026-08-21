// Native horizontal scroller — unlike the embla carousel it responds to
// trackpad/wheel scrolling and keyboard as well as touch drag. Cards set their
// own width, so the next one peeks in at the right edge.
//
// `overflow-x-auto` also clips vertically, which would cut off the drop shadow
// on cards that carry one (see SeeAllCard) — most visibly on short rows like
// the cities row, where the card's height leaves the shadow flush with the
// bottom edge. The vertical padding gives the shadow room inside the scroll
// box and the matching negative margins take that room back out of the layout,
// so surrounding spacing is unchanged. `pr-4` does the same for the last card's
// right-hand shadow, and needs no counterpart since it only extends how far
// the row scrolls.
export const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <div className="-mb-5 -mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-6 pr-4 pt-4 scrollbar-hide">
    {children}
  </div>
);
