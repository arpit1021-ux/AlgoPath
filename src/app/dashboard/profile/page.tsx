"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Target, Flame, Rocket } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and view achievements.
        </p>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details from Clerk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Avatar"
                className="h-16 w-16 rounded-xl object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold text-lg">
                {user?.fullName || "User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress || "No email"}
              </p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {user?.id?.slice(0, 10)}...
              </Badge>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                defaultValue={user?.fullName || ""}
                className="mt-1"
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                defaultValue={
                  user?.primaryEmailAddress?.emailAddress || ""
                }
                className="mt-1"
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                defaultValue={user?.username || ""}
                className="mt-1"
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Profile information is managed through Clerk. Update via the
              UserButton in the sidebar.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Your earned badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium">No badges earned yet</p>
            <p className="text-sm mt-1">
              Solve problems and complete revisions to earn badges
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold gradient-text">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Problems Solved
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold gradient-text">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Revisions Done
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold gradient-text flex items-center justify-center gap-1">
                0
                <Flame className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
