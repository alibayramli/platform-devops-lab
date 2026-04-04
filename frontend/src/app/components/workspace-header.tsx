import { motion } from "framer-motion";
import { BarChart3, CalendarDays, MoonStar, Plus, SunMedium, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import type { Member, TeamListItem, TeamSummary } from "../../shared/types/api";
import { Select } from "../../shared/ui/select";
import { revealItem } from "../motion";
import type { Theme, WorkspaceView } from "../types";

type WorkspaceHeaderProps = {
  pathname: string;
  activeView: WorkspaceView;
  teams: TeamListItem[];
  members: Member[];
  selectedTeamId: number | null;
  summary: TeamSummary | undefined;
  activeTeamName: string | null;
  theme: Theme;
  isLoadingInitialData: boolean;
  isRefreshingWorkspaceData: boolean;
  isRefreshingTasksData: boolean;
  onSelectTeam: (teamId: number) => void;
  onToggleTheme: () => void;
};

const tabs = [
  {
    label: "Teams & Roles",
    to: "/team/manage",
    match: (pathname: string) => pathname.startsWith("/team/manage")
  },
  {
    label: "User Profile",
    to: "/tasks/backlog",
    match: (pathname: string) => pathname.startsWith("/tasks/backlog")
  },
  {
    label: "Performance Insights",
    to: "/overview",
    match: (pathname: string) => pathname.startsWith("/overview")
  },
  {
    label: "Settings & Customization",
    to: "/tasks/new",
    match: (pathname: string) => pathname.startsWith("/tasks/new")
  },
  {
    label: "Connected Apps",
    to: "/team/snapshot",
    match: (pathname: string) => pathname.startsWith("/team/snapshot")
  }
];

function resolveInitials(value: string): string {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function resolveTitle(pathname: string, activeView: WorkspaceView): string {
  if (pathname === "/overview") {
    return "Dashboard";
  }

  if (pathname === "/tasks/backlog") {
    return "Task Backlog";
  }

  if (pathname === "/tasks/new") {
    return "Create Task";
  }

  if (pathname.startsWith("/tasks/")) {
    return "Task Details";
  }

  if (pathname === "/team/manage") {
    return "Teams & Roles";
  }

  if (pathname === "/team/snapshot") {
    return "Connected Apps";
  }

  if (pathname.startsWith("/team/snapshot/")) {
    return "Performance Drilldown";
  }

  return activeView.label;
}

function buildMonthRangeLabel(): string {
  const start = new Date();
  start.setDate(1);

  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function WorkspaceHeader({
  pathname,
  activeView,
  teams,
  members,
  selectedTeamId,
  summary,
  activeTeamName,
  theme,
  isLoadingInitialData,
  isRefreshingWorkspaceData,
  isRefreshingTasksData,
  onSelectTeam,
  onToggleTheme
}: WorkspaceHeaderProps) {
  const title = resolveTitle(pathname, activeView);
  const visibleMembers = members.slice(0, 3);
  const hiddenMembers = Math.max(members.length - visibleMembers.length, 0);
  const avatarOverflow = Math.max(hiddenMembers, visibleMembers.length);
  const statusLabel = isLoadingInitialData
    ? "Loading workspace"
    : isRefreshingTasksData
      ? "Refreshing tasks"
      : isRefreshingWorkspaceData
        ? "Refreshing members"
        : `${summary?.totalTasks ?? 0} tasks synced`;

  return (
    <motion.header
      className="dashboard-topbar dashboard-panel"
      initial={false}
      animate="show"
      variants={revealItem}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="dashboard-topbar-main">
        <div className="overview-hero-copy">
          <h1 className="dashboard-page-title">{title}</h1>
          <p className="dashboard-page-copy">
            {activeTeamName
              ? `${activeTeamName} workspace - ${summary?.memberCount ?? 0} team members - ${statusLabel}`
              : "Select or create a workspace to get started."}
          </p>
        </div>

        <div className="dashboard-toolbar">
          {visibleMembers.length ? (
            <div className="dashboard-chip">
              <div className="avatar-stack" aria-hidden="true">
                {visibleMembers.map((member) => (
                  <span key={member.id} className="avatar-stack-item">
                    {resolveInitials(member.fullName)}
                  </span>
                ))}
                <span className="avatar-stack-more">+{avatarOverflow}</span>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="dashboard-chip"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
          </button>

          <div className="dashboard-chip">
            <UsersRound size={16} />
            <Select
              value={selectedTeamId ?? ""}
              onChange={(event) => {
                const nextTeamId = Number(event.target.value);
                if (Number.isInteger(nextTeamId) && nextTeamId > 0) {
                  onSelectTeam(nextTeamId);
                }
              }}
              disabled={teams.length === 0}
              aria-label="Select active workspace"
              className="min-w-[190px] border-none bg-transparent p-0 shadow-none focus:shadow-none"
            >
              <option value="" disabled={teams.length > 0}>
                {teams.length === 0 ? "No workspace yet" : "Select workspace"}
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </div>

          <NavLink to="/team/manage" className="ui-button ui-button-primary ui-button-md">
            <Plus size={16} />
            Add Member
          </NavLink>
        </div>
      </div>

      <div className="dashboard-topbar-bottom">
        <nav className="dashboard-tab-row" aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="dashboard-tab-link"
              data-active={tab.match(pathname)}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-date-chip">
          <CalendarDays size={18} />
          {buildMonthRangeLabel()}
          <BarChart3 size={18} />
        </div>
      </div>
    </motion.header>
  );
}
