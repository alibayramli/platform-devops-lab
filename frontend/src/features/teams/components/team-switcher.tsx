import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { PlusCircle, Save, Trash2 } from "lucide-react";

import type { TeamListItem } from "../../../shared/types/api";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { useConfirmationDialog } from "../../../shared/ui/use-confirmation-dialog";
import { TeamFormFields } from "./team-form-fields";

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

function normalizeWorkspaceInput(input: { name: string; description: string }) {
  return {
    description: input.description.trim(),
    name: input.name.trim()
  };
}

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
    const normalized = normalizeWorkspaceInput({ name, description });

    if (!normalized.name) {
      return;
    }

    await onCreateTeam({
      name: normalized.name,
      description: normalized.description || undefined
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

    const normalized = normalizeWorkspaceInput({
      name: editName,
      description: editDescription
    });

    if (!normalized.name) {
      return;
    }

    await onUpdateTeam(activeTeam.id, {
      name: normalized.name,
      description: normalized.description || null
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
          <TeamFormFields
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            nameLabel="New Workspace Name"
            namePlaceholder="Frontend Guild"
            descriptionPlaceholder="Optional purpose for this workspace"
          />

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
          <TeamFormFields
            name={editName}
            description={editDescription}
            onNameChange={setEditName}
            onDescriptionChange={setEditDescription}
            nameLabel="Workspace Name"
            namePlaceholder="Platform Guild"
            descriptionPlaceholder="Purpose and scope"
          />

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
