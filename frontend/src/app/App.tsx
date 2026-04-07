import { Card } from "../shared/ui/card";
import { AppSidebar } from "./components/app-sidebar";
import { AppRoutes } from "./routes/app-routes";
import { DataSyncIndicator } from "./components/data-sync-indicator";
import { WorkspaceHeader } from "./components/workspace-header";
import { useWorkspaceController } from "./hooks/use-workspace-controller";

function App() {
  const workspace = useWorkspaceController();

  return (
    <main className="dashboard-shell">
      <div className="dashboard-frame">
        <AppSidebar
          pathname={workspace.data.location.pathname}
          teams={workspace.data.teams}
          selectedTeamId={workspace.data.selectedTeamId}
          members={workspace.data.members}
          onSelectTeam={workspace.actions.selectTeam}
        />

        <section className="dashboard-main">
          <WorkspaceHeader
            pathname={workspace.data.location.pathname}
            activeView={workspace.data.activeView}
            members={workspace.data.members}
            summary={workspace.data.summary}
            activeTeamName={workspace.data.activeTeam?.name ?? null}
            theme={workspace.data.theme}
            isLoadingInitialData={workspace.status.isLoadingInitialData}
            isRefreshingWorkspaceData={workspace.status.isRefreshingWorkspaceData}
            isRefreshingTasksData={workspace.status.isRefreshingVisibleTasks}
            onToggleTheme={workspace.actions.toggleTheme}
          />

          {workspace.status.isRefreshingVisibleTasks ||
          workspace.status.isRefreshingWorkspaceData ? (
            <DataSyncIndicator
              label={
                workspace.status.isRefreshingVisibleTasks
                  ? "Refreshing tasks..."
                  : "Refreshing workspace data..."
              }
            />
          ) : null}

          {workspace.status.errorMessage ? (
            <Card className="detail-card">
              <p className="text-sm font-semibold text-[var(--danger)]">
                {workspace.status.errorMessage}
              </p>
            </Card>
          ) : null}

          <AppRoutes workspace={workspace} />
        </section>
      </div>
    </main>
  );
}

export default App;
