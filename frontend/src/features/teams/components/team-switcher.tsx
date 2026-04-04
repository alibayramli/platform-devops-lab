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
    <Card className="stack-panel space-y-5">
      <div>
        <h2 className="section-title">Workspace Directory</h2>
        <p className="section-subtitle">Switch workspaces or create a new one for the dashboard.</p>
      </div>

      {isLoadingTeams && teams.length === 0 ? (
        <div className="surface empty-state">Loading workspaces...</div>
      ) : teams.length === 0 ? (
        <div className="surface empty-state">
          No workspaces yet. Create the first workspace below.
        </div>
      ) : (
        <div className="space-y-3">
          {isLoadingTeams ? <p className="section-subtitle">Refreshing workspace list...</p> : null}
          <ul className="workspace-list">
            {teams.map((team) => {
              const isActive = team.id === selectedTeamId;

              return (
                <li
                  key={team.id}
                  className={cn(
                    "workspace-item surface",
                    isActive && "border-[color:var(--accent)]"
                  )}
                >
                  <div className="min-w-0">
                    <p className="row-title">{team.name}</p>
                    <p className="row-subtitle">
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

        <Button type="submit" variant="primary" size="lg" disabled={isCreatingTeam}>
          <PlusCircle size={16} />
          {isCreatingTeam ? "Creating..." : "Create Workspace"}
        </Button>
      </form>
    </Card>
  );
}
