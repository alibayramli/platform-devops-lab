import { Search } from "lucide-react";

import type { Member, TaskFilters, TaskPriority, TaskStatus } from "../../../shared/types/api";
import { taskPriorities, taskStatuses } from "../../../shared/types/api";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";

type TaskFiltersProps = {
  members: Member[];
  filters: TaskFilters;
  onChangeFilters: (nextFilters: TaskFilters) => void;
};

export function TaskFiltersBar({ members, filters, onChangeFilters }: TaskFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.status || filters.priority || filters.assigneeId || filters.search?.trim()
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div>
        <Label>Status</Label>
        <Select
          value={filters.status ?? ""}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              status: (event.target.value || undefined) as TaskStatus | undefined
            })
          }
        >
          <option value="">All</option>
          {taskStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Priority</Label>
        <Select
          value={filters.priority ?? ""}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              priority: (event.target.value || undefined) as TaskPriority | undefined
            })
          }
        >
          <option value="">All</option>
          {taskPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Assignee</Label>
        <Select
          value={filters.assigneeId ?? ""}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              assigneeId: event.target.value ? Number(event.target.value) : undefined
            })
          }
        >
          <option value="">All</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:col-span-2 xl:col-span-1">
        <Label>Search</Label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-3 text-theme-muted"
          />
          <Input
            value={filters.search ?? ""}
            onChange={(event) =>
              onChangeFilters({
                ...filters,
                search: event.target.value || undefined
              })
            }
            placeholder="Search title or description"
            maxLength={120}
            className="pl-9"
          />
        </div>
      </div>

      <div className="sm:col-span-2 xl:col-span-4">
        <div className="flex justify-stretch sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChangeFilters({})}
            disabled={!hasActiveFilters}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
