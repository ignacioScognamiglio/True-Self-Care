import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Leaf className="size-6" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">True Self-Care</h1>
      </div>
      <p className="max-w-md text-center text-lg text-muted-foreground">
        Your AI-powered personal wellness companion. Skincare, nutrition,
        fitness, mental health, sleep &amp; habits — all connected.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/sign-up">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
