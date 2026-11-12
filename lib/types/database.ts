export type GrantStatus = "applying" | "awarded" | "active" | "completed";

export type ReminderType = "30d" | "14d" | "7d";

export type Profile = {
  id: string;
  full_name: string;
  email_reminders_enabled: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Grant = {
  id: string;
  user_id: string;
  name: string;
  funder: string;
  amount: number | null;
  status: GrantStatus;
  // date columns come back as "YYYY-MM-DD" strings
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  archived: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Deadline = {
  id: string;
  grant_id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ChecklistItem = {
  id: string;
  grant_id: string;
  deadline_id: string | null;
  label: string;
  is_checked: boolean;
  sort_order: number;
  created_at: Date;
};

export type ReminderLog = {
  id: string;
  deadline_id: string;
  reminder_type: ReminderType;
  sent_at: Date;
};

// a grant with its children, used on the grant detail page
export type GrantWithDetails = Grant & {
  deadlines: Deadline[];
  checklist_items: ChecklistItem[];
};

// a deadline plus the name of the grant it belongs to
export type UpcomingDeadline = Deadline & {
  grants: { name: string };
};
