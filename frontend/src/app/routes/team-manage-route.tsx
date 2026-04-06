import { motion } from "framer-motion";

import { MemberPanel } from "../../features/members/components/member-panel";
import { TeamSwitcher } from "../../features/teams/components/team-switcher";
import { formatShortDate } from "../../shared/lib/format";
import type { Member, TeamListItem } from "../../shared/types/api";
import { Badge } from "../../shared/ui/badge";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type CreateTeamInput = { name: string; description?: string };
type CreateMemberInput = { fullName: string; email: string; role: "lead" | "member" | "observer" };
type UpdateTeamInput = { name?: string; description?: string | null };
type UpdateMemberInput = {
  fullName?: string;
  email?: string;
  role?: "lead" | "member" | "observer";
};

type TeamManageRouteProps = {
  teams: TeamListItem[];
  selectedTeamId: number | null;
  activeTeamName: string | null;
  members: Member[];
  isLoadingMembers: boolean;
  isCreatingTeam: boolean;
  isUpdatingTeam: boolean;
  isDeletingTeam: boolean;
  isCreatingMember: boolean;
  isUpdatingMember: boolean;
  isDeletingMember: boolean;
  onCreateTeam: (input: CreateTeamInput) => Promise<void>;
  onUpdateTeam: (teamId: number, input: UpdateTeamInput) => Promise<void>;
  onDeleteTeam: (teamId: number) => Promise<void>;
  onCreateMember: (input: CreateMemberInput) => Promise<void>;
  onUpdateMember: (memberId: number, input: UpdateMemberInput) => Promise<void>;
  onDeleteMember: (memberId: number) => Promise<void>;
};

export function TeamManageRoute({
  teams,
  selectedTeamId,
  activeTeamName,
  members,
  isLoadingMembers,
  isCreatingTeam,
  isUpdatingTeam,
  isDeletingTeam,
  isCreatingMember,
  isUpdatingMember,
  isDeletingMember,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onCreateMember,
  onUpdateMember,
  onDeleteMember
}: TeamManageRouteProps) {
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="stack-panel space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Administration Overview</h2>
              <p className="section-subtitle mt-1">
                Review workspaces, create new ones, and manage workspace members.
              </p>
            </div>
            <Badge variant="neutral">{teams.length} workspaces</Badge>
          </div>

          <div className="admin-summary-grid">
            <div className="surface admin-summary-card">
              <div className="detail-stat-label">Selected Workspace</div>
              <div className="admin-summary-value">{activeTeamName ?? "None selected"}</div>
              <div className="admin-summary-copy">
                Current workspace used for member and task updates.
              </div>
            </div>
            <div className="surface admin-summary-card">
              <div className="detail-stat-label">Workspace Members</div>
              <div className="admin-summary-value">{members.length}</div>
              <div className="admin-summary-copy">
                People currently assigned to the selected workspace.
              </div>
            </div>
            <div className="surface admin-summary-card">
              <div className="detail-stat-label">Registered Workspaces</div>
              <div className="admin-summary-value">{teams.length}</div>
              <div className="admin-summary-copy">All workspaces available in Optitask.</div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="team-admin-grid">
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <TeamSwitcher
            activeTeam={selectedTeam}
            onCreateTeam={onCreateTeam}
            onUpdateTeam={onUpdateTeam}
            onDeleteTeam={onDeleteTeam}
            isCreatingTeam={isCreatingTeam}
            isUpdatingTeam={isUpdatingTeam}
            isDeletingTeam={isDeletingTeam}
          />
        </motion.div>

        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="stack-panel space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="section-title">Workspace Directory</h2>
                <p className="section-subtitle mt-1">
                  Review workspace size, task volume, and ownership at a glance.
                </p>
              </div>
              <Badge variant="neutral">
                {activeTeamName ? `${activeTeamName} selected` : "No workspace selected"}
              </Badge>
            </div>

            {teams.length === 0 ? (
              <div className="surface empty-state">
                No workspaces yet. Create the first workspace from the panel on the left.
              </div>
            ) : (
              <div className="workspace-directory-scroll">
                <ul className="workspace-list workspace-directory-grid">
                  {teams.map((team) => {
                    const isActive = team.id === selectedTeamId;

                    return (
                      <li
                        key={team.id}
                        className="workspace-item surface workspace-directory-card"
                        data-active={isActive}
                      >
                        <div className="min-w-0">
                          <div className="workspace-directory-header">
                            <p className="row-title">{team.name}</p>
                            {isActive ? <Badge variant="deep">Selected</Badge> : null}
                          </div>
                          <p className="row-subtitle">
                            {team.description?.trim() || "No description added yet."}
                          </p>
                        </div>
                        <div className="workspace-directory-meta">
                          <span>{team.memberCount} members</span>
                          <span>{team.taskCount} tasks</span>
                          <span>Created {formatShortDate(team.createdAt)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={revealItem} transition={revealItemTransition}>
          <MemberPanel
            activeTeamName={activeTeamName}
            members={members}
            isLoadingMembers={isLoadingMembers}
            onCreateMember={onCreateMember}
            onUpdateMember={onUpdateMember}
            onDeleteMember={onDeleteMember}
            isCreatingMember={isCreatingMember}
            isUpdatingMember={isUpdatingMember}
            isDeletingMember={isDeletingMember}
          />
        </motion.div>
      </div>
    </AnimatedRouteSection>
  );
}
