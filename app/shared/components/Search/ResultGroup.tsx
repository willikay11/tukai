export const ResultGroup = ({
  title,
  count,
  children,
}: {
  title: string;
  count: string;
  children: React.ReactNode;
}) => (
  <section>
    <div className="flex items-baseline gap-3">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <span className="text-sm text-gray-400">{count}</span>
    </div>
    <div className="mt-3">{children}</div>
  </section>
);
