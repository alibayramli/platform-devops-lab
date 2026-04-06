import { useState } from "react";
import type { FormEvent } from "react";

import type { Member } from "../../../shared/types/api";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { TaskFormFields } from "./task-form-fields";
import { createTaskFormValues, type CreateTaskInput, type TaskFormValues } from "../types";
import { buildCreateTaskInput } from "../utils";

type TaskCreatorProps = {
  members: Member[];
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
  isCreatingTask: boolean;
};

export function TaskCreator({ members, onCreateTask, isCreatingTask }: TaskCreatorProps) {
  const [values, setValues] = useState<TaskFormValues>(() => createTaskFormValues());
  const createdByMemberId = members[0]?.id ?? null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = buildCreateTaskInput(values, createdByMemberId);

    if (!input) {
      return;
    }

    await onCreateTask(input);
    setValues(createTaskFormValues());
  }

  return (
    <Card className="form-card task-creator-card space-y-5">
      <div>
        <h2 className="section-title">Task Details</h2>
        <p className="section-subtitle">
          Add the essentials first, then fine tune status and ownership from the backlog.
        </p>
      </div>

      <form
        className="task-creator-form"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <TaskFormFields
          members={members}
          values={values}
          descriptionClassName="task-creator-description"
          onChange={(field, value) =>
            setValues((currentValues) => ({
              ...currentValues,
              [field]: value
            }))
          }
          sideFooter={
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isCreatingTask}
              className="task-creator-submit"
            >
              {isCreatingTask ? "Saving..." : "Create Task"}
            </Button>
          }
        />
      </form>
    </Card>
  );
}
