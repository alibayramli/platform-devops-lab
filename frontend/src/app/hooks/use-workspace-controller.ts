import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  useCreateMember,
  useDeleteMember,
  useMembers,
  useUpdateMember
} from "../../features/members/hooks/use-members";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask
} from "../../features/tasks/hooks/use-tasks";
import type { CreateTaskInput, UpdateTaskInput } from "../../features/tasks/types";
import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import {
  useCreateTeam,
  useDeleteTeam,
  useTeamSummary,
  useTeams,
  useUpdateTeam
} from "../../features/teams/hooks/use-teams";
import type { MemberRole, TaskFilters, TaskStatus } from "../../shared/types/api";
import { selectedTeamStorageKey, selectedThemeStorageKey } from "../config";
import type { Theme } from "../types";
import { readStoredTeamId, readStoredTheme, resolveActiveView } from "../utils";

const emptyTaskFilters: TaskFilters = {};

function resolveErrorMessage(values: unknown[]): string {
  for (const value of values) {
    if (value instanceof Error && value.message) {
      return value.message;
    }
  }

  return "Unexpected error";
}

export function useWorkspaceController() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(() => readStoredTeamId());
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  const [filters, setFilters] = useState<TaskFilters>({});
  const deferredFilters = useDeferredValue(filters);

  const teamsQuery = useTeams();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  const membersQuery = useMembers(selectedTeamId);
  const summaryQuery = useTeamSummary(selectedTeamId);
  const allTasksQuery = useTasks(selectedTeamId, emptyTaskFilters);
  const filteredTasksQuery = useTasks(selectedTeamId, deferredFilters);

  const createMemberMutation = useCreateMember(selectedTeamId);
  const updateMemberMutation = useUpdateMember(selectedTeamId);
  const deleteMemberMutation = useDeleteMember(selectedTeamId);
  const createTaskMutation = useCreateTask(selectedTeamId);
  const updateTaskMutation = useUpdateTask(selectedTeamId);
  const deleteTaskMutation = useDeleteTask(selectedTeamId);

  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const tasks = useMemo(() => allTasksQuery.data ?? [], [allTasksQuery.data]);
  const filteredTasks = useMemo(() => filteredTasksQuery.data ?? [], [filteredTasksQuery.data]);

  const activeTeam = useMemo(() => {
    if (typeof selectedTeamId !== "number") {
      return null;
    }

    return teams.find((team) => team.id === selectedTeamId) ?? null;
  }, [selectedTeamId, teams]);

  const activeView = useMemo(() => resolveActiveView(location.pathname), [location.pathname]);

  const isLoadingInitialData =
    teamsQuery.isLoading || membersQuery.isLoading || allTasksQuery.isLoading;
  const isRefreshingWorkspaceData =
    teamsQuery.isFetching || membersQuery.isFetching || summaryQuery.isFetching;

  const isTasksBacklogRoute = location.pathname.startsWith("/tasks/backlog");
  const isTaskDetailRoute =
    location.pathname.startsWith("/tasks/") &&
    location.pathname !== "/tasks/backlog" &&
    location.pathname !== "/tasks/new";
  const isOverviewRoute = location.pathname.startsWith("/overview");
  const isSnapshotDetailRoute = location.pathname.startsWith("/team/snapshot/");

  const isRefreshingVisibleTasks = isTasksBacklogRoute
    ? filteredTasksQuery.isFetching
    : isOverviewRoute || isTaskDetailRoute || isSnapshotDetailRoute
      ? allTasksQuery.isFetching
      : false;

  const hasWorkspaceError =
    teamsQuery.isError ||
    membersQuery.isError ||
    allTasksQuery.isError ||
    filteredTasksQuery.isError ||
    summaryQuery.isError;

  const errorMessage = hasWorkspaceError
    ? resolveErrorMessage([
        teamsQuery.error,
        membersQuery.error,
        allTasksQuery.error,
        filteredTasksQuery.error,
        summaryQuery.error
      ])
    : null;

  function persistSelectedTeam(teamId: number | null) {
    setSelectedTeamId(teamId);

    if (typeof teamId === "number") {
      window.localStorage.setItem(selectedTeamStorageKey, String(teamId));
      return;
    }

    window.localStorage.removeItem(selectedTeamStorageKey);
  }

  useEffect(() => {
    if (!teams.length) {
      return;
    }

    const hasExistingSelection =
      typeof selectedTeamId === "number" && teams.some((team) => team.id === selectedTeamId);

    if (hasExistingSelection) {
      return;
    }

    persistSelectedTeam(teams[0].id);
  }, [selectedTeamId, teams]);

  useEffect(() => {
    if (teamsQuery.isLoading) {
      return;
    }

    if (
      !teams.length &&
      !location.pathname.startsWith("/team") &&
      !location.pathname.startsWith("/teams")
    ) {
      void navigate("/teams", { replace: true });
    }
  }, [location.pathname, navigate, teams.length, teamsQuery.isLoading]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.localStorage.setItem(selectedThemeStorageKey, theme);
  }, [theme]);

  async function handleCreateTeam(input: Parameters<typeof createTeamMutation.mutateAsync>[0]) {
    const newTeam = await createTeamMutation.mutateAsync(input);
    persistSelectedTeam(newTeam.id);
  }

  async function handleCreateMember(input: { fullName: string; email: string; role: MemberRole }) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await createMemberMutation.mutateAsync(input);
  }

  async function handleUpdateMember(
    memberId: number,
    input: { fullName?: string; email?: string; role?: MemberRole }
  ) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await updateMemberMutation.mutateAsync({
      memberId,
      patch: input
    });
  }

  async function handleDeleteMember(memberId: number) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await deleteMemberMutation.mutateAsync(memberId);
  }

  async function handleCreateTask(input: CreateTaskInput) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await createTaskMutation.mutateAsync(input);
  }

  async function handleUpdateTaskStatus(taskId: number, status: TaskStatus) {
    await handleUpdateTask(taskId, { status });
  }

  async function handleUpdateTask(taskId: number, patch: UpdateTaskInput) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await updateTaskMutation.mutateAsync({
      taskId,
      patch
    });
  }

  async function handleDeleteTask(taskId: number) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await deleteTaskMutation.mutateAsync(taskId);
  }

  async function handleUpdateTeam(
    teamId: number,
    input: { name?: string; description?: string | null }
  ) {
    await updateTeamMutation.mutateAsync({
      teamId,
      patch: input
    });
  }

  async function handleDeleteTeam(teamId: number) {
    await deleteTeamMutation.mutateAsync(teamId);

    const remainingTeams = teams.filter((team) => team.id !== teamId);
    const nextTeamId = selectedTeamId === teamId ? (remainingTeams[0]?.id ?? null) : selectedTeamId;

    persistSelectedTeam(nextTeamId);
  }

  function handleSelectTeam(teamId: number) {
    persistSelectedTeam(teamId);
  }

  function handleToggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  function handleSelectMetric(metricId: SummaryMetricId) {
    void navigate(`/team/snapshot/${metricId}`);
  }

  function handleOpenTask(taskId: number) {
    void navigate(`/tasks/${taskId}`);
  }

  return {
    actions: {
      createMember: handleCreateMember,
      createTask: handleCreateTask,
      createTeam: handleCreateTeam,
      deleteMember: handleDeleteMember,
      deleteTask: handleDeleteTask,
      deleteTeam: handleDeleteTeam,
      openTask: handleOpenTask,
      selectMetric: handleSelectMetric,
      selectTeam: handleSelectTeam,
      setFilters,
      toggleTheme: handleToggleTheme,
      updateMember: handleUpdateMember,
      updateTask: handleUpdateTask,
      updateTaskStatus: handleUpdateTaskStatus,
      updateTeam: handleUpdateTeam
    },
    data: {
      activeTeam,
      activeView,
      filteredTasks,
      filters,
      location,
      members,
      selectedTeamId,
      summary: summaryQuery.data,
      tasks,
      teams,
      theme
    },
    mutations: {
      createMember: createMemberMutation,
      createTask: createTaskMutation,
      createTeam: createTeamMutation,
      deleteMember: deleteMemberMutation,
      deleteTask: deleteTaskMutation,
      deleteTeam: deleteTeamMutation,
      updateMember: updateMemberMutation,
      updateTask: updateTaskMutation,
      updateTeam: updateTeamMutation
    },
    status: {
      errorMessage,
      isLoadingInitialData,
      isLoadingMembers: membersQuery.isFetching,
      isRefreshingVisibleTasks,
      isRefreshingWorkspaceData
    }
  };
}

export type WorkspaceController = ReturnType<typeof useWorkspaceController>;
