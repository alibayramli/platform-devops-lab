import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import { Card } from "../shared/ui/card";
import { AppSidebar } from "./components/app-sidebar";
import { DataSyncIndicator } from "./components/data-sync-indicator";
import { RouteLoadingState } from "./components/route-loading-state";
import { WorkspaceHeader } from "./components/workspace-header";
import { useWorkspaceController } from "./hooks/use-workspace-controller";

const OverviewRoute = lazy(async () => {
  const module = await import("./routes/overview-route");
  return { default: module.OverviewRoute };
});

const OverviewPerformanceRoute = lazy(async () => {
  const module = await import("./routes/overview-performance-route");
  return { default: module.OverviewPerformanceRoute };
});

const TaskDetailRoute = lazy(async () => {
  const module = await import("./routes/task-detail-route");
  return { default: module.TaskDetailRoute };
});

const TasksBacklogRoute = lazy(async () => {
  const module = await import("./routes/tasks-backlog-route");
  return { default: module.TasksBacklogRoute };
});

const TasksNewRoute = lazy(async () => {
  const module = await import("./routes/tasks-new-route");
  return { default: module.TasksNewRoute };
});

const TeamManageRoute = lazy(async () => {
  const module = await import("./routes/team-manage-route");
  return { default: module.TeamManageRoute };
});

const TeamSnapshotDetailRoute = lazy(async () => {
  const module = await import("./routes/team-snapshot-detail-route");
  return { default: module.TeamSnapshotDetailRoute };
});

const TeamSnapshotRoute = lazy(async () => {
  const module = await import("./routes/team-snapshot-route");
  return { default: module.TeamSnapshotRoute };
});

function App() {
  const {
    activeTeam,
    activeView,
    createMemberMutation,
    createTaskMutation,
    createTeamMutation,
    deleteMemberMutation,
    deleteTaskMutation,
    deleteTeamMutation,
    errorMessage,
    filteredTasks,
    filters,
    handleCreateMember,
    handleCreateTask,
    handleCreateTeam,
    handleDeleteMember,
    handleDeleteTask,
    handleDeleteTeam,
    handleOpenTask,
    handleSelectMetric,
    handleSelectTeam,
    handleToggleTheme,
    handleUpdateMember,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleUpdateTeam,
    isLoadingInitialData,
    isRefreshingVisibleTasks,
    isRefreshingWorkspaceData,
    location,
    members,
    membersQuery,
    selectedTeamId,
    setFilters,
    summaryQuery,
    tasks,
    teams,
    theme,
    updateMemberMutation,
    updateTaskMutation,
    updateTeamMutation
  } = useWorkspaceController();

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

          {errorMessage ? (
            <Card className="detail-card">
              <p className="text-sm font-semibold text-[var(--danger)]">{errorMessage}</p>
            </Card>
          ) : null}

          <Suspense fallback={<RouteLoadingState />}>
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
                      isLoadingTasks={isRefreshingVisibleTasks}
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
                      isLoadingTasks={isRefreshingVisibleTasks}
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
                      isLoadingTasks={isRefreshingVisibleTasks}
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
          </Suspense>
        </section>
      </div>
    </main>
  );
}

export default App;
