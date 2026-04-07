import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import type { WorkspaceController } from "../hooks/use-workspace-controller";
import { RouteLoadingState } from "../components/route-loading-state";
import {
  OverviewPerformanceRoute,
  OverviewRoute,
  TaskDetailRoute,
  TasksBacklogRoute,
  TasksNewRoute,
  TeamManageRoute,
  TeamSnapshotDetailRoute,
  TeamSnapshotRoute
} from "./lazy-routes";

type AppRoutesProps = {
  workspace: WorkspaceController;
};

export function AppRoutes({ workspace }: AppRoutesProps) {
  const activeTeamName = workspace.data.activeTeam?.name ?? null;

  return (
    <Suspense fallback={<RouteLoadingState />}>
      <AnimatePresence mode="wait">
        <Routes location={workspace.data.location} key={workspace.data.location.pathname}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/team/manage" element={<Navigate to="/teams" replace />} />
          <Route
            path="/overview"
            element={
              <OverviewRoute
                summary={workspace.data.summary}
                activeTeamName={activeTeamName}
                tasks={workspace.data.tasks}
                totalTaskCount={workspace.data.tasks.length}
                onSelectMetric={workspace.actions.selectMetric}
              />
            }
          />
          <Route
            path="/overview/performance"
            element={
              <OverviewPerformanceRoute
                activeTeamName={activeTeamName}
                members={workspace.data.members}
                tasks={workspace.data.tasks}
                isLoadingInitialData={workspace.status.isLoadingInitialData}
                isRefreshingTasks={workspace.status.isRefreshingVisibleTasks}
                onOpenTask={workspace.actions.openTask}
              />
            }
          />

          <Route path="/tasks" element={<Navigate to="/tasks/backlog" replace />} />
          <Route
            path="/tasks/backlog"
            element={
              <TasksBacklogRoute
                members={workspace.data.members}
                filters={workspace.data.filters}
                tasks={workspace.data.filteredTasks}
                isLoadingTasks={workspace.status.isRefreshingVisibleTasks}
                isUpdatingTask={workspace.mutations.updateTask.isPending}
                isDeletingTask={workspace.mutations.deleteTask.isPending}
                onChangeFilters={workspace.actions.setFilters}
                onUpdateTaskStatus={workspace.actions.updateTaskStatus}
                onDeleteTask={workspace.actions.deleteTask}
                onOpenTask={workspace.actions.openTask}
              />
            }
          />
          <Route
            path="/tasks/new"
            element={
              <TasksNewRoute
                members={workspace.data.members}
                onCreateTask={workspace.actions.createTask}
                isCreatingTask={workspace.mutations.createTask.isPending}
              />
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <TaskDetailRoute
                tasks={workspace.data.tasks}
                members={workspace.data.members}
                isLoadingTasks={workspace.status.isRefreshingVisibleTasks}
                onUpdateTask={workspace.actions.updateTask}
                onDeleteTask={workspace.actions.deleteTask}
                isUpdatingTask={workspace.mutations.updateTask.isPending}
                isDeletingTask={workspace.mutations.deleteTask.isPending}
              />
            }
          />

          <Route path="/team" element={<Navigate to="/teams" replace />} />
          <Route
            path="/teams"
            element={
              <TeamManageRoute
                teams={workspace.data.teams}
                selectedTeamId={workspace.data.selectedTeamId}
                activeTeamName={activeTeamName}
                members={workspace.data.members}
                isLoadingMembers={workspace.status.isLoadingMembers}
                isCreatingTeam={workspace.mutations.createTeam.isPending}
                isUpdatingTeam={workspace.mutations.updateTeam.isPending}
                isDeletingTeam={workspace.mutations.deleteTeam.isPending}
                isCreatingMember={workspace.mutations.createMember.isPending}
                isUpdatingMember={workspace.mutations.updateMember.isPending}
                isDeletingMember={workspace.mutations.deleteMember.isPending}
                onCreateTeam={workspace.actions.createTeam}
                onUpdateTeam={workspace.actions.updateTeam}
                onDeleteTeam={workspace.actions.deleteTeam}
                onCreateMember={workspace.actions.createMember}
                onUpdateMember={workspace.actions.updateMember}
                onDeleteMember={workspace.actions.deleteMember}
              />
            }
          />
          <Route
            path="/team/snapshot"
            element={
              <TeamSnapshotRoute
                summary={workspace.data.summary}
                activeTeamName={activeTeamName}
                onSelectMetric={workspace.actions.selectMetric}
              />
            }
          />
          <Route
            path="/team/snapshot/:metric"
            element={
              <TeamSnapshotDetailRoute
                activeTeamName={activeTeamName}
                members={workspace.data.members}
                tasks={workspace.data.tasks}
                isLoadingTasks={workspace.status.isRefreshingVisibleTasks}
                onUpdateTaskStatus={workspace.actions.updateTaskStatus}
                isUpdatingTask={workspace.mutations.updateTask.isPending}
                onDeleteTask={workspace.actions.deleteTask}
                isDeletingTask={workspace.mutations.deleteTask.isPending}
                onOpenTask={workspace.actions.openTask}
              />
            }
          />

          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
