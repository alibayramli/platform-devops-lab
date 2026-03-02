import { useState } from "react";
import type { FormEvent } from "react";
import { PlusCircle } from "lucide-react";

import type { TeamListItem } from "../../../shared/types/api";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { cn } from "../../../shared/ui/cn";

type TeamSwitcherProps = {
  teams: TeamListItem[];
  isLoadingTeams: boolean;
  selectedTeamId: number | null;
  onSelectTeam: (teamId: number) => void;
  onCreateTeam: (input: { name: string; description?: string }) => Promise<void>;
  isCreatingTeam: boolean;
};

export function TeamSwitcher({
  teams,
  isLoadingTeams,
  selectedTeamId,
  onSelectTeam,
  onCreateTeam,
  isCreatingTeam
}: TeamSwitcherProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    await onCreateTeam({
      name: cleanName,
      description: description.trim() || undefined
    });

    setName("");
    setDescription("");
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="section-title">Workspace Directory</h2>
        <p className="section-subtitle">Switch workspaces or create a new one.</p>
      </div>

      {isLoadingTeams && teams.length === 0 ? (
        <div className="surface p-4 text-sm text-theme-muted">Loading workspaces...</div>
      ) : teams.length === 0 ? (
        <div className="surface p-4 text-sm text-theme-muted">
          No workspaces yet. Create the first workspace below.
        </div>
      ) : (
        <div className="space-y-2">
          {isLoadingTeams ? (
            <p className="px-1 text-xs font-medium text-theme-muted">
              Refreshing workspace list...
            </p>
          ) : null}
          <ul className="space-y-2.5">
            {teams.map((team) => {
              const isActive = team.id === selectedTeamId;

              return (
                <li
                  key={team.id}
                  className={cn(
                    "surface flex items-center justify-between gap-3 px-3 py-2.5",
                    isActive && "border-[var(--button-primary-bg)]"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-theme-primary">{team.name}</p>
                    <p className="truncate text-xs text-theme-muted">
                      {team.taskCount} tasks | {team.memberCount} members
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? <Badge variant="neutral">active</Badge> : null}
                    <Button
                      type="button"
                      size="sm"
                      variant={isActive ? "outline" : "ghost"}
                      onClick={() => onSelectTeam(team.id)}
                      disabled={isActive}
                    >
                      {isActive ? "Current" : "Switch"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <form
        className="field-grid"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div>
          <Label>New Workspace Name</Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Frontend Guild"
            maxLength={80}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional purpose for this team"
            maxLength={240}
          />
        </div>

        <Button type="submit" variant="primary" disabled={isCreatingTeam}>
          <PlusCircle size={16} />
          {isCreatingTeam ? "Creating..." : "Create Workspace"}
        </Button>
      </form>
    </Card>
  );
}
