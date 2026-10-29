import moment from 'moment';

/** The small month/day tile on a booking or hosting item card. */
export const DateBadge = ({ date }: { date: string | Date }) => {
  const parsed = moment(date);

  return (
    <span className="flex h-[58px] w-[50px] flex-shrink-0 flex-col items-center justify-center rounded-10 bg-[linear-gradient(180deg,#EEF4FD_0%,#DDE8FA_100%)] leading-[1.15] text-gray-900">
      <span className="text-sm">{parsed.format('MMM')}</span>
      <span className="text-[17px] font-bold">{parsed.format('D')}</span>
    </span>
  );
};
