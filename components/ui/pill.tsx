export const Pill = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-2 rounded-[40px] bg-gray-400/50 px-2 py-2">
      {children}
    </div>
  );
};
