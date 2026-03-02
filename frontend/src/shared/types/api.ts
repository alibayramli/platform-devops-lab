export const taskStatuses = ["todo", "in_progress", "blocked", "done"] as const;
export const taskPriorities = ["low", "medium", "high"] as const;
export const memberRoles = ["lead", "member", "observer"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type MemberRole = (typeof memberRoles)[number];

export type TeamListItem = {
  id: number;
  name: string;
  description: string | null;
  memberCount: number;
  taskCount: number;
  createdAt: string;
};

export type TeamSummary = {
  totalTasks: number;
  todo: number;
  inProgress: number;
  blocked: number;
  done: number;
  memberCount: number;
};

export type Member = {
  id: number;
  teamId: number;
  fullName: string;
  email: string;
  role: MemberRole;
  createdAt: string;
};

export type Task = {
  id: number;
  teamId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: number | null;
  assigneeName: string | null;
  createdByMemberId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  search?: string;
};
