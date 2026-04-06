import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { PlusCircle, Save, Trash2 } from "lucide-react";

import type { TeamListItem } from "../../../shared/types/api";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { useConfirmationDialog } from "../../../shared/ui/use-confirmation-dialog";

type TeamSwitcherProps = {
  activeTeam: TeamListItem | null;
  onCreateTeam: (input: { name: string; description?: string }) => Promise<void>;
  onUpdateTeam: (
    teamId: number,
    input: { name?: string; description?: string | null }
  ) => Promise<void>;
  onDeleteTeam: (teamId: number) => Promise<void>;
  isCreatingTeam: boolean;
  isUpdatingTeam: boolean;
  isDeletingTeam: boolean;
};

export function TeamSwitcher({
  activeTeam,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  isCreatingTeam,
  isUpdatingTeam,
  isDeletingTeam
}: TeamSwitcherProps) {
  const confirm = useConfirmationDialog();
  const [mode, setMode] = useState<"create" | "edit">(activeTeam ? "edit" : "create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editName, setEditName] = useState(activeTeam?.name ?? "");
  const [editDescription, setEditDescription] = useState(activeTeam?.description ?? "");

  useEffect(() => {
    if (!activeTeam) {
      setMode("create");
      setEditName("");
      setEditDescription("");
      return;
    }

    if (!name.trim() && !description.trim()) {
      setMode("edit");
    }

    setEditName(activeTeam.name);
    setEditDescription(activeTeam.description ?? "");
  }, [activeTeam, description, name]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
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
    setMode("edit");
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeTeam) {
      return;
    }

    const cleanName = editName.trim();

    if (!cleanName) {
      return;
    }

    await onUpdateTeam(activeTeam.id, {
      name: cleanName,
      description: editDescription.trim() || null
    });
  }

  async function handleDelete() {
    if (!activeTeam) {
      return;
    }

    const confirmed = await confirm({
      title: "Delete workspace?",
      description: `This will permanently delete "${activeTeam.name}" and remove all of its members and tasks.`,
      confirmLabel: "Delete Workspace",
      tone: "danger"
    });

    if (!confirmed) {
      return;
    }

    await onDeleteTeam(activeTeam.id);
    setMode("create");
  }

  return (
    <Card className="stack-panel space-y-5">
      <div className="space-y-3">
        <div>
          <h2 className="section-title">Workspace Actions</h2>
          <p className="section-subtitle">
            Create a new workspace or update the currently selected one.
          </p>
        </div>

        <div className="panel-tab-strip">
          <Button
            type="button"
            variant={mode === "create" ? "tab" : "ghost"}
            size="sm"
            onClick={() => setMode("create")}
          >
            Create
          </Button>
          {activeTeam ? (
            <Button
              type="button"
              variant={mode === "edit" ? "tab" : "ghost"}
              size="sm"
              onClick={() => setMode("edit")}
            >
              Edit Selected
            </Button>
          ) : null}
        </div>
      </div>

      {mode === "create" ? (
        <form
          className="field-grid"
          onSubmit={(event) => {
            void handleCreate(event);
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
              placeholder="Optional purpose for this workspace"
              maxLength={240}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={isCreatingTeam}>
            <PlusCircle size={16} />
            {isCreatingTeam ? "Creating..." : "Create Workspace"}
          </Button>
        </form>
      ) : activeTeam ? (
        <form
          className="field-grid"
          onSubmit={(event) => {
            void handleUpdate(event);
          }}
        >
          <div>
            <Label>Workspace Name</Label>
            <Input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="Platform Guild"
              maxLength={80}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              placeholder="Purpose and scope"
              maxLength={240}
            />
          </div>

          <div className="panel-actions">
            <Button type="submit" variant="primary" size="lg" disabled={isUpdatingTeam}>
              <Save size={16} />
              {isUpdatingTeam ? "Saving..." : "Save Workspace"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isDeletingTeam}
              onClick={() => {
                void handleDelete();
              }}
            >
              <Trash2 size={16} />
              {isDeletingTeam ? "Deleting..." : "Delete Workspace"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="surface empty-state">Select a workspace to edit its details.</div>
      )}
    </Card>
  );
}
