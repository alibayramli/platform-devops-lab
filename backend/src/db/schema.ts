import { sql } from "drizzle-orm";
import { date, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow()
});

export const members = pgTable(
  "members",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    role: text("role").$type<"lead" | "member" | "observer">().notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
  },
  (table) => [uniqueIndex("members_team_id_email_key").on(table.teamId, table.email)]
);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status")
    .$type<"todo" | "in_progress" | "blocked" | "done">()
    .notNull()
    .default("todo"),
  priority: text("priority").$type<"low" | "medium" | "high">().notNull().default("medium"),
  dueDate: date("due_date", { mode: "string" }),
  assigneeId: integer("assignee_id").references(() => members.id, { onDelete: "set null" }),
  createdByMemberId: integer("created_by_member_id").references(() => members.id, {
    onDelete: "set null"
  }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .default(sql`NOW()`)
});
