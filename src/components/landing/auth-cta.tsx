"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function AuthCTA({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();

  return (
    <Link href={isSignedIn ? "/dashboard" : "/register"} className={className}>
      <Button
        size="lg"
        className="text-base px-8 py-6 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/25 animate-pulse-glow"
      >
        Start Preparing
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </Link>
  );
}

export function AuthCTASecondary({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();

  return (
    <Link href={isSignedIn ? "/dashboard" : "/login"} className={className}>
      <Button
        size="lg"
        variant="outline"
        className="text-base px-8 py-6 rounded-xl font-semibold cursor-pointer border-2"
      >
        Sign In
      </Button>
    </Link>
  );
}

export function AuthCTAFooter({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();

  return (
    <Link href={isSignedIn ? "/dashboard" : "/register"} className={className}>
      <Button
        size="lg"
        className="text-base px-10 py-6 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/25"
      >
        Get Started for Free
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </Link>
  );
}
