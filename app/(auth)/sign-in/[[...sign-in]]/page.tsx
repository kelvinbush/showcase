import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { DEMO_MODE } from "@/lib/config";
import { DemoNotice } from "../../demo-notice";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  if (DEMO_MODE) return <DemoNotice />;
  return <SignIn signUpUrl="/request-access" fallbackRedirectUrl="/" />;
}
