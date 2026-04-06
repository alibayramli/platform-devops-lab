import { FolderKanban, LayoutDashboard, ListChecks, NotebookTabs, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { getInitials } from "../../shared/lib/format";
import type { Member, TeamListItem } from "../../shared/types/api";

type AppSidebarProps = {
  pathname: string;
  teams: TeamListItem[];
  selectedTeamId: number | null;
  members: Member[];
  onSelectTeam: (teamId: number) => void;
};

const mainLinks = [
  {
    label: "Dashboard",
    to: "/overview",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname.startsWith("/overview")
  },
  {
    label: "Tasks",
    to: "/tasks/backlog",
    icon: ListChecks,
    match: (pathname: string) => pathname.startsWith("/tasks")
  },
  {
    label: "Snapshot",
    to: "/team/snapshot",
    icon: NotebookTabs,
    match: (pathname: string) => pathname.startsWith("/team/snapshot")
  },
  {
    label: "Teams",
    to: "/teams",
    icon: UsersRound,
    match: (pathname: string) =>
      pathname.startsWith("/teams") || pathname.startsWith("/team/manage")
  }
];

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
    initials: getInitials(profile.fullName, "PL"),
    name: profile.fullName,
    email: profile.email
  };
}

export function AppSidebar({
  pathname,
  teams,
  selectedTeamId,
  members,
  onSelectTeam
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
              </span>
            </NavLink>
          ))}
        </nav>
      </section>

      <section className="sidebar-section sidebar-section-workspaces">
        <p className="sidebar-section-title">Workspaces</p>
        <div className="sidebar-projects">
          {teams.length === 0 ? (
            <div className="surface empty-state">
              Create a workspace to start tracking tasks and members.
            </div>
          ) : (
            teams.map((team, index) => {
              const isActive = team.id === selectedTeamId;
              const swatchVariant =
                index % 3 === 0
                  ? "sidebar-project-swatch--blue"
                  : index % 3 === 1
                    ? "sidebar-project-swatch--indigo"
                    : "sidebar-project-swatch--purple";

              return (
                <button
                  key={team.id}
                  type="button"
                  className="sidebar-project-button"
                  data-active={isActive}
                  onClick={() => onSelectTeam(team.id)}
                >
                  <span className={`sidebar-project-swatch ${swatchVariant}`} aria-hidden="true">
                    {getInitials(team.name)}
                  </span>
                  <span className="sidebar-project-copy">
                    <span className="sidebar-project-active">
                      <span className="sidebar-project-name">{team.name}</span>
                      {isActive ? <span className="sidebar-project-badge">Active</span> : null}
                    </span>
                    <span className="sidebar-project-meta">
                      {`${team.taskCount} tasks • ${team.memberCount} teammates`}
                    </span>
                  </span>
                </button>
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
      </div>
    </aside>
  );
}
