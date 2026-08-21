// Native horizontal scroller — unlike the embla carousel it responds to
// trackpad/wheel scrolling and keyboard as well as touch drag. Cards set their
// own width, so the next one peeks in at the right edge.
//
// `overflow-x-auto` also clips vertically, which would cut off the drop shadow
// on cards that carry one (see SeeAllCard). The padding gives the shadow room
// inside the scroll box and the matching negative margin takes that room back
// out of the layout, so surrounding spacing is unchanged.
export const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <div className="-mx-4 -mb-5 -mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-6 pt-4 scrollbar-hide">
    {children}
  </div>
);
