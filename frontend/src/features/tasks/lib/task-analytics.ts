import type { Task, TaskPriority } from "../../../shared/types/api";

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function isTaskOverdue(task: Task, referenceTime = Date.now()): boolean {
  if (!task.dueDate || task.status === "done") {
    return false;
  }

  const startOfDay = new Date(referenceTime).setHours(0, 0, 0, 0);
  return new Date(task.dueDate).getTime() < startOfDay;
}

export function countOverdueTasks(tasks: Task[], referenceTime = Date.now()): number {
  return tasks.filter((task) => isTaskOverdue(task, referenceTime)).length;
}

export function countCompletedTasks(tasks: Task[]): number {
  return tasks.filter((task) => task.status === "done").length;
}

export function countAssignedTasks(tasks: Task[]): number {
  return tasks.filter((task) => task.assigneeId != null).length;
}

export function countTasksByPriority(tasks: Task[], priority: TaskPriority): number {
  return tasks.filter((task) => task.priority === priority).length;
}

export function countTasksWithDescriptions(tasks: Task[]): number {
  return tasks.filter((task) => Boolean(task.description)).length;
}

export function countTasksDueWithinDays(
  tasks: Task[],
  days: number,
  referenceTime = Date.now()
): number {
  const maxDistance = 1000 * 60 * 60 * 24 * days;

  return tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") {
      return false;
    }

    const distance = new Date(task.dueDate).getTime() - referenceTime;
    return distance >= 0 && distance <= maxDistance;
  }).length;
}

export function groupTasksByAssignee(tasks: Task[]): Map<number, Task[]> {
  const tasksByAssignee = new Map<number, Task[]>();

  for (const task of tasks) {
    if (typeof task.assigneeId !== "number") {
      continue;
    }

    const bucket = tasksByAssignee.get(task.assigneeId);

    if (bucket) {
      bucket.push(task);
      continue;
    }

    tasksByAssignee.set(task.assigneeId, [task]);
  }

  return tasksByAssignee;
}
