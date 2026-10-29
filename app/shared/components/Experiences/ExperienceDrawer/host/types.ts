export type HostTabId = 'about' | 'sales' | 'created' | 'guests' | 'moments' | 'analytics';

export const HOST_TABS: { id: HostTabId; label: string; icon: string }[] = [
  { id: 'about', label: 'About', icon: 'InformationCircleIcon' },
  { id: 'sales', label: 'Sales', icon: 'CreditCardPosIcon' },
  { id: 'created', label: 'Tickets created', icon: 'Ticket02Icon' },
  { id: 'guests', label: 'Invited guests', icon: 'UserAdd02Icon' },
  { id: 'moments', label: 'Moments', icon: 'DashboardCircleIcon' },
  { id: 'analytics', label: 'Analytics', icon: 'PieChart06Icon' },
];
