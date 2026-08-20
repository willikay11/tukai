// Native horizontal scroller — unlike the embla carousel it responds to
// trackpad/wheel scrolling and keyboard as well as touch drag. Cards set their
// own width, so the next one peeks in at the right edge.
export const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 scrollbar-hide">
    {children}
  </div>
);
