import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CalendarClock } from "lucide-react";

import {
  taskPriorities,
  taskStatuses,
  type Member,
  type TaskPriority,
  type TaskStatus
} from "../../../shared/types/api";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";
import { Textarea } from "../../../shared/ui/textarea";

type TaskCreatorProps = {
  members: Member[];
  onCreateTask: (input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    assigneeId?: number | null;
    createdByMemberId?: number | null;
  }) => Promise<void>;
  isCreatingTask: boolean;
};

export function TaskCreator({ members, onCreateTask, isCreatingTask }: TaskCreatorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");

  const createdByMemberId = useMemo(() => {
    return members[0]?.id ?? null;
  }, [members]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    await onCreateTask({
      title: cleanTitle,
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      assigneeId: typeof assigneeId === "number" ? assigneeId : null,
      createdByMemberId
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("todo");
    setAssigneeId("");
    setDueDate("");
  }

  return (
    <Card className="form-card space-y-5">
      <div>
        <h2 className="section-title">Task Details</h2>
        <p className="section-subtitle">
          Add the essentials first, then fine tune status and ownership from the backlog.
        </p>
      </div>

      <form
        className="field-grid"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Prepare sprint retrospective agenda"
            maxLength={140}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional context and acceptance criteria"
            maxLength={800}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {taskStatuses.map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
            >
              {taskPriorities.map((priorityValue) => (
                <option key={priorityValue} value={priorityValue}>
                  {priorityValue}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Assignee</Label>
            <Select
              value={assigneeId}
              onChange={(event) =>
                setAssigneeId(event.target.value ? Number(event.target.value) : "")
              }
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </Select>
          </div>

          <div className="relative">
            <Label>Due Date</Label>
            <CalendarClock
              size={16}
              className="pointer-events-none absolute left-4 top-[42px]"
              color="var(--text-soft)"
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="pl-11"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={isCreatingTask}>
          {isCreatingTask ? "Saving..." : "Create Task"}
        </Button>
      </form>
    </Card>
  );
}
