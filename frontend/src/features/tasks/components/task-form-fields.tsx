import type { ReactNode } from "react";
import type { Member, TaskPriority, TaskStatus } from "../../../shared/types/api";
import { taskPriorities, taskStatuses } from "../../../shared/types/api";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";
import { Textarea } from "../../../shared/ui/textarea";
import type { TaskFormValues } from "../types";
import { formatTaskPriorityLabel, formatTaskStatusLabel } from "../utils";

type TaskFormFieldsProps = {
  members: Member[];
  values: TaskFormValues;
  descriptionClassName?: string;
  sideFooter?: ReactNode;
  onChange: <Field extends keyof TaskFormValues>(
    field: Field,
    value: TaskFormValues[Field]
  ) => void;
};

export function TaskFormFields({
  members,
  values,
  descriptionClassName,
  sideFooter,
  onChange
}: TaskFormFieldsProps) {
  return (
    <>
      <div className="task-creator-main">
        <div>
          <Label>Title</Label>
          <Input
            value={values.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="Prepare sprint retrospective agenda"
            maxLength={140}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="Notes, blockers, and acceptance criteria"
            maxLength={800}
            className={descriptionClassName}
          />
        </div>
      </div>

      <div className="task-creator-side">
        <div className="task-creator-meta-grid">
          <div>
            <Label>Status</Label>
            <Select
              value={values.status}
              onChange={(event) => onChange("status", event.target.value as TaskStatus)}
            >
              {taskStatuses.map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {formatTaskStatusLabel(statusValue)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={values.priority}
              onChange={(event) => onChange("priority", event.target.value as TaskPriority)}
            >
              {taskPriorities.map((priorityValue) => (
                <option key={priorityValue} value={priorityValue}>
                  {formatTaskPriorityLabel(priorityValue)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Assignee</Label>
            <Select
              value={values.assigneeId}
              onChange={(event) =>
                onChange("assigneeId", event.target.value ? Number(event.target.value) : "")
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

          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={values.dueDate}
              onChange={(event) => onChange("dueDate", event.target.value)}
              className="ui-input-date"
            />
          </div>
        </div>

        {sideFooter}
      </div>
    </>
  );
}
