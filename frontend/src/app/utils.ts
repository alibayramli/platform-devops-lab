import { selectedTeamStorageKey, selectedThemeStorageKey, viewRoutes } from "./config";
import type { Theme, WorkspaceView } from "./types";

export function readStoredTeamId(): number | null {
  const raw = window.localStorage.getItem(selectedTeamStorageKey);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function readStoredTheme(): Theme {
  const raw = window.localStorage.getItem(selectedThemeStorageKey);

  if (raw === "light" || raw === "dark") {
    return raw;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveActiveView(pathname: string): WorkspaceView {
  if (pathname.startsWith("/tasks")) {
    return viewRoutes[1];
  }

  if (pathname.startsWith("/team")) {
    return viewRoutes[2];
  }

  return viewRoutes[0];
}

export function describeRoute(pathname: string): string {
  if (pathname === "/tasks/new") {
    return "Route: task creation";
  }

  if (
    pathname.startsWith("/tasks/") &&
    pathname !== "/tasks/backlog" &&
    pathname !== "/tasks/new"
  ) {
    return "Route: task details";
  }

  if (pathname.startsWith("/tasks/backlog")) {
    return "Route: backlog board";
  }

  if (pathname === "/team/manage") {
    return "Route: team management";
  }

  if (pathname === "/team/snapshot") {
    return "Route: snapshot hub";
  }

  if (pathname.startsWith("/team/snapshot/")) {
    return "Route: snapshot detail";
  }

  return "Route: overview";
}
