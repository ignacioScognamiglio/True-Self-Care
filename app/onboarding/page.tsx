import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-6" />
          </div>
          <CardTitle className="text-2xl">
            Welcome to {APP_NAME}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            Let&apos;s set up your personalized wellness profile. This will only
            take a few minutes.
          </p>
          <p className="mt-4 text-sm">Onboarding flow — Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
