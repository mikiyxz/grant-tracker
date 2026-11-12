import ReminderToggle from "@/components/ReminderToggle";
import { getProfile } from "@/lib/actions/profile";

export default async function SettingsPage() {
  const result = await getProfile();

  if (!result.data) {
    return <p className="text-base text-red-700">{result.error}</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <p className="text-base text-gray-600 mb-6">Signed in as {result.data.full_name}.</p>
      <ReminderToggle initial={result.data.email_reminders_enabled} />
    </div>
  );
}
