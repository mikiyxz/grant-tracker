"use client";

import { useState } from "react";
import { setEmailReminders } from "@/lib/actions/profile";

export default function ReminderToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChange() {
    const next = !enabled;
    setSaving(true);
    setError("");
    const result = await setEmailReminders(next);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEnabled(next);
  }

  return (
    <div>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 h-5 w-5 accent-green-600"
        />
        <span>
          <span className="block text-base font-medium text-gray-900">Email reminders</span>
          <span className="block text-base text-gray-600">
            Get an email 30, 14 and 7 days before a deadline.
          </span>
        </span>
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
