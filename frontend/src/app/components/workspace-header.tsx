import { motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";
import { NavLink } from "react-router-dom";

import type { TeamListItem, TeamSummary } from "../../shared/types/api";
import { viewRoutes } from "../config";
import { revealItem } from "../motion";
import type { Theme, WorkspaceView } from "../types";
import { Button } from "../../shared/ui/button";
import { Card } from "../../shared/ui/card";
import { cn } from "../../shared/ui/cn";
import { Select } from "../../shared/ui/select";

type WorkspaceHeaderProps = {
  pathname: string;
  activeView: WorkspaceView;
  teams: TeamListItem[];
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

type ContextAction = {
  label: string;
  to: string;
  match: (pathname: string) => boolean;
};

function isViewActive(pathname: string, viewId: WorkspaceView["id"]): boolean {
  if (viewId === "overview") {
    return pathname.startsWith("/overview");
  }

  if (viewId === "tasks") {
    return pathname.startsWith("/tasks");
  }

  return pathname.startsWith("/team");
}

function resolveContextActions(activeView: WorkspaceView["id"]): ContextAction[] {
  if (activeView === "tasks") {
    return [
      {
        label: "Backlog",
        to: "/tasks/backlog",
        match: (pathname) => pathname.startsWith("/tasks/backlog")
      },
      {
        label: "Create Task",
        to: "/tasks/new",
        match: (pathname) => pathname.startsWith("/tasks/new")
      }
    ];
  }

  if (activeView === "team") {
    return [
      {
        label: "Manage Workspace",
        to: "/team/manage",
        match: (pathname) => pathname.startsWith("/team/manage")
      },
      {
        label: "Snapshot",
        to: "/team/snapshot",
        match: (pathname) => pathname.startsWith("/team/snapshot")
      }
    ];
  }

  return [
    {
      label: "Open Backlog",
      to: "/tasks/backlog",
      match: (pathname) => pathname.startsWith("/tasks/backlog")
    },
    {
      label: "Create Task",
      to: "/tasks/new",
      match: (pathname) => pathname.startsWith("/tasks/new")
    },
    {
      label: "Manage Workspace",
      to: "/team/manage",
      match: (pathname) => pathname.startsWith("/team/manage")
    }
  ];
}

export function WorkspaceHeader({
  pathname,
  activeView,
  teams,
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
  const contextActions = resolveContextActions(activeView.id);

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={revealItem}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
              Team Task Hub
            </p>
            <h1 className="mt-1 font-display text-2xl tracking-tight text-theme-primary md:text-3xl">
              {activeView.label}
            </h1>
            <p className="mt-1 text-sm text-theme-muted">{activeView.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={onToggleTheme}
            >
              {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
          </div>
        </div>

        <div className="surface grid gap-3 p-3 md:grid-cols-[minmax(220px,320px)_minmax(0,1fr)] md:items-center">
          <Select
            value={selectedTeamId ?? ""}
            onChange={(event) => {
              const nextTeamId = Number(event.target.value);
              if (Number.isInteger(nextTeamId) && nextTeamId > 0) {
                onSelectTeam(nextTeamId);
              }
            }}
            disabled={teams.length === 0}
            className="h-10"
            aria-label="Select active workspace"
          >
            <option value="" disabled={teams.length > 0}>
              {teams.length === 0 ? "No workspaces yet" : "Select workspace"}
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>

          <div className="flex flex-wrap items-center gap-2">
            <span className="interactive-chip interactive-chip-strong max-w-[280px] truncate">
              {activeTeamName ?? "No active workspace"}
            </span>
            <span className="interactive-chip">
              {isLoadingInitialData
                ? "Loading tasks"
                : isRefreshingTasksData
                  ? "Refreshing tasks"
                  : `${summary?.totalTasks ?? 0} tasks`}
            </span>
            <span className="interactive-chip">
              {isRefreshingWorkspaceData
                ? "Refreshing members"
                : `${summary?.memberCount ?? 0} members`}
            </span>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-2 lg:items-start">
          <div className="space-y-1">
            <p className="tab-group-label">Sections</p>
            <nav
              className="workspace-tabs workspace-tabs-primary w-full lg:w-fit"
              aria-label="Primary workspace views"
            >
              {viewRoutes.map((view) => (
                <NavLink
                  key={view.id}
                  to={view.path}
                  className={cn(
                    "workspace-tab",
                    isViewActive(pathname, view.id) && "workspace-tab-active"
                  )}
                >
                  <view.icon size={15} />
                  {view.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-1">
            <p className="tab-group-label">Actions</p>
            <nav
              className="workspace-tabs workspace-tabs-actions w-full lg:w-fit"
              aria-label="Current section actions"
            >
              {contextActions.map((action) => (
                <NavLink
                  key={action.to}
                  to={action.to}
                  className={cn(
                    "workspace-tab workspace-tab-action",
                    action.match(pathname) && "workspace-tab-active"
                  )}
                >
                  {action.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </Card>
    </motion.header>
  );
}
