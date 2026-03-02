import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { useCreateMember, useMembers } from "../features/members/hooks/use-members";
import { useCreateTask, useTasks, useUpdateTask } from "../features/tasks/hooks/use-tasks";
import type { SummaryMetricId } from "../features/teams/components/team-summary-cards";
import { useCreateTeam, useTeamSummary, useTeams } from "../features/teams/hooks/use-teams";
import type { TaskFilters, TaskStatus } from "../shared/types/api";
import { Card } from "../shared/ui/card";
import { selectedTeamStorageKey, selectedThemeStorageKey } from "./config";
import { DataSyncIndicator } from "./components/data-sync-indicator";
import { WorkspaceHeader } from "./components/workspace-header";
import { OverviewRoute } from "./routes/overview-route";
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
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(() => readStoredTeamId());
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  const [filters, setFilters] = useState<TaskFilters>({});
  const allTaskFilters = useMemo<TaskFilters>(() => ({}), []);

  const membersQuery = useMembers(selectedTeamId);
  const summaryQuery = useTeamSummary(selectedTeamId);
  const allTasksQuery = useTasks(selectedTeamId, allTaskFilters);
  const filteredTasksQuery = useTasks(selectedTeamId, filters);

  const createMemberMutation = useCreateMember(selectedTeamId);
  const createTaskMutation = useCreateTask(selectedTeamId);
  const updateTaskMutation = useUpdateTask(selectedTeamId);

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

  const visibleOverviewTasks = useMemo(() => {
    return [...tasks]
      .sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      )
      .slice(0, 8);
  }, [tasks]);

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
    if (!teams.length && !location.pathname.startsWith("/team")) {
      void navigate("/team/manage", { replace: true });
    }
  }, [location.pathname, navigate, teams.length]);

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

  async function handleCreateTask(input: Parameters<typeof createTaskMutation.mutateAsync>[0]) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await createTaskMutation.mutateAsync(input);
  }

  async function handleUpdateTaskStatus(taskId: number, status: TaskStatus) {
    if (typeof selectedTeamId !== "number") {
      return;
    }

    await updateTaskMutation.mutateAsync({
      taskId,
      patch: { status }
    });
  }

  function handleSelectTeam(teamId: number) {
    setSelectedTeamId(teamId);
    window.localStorage.setItem(selectedTeamStorageKey, String(teamId));
  }

  function handleSelectMetric(metricId: SummaryMetricId) {
    void navigate(`/team/snapshot/${metricId}`);
  }

  function handleOpenTask(taskId: number) {
    void navigate(`/tasks/${taskId}`);
  }

  return (
    <main className="app-shell pb-10">
      <div className="relative mx-auto grid w-full max-w-[1080px] gap-4 px-4 py-5 md:px-6 lg:gap-5 lg:py-8">
        <WorkspaceHeader
          pathname={location.pathname}
          activeView={activeView}
          teams={teams}
          selectedTeamId={selectedTeamId}
          summary={summaryQuery.data}
          activeTeamName={activeTeam?.name ?? null}
          theme={theme}
          isLoadingInitialData={isLoadingInitialData}
          isRefreshingWorkspaceData={isRefreshingWorkspaceData}
          isRefreshingTasksData={isRefreshingVisibleTasks}
          onSelectTeam={handleSelectTeam}
          onToggleTheme={() =>
            setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
          }
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
          <Card className="border-[var(--badge-danger-text)]/30 bg-[var(--badge-danger-bg)]">
            <p className="text-sm font-semibold text-[var(--badge-danger-text)]">
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
            <Route
              path="/overview"
              element={
                <OverviewRoute
                  summary={summaryQuery.data}
                  activeTeamName={activeTeam?.name ?? null}
                  tasks={visibleOverviewTasks}
                  totalTaskCount={tasks.length}
                  isLoadingInitialData={isLoadingInitialData}
                  isRefreshingTasks={isRefreshingVisibleTasks}
                  isUpdatingTask={updateTaskMutation.isPending}
                  onSelectMetric={handleSelectMetric}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
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
                  onChangeFilters={setFilters}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
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
                  isLoadingTasks={allTasksQuery.isFetching}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  isUpdatingTask={updateTaskMutation.isPending}
                />
              }
            />

            <Route path="/team" element={<Navigate to="/team/manage" replace />} />
            <Route
              path="/team/manage"
              element={
                <TeamManageRoute
                  teams={teams}
                  selectedTeamId={selectedTeamId}
                  activeTeamName={activeTeam?.name ?? null}
                  members={members}
                  summary={summaryQuery.data}
                  isLoadingTeams={teamsQuery.isFetching}
                  isLoadingMembers={membersQuery.isFetching}
                  isLoadingSummary={summaryQuery.isFetching}
                  isCreatingTeam={createTeamMutation.isPending}
                  isCreatingMember={createMemberMutation.isPending}
                  onSelectTeam={handleSelectTeam}
                  onCreateTeam={handleCreateTeam}
                  onCreateMember={handleCreateMember}
                  onSelectMetric={handleSelectMetric}
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
                  onOpenTask={handleOpenTask}
                />
              }
            />

            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </main>
  );
}

export default App;
