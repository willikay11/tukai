export interface StatusConfig {
  label: string;
  dot: string;
  text: string;
}

// Covers the statuses the API actually returns ('completed', 'expired') plus
// the payment states the design anticipates; unknown values fall back to a
// neutral badge showing the raw status.
const STATUS_CONFIG: Record<string, StatusConfig> = {
  completed: { label: 'Paid', dot: 'bg-primary', text: 'text-primary' },
  paid: { label: 'Paid', dot: 'bg-primary', text: 'text-primary' },
  partial: { label: 'Partial', dot: 'bg-orange-500', text: 'text-orange-600' },
  pending: { label: 'Pending', dot: 'bg-yellow-500', text: 'text-yellow-600' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500', text: 'text-red-600' },
  refunded: { label: 'Refunded', dot: 'bg-gray-400', text: 'text-gray-500' },
  expired: { label: 'Expired', dot: 'bg-gray-400', text: 'text-gray-500' },
};

export const PaymentStatusBadge = ({
  status,
  config: configMap = STATUS_CONFIG,
}: {
  status: string;
  // Optional override so other features (e.g. hosting statuses) can reuse the
  // same dot-badge with their own enum-driven map
  config?: Record<string, StatusConfig>;
}) => {
  const config = configMap[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    dot: 'bg-gray-400',
    text: 'text-gray-500',
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm">
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
    </div>
  );
};
