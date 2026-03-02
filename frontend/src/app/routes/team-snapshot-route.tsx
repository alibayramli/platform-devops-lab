import { motion } from "framer-motion";

import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import { TeamSummaryCards } from "../../features/teams/components/team-summary-cards";
import type { TeamSummary } from "../../shared/types/api";
import { Badge } from "../../shared/ui/badge";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type TeamSnapshotRouteProps = {
  summary: TeamSummary | undefined;
  activeTeamName: string | null;
  onSelectMetric: (metricId: SummaryMetricId) => void;
};

export function TeamSnapshotRoute({
  summary,
  activeTeamName,
  onSelectMetric
}: TeamSnapshotRouteProps) {
  return (
    <AnimatedRouteSection>
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Snapshot Hub</h2>
              <p className="section-subtitle mt-1">
                {activeTeamName
                  ? `Delivery breakdown for ${activeTeamName}.`
                  : "Select a workspace to inspect delivery metrics."}
              </p>
            </div>
            <Badge variant="neutral">{summary?.totalTasks ?? 0} tasks</Badge>
          </div>
          <TeamSummaryCards summary={summary} onSelectMetric={onSelectMetric} />
        </Card>
      </motion.div>
    </AnimatedRouteSection>
  );
}
