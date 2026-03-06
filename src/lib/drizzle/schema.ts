import { sql } from "drizzle-orm";
import { bigint, check, index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const academies = pgTable("academies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const academyMembers = pgTable(
  "academy_members",
  {
    academyId: uuid("academy_id")
      .notNull()
      .references(() => academies.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    role: text("role").notNull().default("staff"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.academyId, table.userId] }),
    index("academy_members_user_id_idx").on(table.userId),
    check("academy_members_role_check", sql`${table.role} in ('owner', 'manager', 'staff')`),
  ],
);

export const academyEnrollments = pgTable(
  "academy_enrollments",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    academyId: uuid("academy_id")
      .notNull()
      .references(() => academies.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    studentPhone: text("student_phone"),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("academy_enrollments_academy_id_id_idx").on(table.academyId, table.id),
    index("academy_enrollments_created_by_idx").on(table.createdBy),
    check("academy_enrollments_student_name_check", sql`length(trim(${table.studentName})) > 0`),
  ],
);
