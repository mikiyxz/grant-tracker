import { redirect } from "next/navigation";

// middleware sends logged out users to /login before this runs
export default function Home() {
  redirect("/dashboard");
}
