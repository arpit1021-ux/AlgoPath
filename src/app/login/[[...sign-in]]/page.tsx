import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your AlgoPath roadmap.",
};

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Pick up your roadmap where you left off.">
      <SignIn
        appearance={clerkAppearance}
        forceRedirectUrl="/dashboard"
        signUpUrl="/register"
      />
    </AuthShell>
  );
}
