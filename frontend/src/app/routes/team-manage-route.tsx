import { motion } from "framer-motion";

import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import { TeamSummaryCards } from "../../features/teams/components/team-summary-cards";
import { TeamSwitcher } from "../../features/teams/components/team-switcher";
import { MemberPanel } from "../../features/members/components/member-panel";
import type { Member, TeamListItem, TeamSummary } from "../../shared/types/api";
import { Badge } from "../../shared/ui/badge";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type CreateTeamInput = { name: string; description?: string };
type CreateMemberInput = { fullName: string; email: string; role: "lead" | "member" | "observer" };

type TeamManageRouteProps = {
  teams: TeamListItem[];
  selectedTeamId: number | null;
  activeTeamName: string | null;
  members: Member[];
  summary: TeamSummary | undefined;
  isLoadingTeams: boolean;
  isLoadingMembers: boolean;
  isLoadingSummary: boolean;
  isCreatingTeam: boolean;
  isCreatingMember: boolean;
  onSelectTeam: (teamId: number) => void;
  onCreateTeam: (input: CreateTeamInput) => Promise<void>;
  onCreateMember: (input: CreateMemberInput) => Promise<void>;
  onSelectMetric: (metricId: SummaryMetricId) => void;
};

export function TeamManageRoute({
  teams,
  selectedTeamId,
  activeTeamName,
  members,
  summary,
  isLoadingTeams,
  isLoadingMembers,
  isLoadingSummary,
  isCreatingTeam,
  isCreatingMember,
  onSelectTeam,
  onCreateTeam,
  onCreateMember,
  onSelectMetric
}: TeamManageRouteProps) {
  return (
    <AnimatedRouteSection className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <TeamSwitcher
          teams={teams}
          isLoadingTeams={isLoadingTeams}
          selectedTeamId={selectedTeamId}
          onSelectTeam={onSelectTeam}
          onCreateTeam={onCreateTeam}
          isCreatingTeam={isCreatingTeam}
        />
      </motion.div>

      <motion.div className="space-y-4" variants={revealItem} transition={revealItemTransition}>
        <Card className="stack-panel space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Workspace Snapshot</h2>
              <p className="section-subtitle mt-1">
                {activeTeamName
                  ? `Open snapshot details for ${activeTeamName}.`
                  : "Select a workspace to inspect snapshot details."}
              </p>
            </div>
            <Badge variant="neutral">
              {isLoadingSummary || isLoadingMembers ? "Refreshing..." : `${members.length} members`}
            </Badge>
          </div>
          <TeamSummaryCards summary={summary} onSelectMetric={onSelectMetric} />
        </Card>

        <MemberPanel
          members={members}
          isLoadingMembers={isLoadingMembers}
          onCreateMember={onCreateMember}
          isCreatingMember={isCreatingMember}
        />
      </motion.div>
    </AnimatedRouteSection>
  );
}
