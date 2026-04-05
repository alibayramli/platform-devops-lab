import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import {
  useCreateMember,
  useDeleteMember,
  useMembers,
  useUpdateMember
} from "../features/members/hooks/use-members";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask
} from "../features/tasks/hooks/use-tasks";
import type { SummaryMetricId } from "../features/teams/components/team-summary-cards";
import {
  useCreateTeam,
  useDeleteTeam,
  useTeamSummary,
  useTeams,
  useUpdateTeam
} from "../features/teams/hooks/use-teams";
import type { MemberRole, TaskFilters, TaskPriority, TaskStatus } from "../shared/types/api";
import { Card } from "../shared/ui/card";
import { selectedTeamStorageKey, selectedThemeStorageKey } from "./config";
import { AppSidebar } from "./components/app-sidebar";
import { DataSyncIndicator } from "./components/data-sync-indicator";
import { WorkspaceHeader } from "./components/workspace-header";
import { OverviewRoute } from "./routes/overview-route";
import { OverviewPerformanceRoute } from "./routes/overview-performance-route";
import { TaskDetailRoute } from "./routes/task-detail-route";
import { TasksBacklogRoute } from "./routes/tasks-backlog-route";
import { TasksNewRoute } from "./routes/tasks-new-route";
import { TeamManageRoute } from "./routes/team-manage-route";
import { TeamSnapshotDetailRoute } from "./routes/team-snapshot-detail-route";
import { TeamSnapshotRoute } from "./routes/team-snapshot-route";
import type { Theme } from "./types";
import { readStoredTeamId, readStoredTheme, resolveActiveView } from "./utils";

function resolveErrorMessage(values: unknown[]): string {
  for (const value of values) {
    if (value instanceof Error && value.message) {
      return value.message;
    }
  }

  return "Unexpected error";
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const teamsQuery = useTeams();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(() => readStoredTeamId());
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  const [filters, setFilters] = useState<TaskFilters>({});
  const allTaskFilters = useMemo<TaskFilters>(() => ({}), []);

  const membersQuery = useMembers(selectedTeamId);
  const summaryQuery = useTeamSummary(selectedTeamId);
  const allTasksQuery = useTasks(selectedTeamId, allTaskFilters);
  const filteredTasksQuery = useTasks(selectedTeamId, filters);

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

  const activeTeam = useMemo(() => {
    if (typeof selectedTeamId !== "number") {
      return null;
    }

    return teams.find((team) => team.id === selectedTeamId) ?? null;
  }, [selectedTeamId, teams]);

  const activeView = useMemo(() => resolveActiveView(location.pathname), [location.pathname]);

  useEffect(() => {
    if (!teams.length) {
      return;
    }

    const hasExistingSelection =
      typeof selectedTeamId === "number" && teams.some((team) => team.id === selectedTeamId);

    if (hasExistingSelection) {
      return;
    }

    const fallbackTeamId = teams[0].id;
    setSelectedTeamId(fallbackTeamId);
    window.localStorage.setItem(selectedTeamStorageKey, String(fallbackTeamId));
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
    setSelectedTeamId(newTeam.id);
    window.localStorage.setItem(selectedTeamStorageKey, String(newTeam.id));
  }

  async function handleCreateMember(input: Parameters<typeof createMemberMutation.mutateAsync>[0]) {
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

  async function handleCreateTask(input: Parameters<typeof createTaskMutation.mutateAsync>[0]) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await createTaskMutation.mutateAsync(input);
  }

  async function handleUpdateTaskStatus(taskId: number, status: TaskStatus) {
    await handleUpdateTask(taskId, { status });
  }

  async function handleUpdateTask(
    taskId: number,
    patch: Partial<{
      title: string;
      description: string | null;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string | null;
      assigneeId: number | null;
    }>
  ) {
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

    setSelectedTeamId(nextTeamId);

    if (typeof nextTeamId === "number") {
      window.localStorage.setItem(selectedTeamStorageKey, String(nextTeamId));
    } else {
      window.localStorage.removeItem(selectedTeamStorageKey);
    }
  }

  function handleSelectTeam(teamId: number) {
    setSelectedTeamId(teamId);
    window.localStorage.setItem(selectedTeamStorageKey, String(teamId));
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

  return (
    <main className="dashboard-shell">
      <div className="dashboard-frame">
        <AppSidebar
          pathname={location.pathname}
          teams={teams}
          selectedTeamId={selectedTeamId}
          members={members}
          onSelectTeam={handleSelectTeam}
        />

        <section className="dashboard-main">
          <WorkspaceHeader
            pathname={location.pathname}
            activeView={activeView}
            members={members}
            summary={summaryQuery.data}
            activeTeamName={activeTeam?.name ?? null}
            theme={theme}
            isLoadingInitialData={isLoadingInitialData}
            isRefreshingWorkspaceData={isRefreshingWorkspaceData}
            isRefreshingTasksData={isRefreshingVisibleTasks}
            onToggleTheme={handleToggleTheme}
          />

          {isRefreshingVisibleTasks || isRefreshingWorkspaceData ? (
            <DataSyncIndicator
              label={
                isRefreshingVisibleTasks ? "Refreshing tasks..." : "Refreshing workspace data..."
              }
            />
          ) : null}

          {teamsQuery.isError ||
          membersQuery.isError ||
          allTasksQuery.isError ||
          filteredTasksQuery.isError ||
          summaryQuery.isError ? (
            <Card className="detail-card">
              <p className="text-sm font-semibold text-[var(--danger)]">
                {resolveErrorMessage([
                  teamsQuery.error,
                  membersQuery.error,
                  allTasksQuery.error,
                  filteredTasksQuery.error,
                  summaryQuery.error
                ])}
              </p>
            </Card>
          ) : null}

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/team/manage" element={<Navigate to="/teams" replace />} />
              <Route
                path="/overview"
                element={
                  <OverviewRoute
                    summary={summaryQuery.data}
                    activeTeamName={activeTeam?.name ?? null}
                    tasks={tasks}
                    totalTaskCount={tasks.length}
                    onSelectMetric={handleSelectMetric}
                  />
                }
              />
              <Route
                path="/overview/performance"
                element={
                  <OverviewPerformanceRoute
                    activeTeamName={activeTeam?.name ?? null}
                    members={members}
                    tasks={tasks}
                    isLoadingInitialData={isLoadingInitialData}
                    isRefreshingTasks={isRefreshingVisibleTasks}
                    onOpenTask={handleOpenTask}
                  />
                }
              />

              <Route path="/tasks" element={<Navigate to="/tasks/backlog" replace />} />
              <Route
                path="/tasks/backlog"
                element={
                  <TasksBacklogRoute
                    members={members}
                    filters={filters}
                    tasks={filteredTasks}
                    isLoadingTasks={filteredTasksQuery.isFetching}
                    isUpdatingTask={updateTaskMutation.isPending}
                    isDeletingTask={deleteTaskMutation.isPending}
                    onChangeFilters={setFilters}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onDeleteTask={handleDeleteTask}
                    onOpenTask={handleOpenTask}
                  />
                }
              />
              <Route
                path="/tasks/new"
                element={
                  <TasksNewRoute
                    members={members}
                    onCreateTask={handleCreateTask}
                    isCreatingTask={createTaskMutation.isPending}
                  />
                }
              />
              <Route
                path="/tasks/:taskId"
                element={
                  <TaskDetailRoute
                    tasks={tasks}
                    members={members}
                    isLoadingTasks={allTasksQuery.isFetching}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    isUpdatingTask={updateTaskMutation.isPending}
                    isDeletingTask={deleteTaskMutation.isPending}
                  />
                }
              />

              <Route path="/team" element={<Navigate to="/teams" replace />} />
              <Route
                path="/teams"
                element={
                  <TeamManageRoute
                    teams={teams}
                    selectedTeamId={selectedTeamId}
                    activeTeamName={activeTeam?.name ?? null}
                    members={members}
                    isLoadingMembers={membersQuery.isFetching}
                    isCreatingTeam={createTeamMutation.isPending}
                    isUpdatingTeam={updateTeamMutation.isPending}
                    isDeletingTeam={deleteTeamMutation.isPending}
                    isCreatingMember={createMemberMutation.isPending}
                    isUpdatingMember={updateMemberMutation.isPending}
                    isDeletingMember={deleteMemberMutation.isPending}
                    onCreateTeam={handleCreateTeam}
                    onUpdateTeam={handleUpdateTeam}
                    onDeleteTeam={handleDeleteTeam}
                    onCreateMember={handleCreateMember}
                    onUpdateMember={handleUpdateMember}
                    onDeleteMember={handleDeleteMember}
                  />
                }
              />
              <Route
                path="/team/snapshot"
                element={
                  <TeamSnapshotRoute
                    summary={summaryQuery.data}
                    activeTeamName={activeTeam?.name ?? null}
                    onSelectMetric={handleSelectMetric}
                  />
                }
              />
              <Route
                path="/team/snapshot/:metric"
                element={
                  <TeamSnapshotDetailRoute
                    activeTeamName={activeTeam?.name ?? null}
                    members={members}
                    tasks={tasks}
                    isLoadingTasks={allTasksQuery.isFetching}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    isUpdatingTask={updateTaskMutation.isPending}
                    onDeleteTask={handleDeleteTask}
                    isDeletingTask={deleteTaskMutation.isPending}
                    onOpenTask={handleOpenTask}
                  />
                }
              />

              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

export default App;
