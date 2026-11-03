const DELAYS = ['[animation-delay:0s]', '[animation-delay:.16s]', '[animation-delay:.32s]'];

/** Three brand-green dots that bob in turn: TukAI thinking, or listening. */
export const TukaiDots = () => (
  <span aria-hidden="true" className="inline-flex h-5 items-center gap-1">
    {DELAYS.map((delay) => (
      <span
        key={delay}
        className={`h-[7px] w-[7px] rounded-full bg-brand opacity-25 motion-safe:animate-tk-dot motion-reduce:opacity-100 ${delay}`}
      />
    ))}
  </span>
);
