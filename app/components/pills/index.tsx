import Pill from '@/components/ui/pill';

export default function Pills({ pills, showMax = 2 }: { pills: string[]; showMax?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {pills.slice(0, showMax).map((pill, index) => (
        <Pill key={index}>
          <p className="text-sm font-normal text-white">{pill}</p>
        </Pill>
      ))}
      {pills.length > showMax && (
        <Pill>
          <p className="px-1 text-sm font-normal text-white">{`+${pills.length - showMax}`}</p>
        </Pill>
      )}
    </div>
  );
}
