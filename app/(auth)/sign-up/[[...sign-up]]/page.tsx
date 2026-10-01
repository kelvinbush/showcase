import { redirect } from "next/navigation";

// Accounts are created as the last step of the access request, not on their own.
export default function SignUpPage() {
  redirect("/request-access");
}
