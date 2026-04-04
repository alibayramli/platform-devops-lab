import {
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MoonStar,
  NotebookTabs,
  Sparkles,
  SunMedium,
  UsersRound
} from "lucide-react";
import { NavLink } from "react-router-dom";

import type { Member, TeamListItem } from "../../shared/types/api";
import { cn } from "../../shared/ui/cn";
import type { Theme } from "../types";

type AppSidebarProps = {
  pathname: string;
  teams: TeamListItem[];
  selectedTeamId: number | null;
  members: Member[];
  theme: Theme;
  onSelectTeam: (teamId: number) => void;
  onToggleTheme: () => void;
};

const mainLinks = [
  {
    label: "Dashboard",
    note: "Performance insights",
    to: "/overview",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname.startsWith("/overview")
  },
  {
    label: "Project Brief",
    note: "Snapshot breakdown",
    to: "/team/snapshot",
    icon: NotebookTabs,
    match: (pathname: string) => pathname.startsWith("/team/snapshot")
  },
  {
    label: "Task Backlog",
    note: "Review and update work",
    to: "/tasks/backlog",
    icon: ListChecks,
    match: (pathname: string) => pathname.startsWith("/tasks/backlog")
  },
  {
    label: "Task Composer",
    note: "Create a new item",
    to: "/tasks/new",
    icon: Sparkles,
    match: (pathname: string) => pathname.startsWith("/tasks/new")
  },
  {
    label: "Teams & Roles",
    note: "Workspace setup",
    to: "/team/manage",
    icon: UsersRound,
    match: (pathname: string) => pathname.startsWith("/team/manage")
  }
];

const projectShortcuts = [
  {
    label: "Slack Notes",
    to: "/team/snapshot",
    match: (pathname: string) => pathname.startsWith("/team/snapshot")
  },
  {
    label: "Brief Projects",
    to: "/tasks/backlog",
    match: (pathname: string) => pathname.startsWith("/tasks/backlog")
  },
  {
    label: "Dashboard Kit",
    to: "/team/manage",
    match: (pathname: string) => pathname.startsWith("/team/manage")
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

function resolveProfile(members: Member[]) {
  const profile = members[0];

  if (!profile) {
    return {
      initials: "PL",
      name: "Platform Lab",
      email: "ops@platform-lab.local"
    };
  }

  return {
    initials: resolveInitials(profile.fullName),
    name: profile.fullName,
    email: profile.email
  };
}

export function AppSidebar({
  pathname,
  teams,
  selectedTeamId,
  members,
  theme,
  onSelectTeam,
  onToggleTheme
}: AppSidebarProps) {
  const profile = resolveProfile(members);

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          <FolderKanban size={20} />
        </div>
        <div className="sidebar-brand-text">
          <p className="sidebar-brand-title">Optitask</p>
          <p className="sidebar-brand-copy">Task Management Dashboard</p>
        </div>
      </div>

      <section className="sidebar-section">
        <p className="sidebar-section-title">Main Menu</p>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="sidebar-link"
              data-active={link.match(pathname)}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                <link.icon size={18} />
              </span>
              <span className="sidebar-link-copy">
                <span className="sidebar-link-label">{link.label}</span>
                <span className="sidebar-link-note">{link.note}</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </section>

      <section className="sidebar-section">
        <p className="sidebar-section-title">Projects Files</p>
        <div className="sidebar-projects">
          {teams.length === 0 ? (
            <div className="surface empty-state">Create a workspace to populate this rail.</div>
          ) : (
            teams.map((team, index) => {
              const isActive = team.id === selectedTeamId;

              return (
                <div key={team.id}>
                  <button
                    type="button"
                    className="sidebar-project-button"
                    data-active={isActive}
                    onClick={() => onSelectTeam(team.id)}
                  >
                    <span
                      className="sidebar-project-swatch"
                      style={{
                        background:
                          index % 3 === 0
                            ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,.32), transparent 35%), linear-gradient(135deg, #4d5bff, #7c8aff)"
                            : index % 3 === 1
                              ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,.32), transparent 35%), linear-gradient(135deg, #2e3f82, #5a7de4)"
                              : "radial-gradient(circle at 30% 30%, rgba(255,255,255,.32), transparent 35%), linear-gradient(135deg, #a04dff, #6d61ff)"
                      }}
                      aria-hidden="true"
                    >
                      {resolveInitials(team.name)}
                    </span>
                    <span className="sidebar-project-copy">
                      <span className="sidebar-project-active">
                        <span className="sidebar-project-name">{team.name}</span>
                        {isActive ? <span className="sidebar-project-badge">Active</span> : null}
                      </span>
                      <span className="sidebar-project-meta">
                        {team.taskCount} tasks and {team.memberCount} teammates
                      </span>
                    </span>
                  </button>

                  {isActive ? (
                    <div className="sidebar-subnav" aria-label={`${team.name} shortcuts`}>
                      {projectShortcuts.map((shortcut) => (
                        <NavLink
                          key={shortcut.to}
                          to={shortcut.to}
                          className="sidebar-subnav-link"
                          data-active={shortcut.match(pathname)}
                        >
                          <span className="sidebar-subnav-dot" aria-hidden="true">
                            <ChevronRight size={14} />
                          </span>
                          {shortcut.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="sidebar-user-card">
        <div className="sidebar-user-copy">
          <span className="avatar" aria-hidden="true">
            {profile.initials}
          </span>
          <div className="min-w-0">
            <div className="sidebar-user-name">{profile.name}</div>
            <div className="sidebar-user-email">{profile.email}</div>
          </div>
        </div>

        <button
          type="button"
          className={cn("sidebar-user-action")}
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </button>
      </div>
    </aside>
  );
}
