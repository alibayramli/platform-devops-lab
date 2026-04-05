import { motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";
import { NavLink } from "react-router-dom";

import type { Member, TeamSummary } from "../../shared/types/api";
import { revealItem } from "../motion";
import type { Theme, WorkspaceView } from "../types";

type WorkspaceHeaderProps = {
  pathname: string;
  activeView: WorkspaceView;
  members: Member[];
  summary: TeamSummary | undefined;
  activeTeamName: string | null;
  theme: Theme;
  isLoadingInitialData: boolean;
  isRefreshingWorkspaceData: boolean;
  isRefreshingTasksData: boolean;
  onToggleTheme: () => void;
};

const dashboardTabs = [
  {
    label: "Overview",
    to: "/overview",
    match: (pathname: string) => pathname === "/overview"
  },
  {
    label: "Performance",
    to: "/overview/performance",
    match: (pathname: string) => pathname.startsWith("/overview/performance")
  }
];

const taskTabs = [
  {
    label: "Backlog",
    to: "/tasks/backlog",
    match: (pathname: string) =>
      pathname.startsWith("/tasks/backlog") ||
      (pathname.startsWith("/tasks/") && pathname !== "/tasks/new" && pathname !== "/tasks/backlog")
  },
  {
    label: "Create Task",
    to: "/tasks/new",
    match: (pathname: string) => pathname.startsWith("/tasks/new")
  }
];

function resolveTabs(pathname: string) {
  if (pathname.startsWith("/overview")) {
    return dashboardTabs;
  }

  if (pathname.startsWith("/tasks")) {
    return taskTabs;
  }

  return [];
}

function resolveInitials(value: string): string {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function resolveTitle(pathname: string, activeView: WorkspaceView): string {
  if (pathname.startsWith("/overview")) {
    return "Dashboard";
  }

  if (pathname.startsWith("/tasks/")) {
    return "Tasks";
  }

  if (pathname === "/teams" || pathname === "/team/manage") {
    return "Team Management";
  }

  if (pathname.startsWith("/team/snapshot")) {
    return "Snapshot";
  }

  return activeView.label;
}

export function WorkspaceHeader({
  pathname,
  activeView,
  members,
  summary,
  activeTeamName,
  theme,
  isLoadingInitialData,
  isRefreshingWorkspaceData,
  isRefreshingTasksData,
  onToggleTheme
}: WorkspaceHeaderProps) {
  const title = resolveTitle(pathname, activeView);
  const tabs = resolveTabs(pathname);
  const visibleMembers = members.slice(0, 3);
  const hiddenMembers = Math.max(members.length - visibleMembers.length, 0);
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
            <div className="dashboard-chip dashboard-chip-members">
              <div className="avatar-stack" aria-hidden="true">
                {visibleMembers.map((member) => (
                  <span key={member.id} className="avatar-stack-item">
                    {resolveInitials(member.fullName)}
                  </span>
                ))}
                {hiddenMembers > 0 ? (
                  <span className="avatar-stack-more">+{hiddenMembers}</span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="dashboard-toolbar-actions">
            <button
              type="button"
              className="dashboard-chip dashboard-theme-toggle"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
            </button>
          </div>
        </div>
      </div>

      {tabs.length ? (
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
        </div>
      ) : null}
    </motion.header>
  );
}
