import { PlanPageContent } from './PlanPageContent';

export default function PlanPage({ params }: { params: { planId: string } }) {
  return <PlanPageContent planId={params.planId} />;
}
