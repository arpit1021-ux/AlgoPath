import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata = {
  title: "Create your account",
  description: "Build a personalized LeetCode roadmap weighted by your target companies.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Start your roadmap"
      subtitle="A week-by-week plan built around your companies and your time."
    >
      <SignUp
        appearance={clerkAppearance}
        forceRedirectUrl="/dashboard"
        signInUrl="/login"
      />
    </AuthShell>
  );
}
