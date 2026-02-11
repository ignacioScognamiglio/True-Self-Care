"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { WelcomeStep } from "./steps/welcome";
import { ModulesStep } from "./steps/modules";
import { ProfileStep, type ProfileData } from "./steps/profile";
import { HealthStep, type HealthData } from "./steps/health";
import { PlanStep } from "./steps/plan";
import { analytics } from "@/lib/analytics";
import { Loader2 } from "lucide-react";

const ALL_STEPS = ["welcome", "modules", "profile", "health", "plan"] as const;

function needsHealthStep(modules: string[]) {
  return (
    modules.includes("skincare") ||
    modules.includes("nutrition") ||
    modules.includes("fitness") ||
    modules.includes("sleep") ||
    modules.includes("habits")
  );
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const saveHealthProfile = useMutation(
    api.functions.onboarding.saveHealthProfile
  );

  // Track onboarding start
  useEffect(() => {
    analytics.onboardingStarted();
  }, []);

  // Redirect if already completed
  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user?.onboardingCompleted) {
    return null;
  }

  // Filter steps based on selected modules
  const steps = ALL_STEPS.filter(
    (step) => step !== "health" || needsHealthStep(selectedModules)
  );
  const currentStepName = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const next = () => {
    analytics.onboardingStepCompleted(steps[currentStep]);
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleProfileNext = (data: ProfileData) => {
    setProfileData(data);
    next();
  };

  const handleHealthNext = async (data: HealthData) => {
    setSaving(true);
    try {
      await saveHealthProfile({
        age: profileData.age,
        gender: profileData.gender,
        height: profileData.height,
        weight: profileData.weight,
        skinType: data.skinType,
        skinConcerns: data.skinConcerns,
        dietaryRestrictions: data.dietaryRestrictions,
        allergies: data.allergies,
        fitnessLevel: data.fitnessLevel,
        healthGoals: data.healthGoals,
        sleepBedTime: data.sleepBedTime,
        sleepWakeTime: data.sleepWakeTime,
      });
      next();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 py-4">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          Paso {currentStep + 1} de {steps.length}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        {currentStepName === "welcome" && <WelcomeStep onNext={next} />}
        {currentStepName === "modules" && (
          <ModulesStep
            selected={selectedModules}
            onSelect={setSelectedModules}
            onNext={next}
          />
        )}
        {currentStepName === "profile" && (
          <ProfileStep onNext={handleProfileNext} onBack={back} />
        )}
        {currentStepName === "health" && (
          <HealthStep
            modules={selectedModules}
            onNext={handleHealthNext}
            onBack={back}
          />
        )}
        {currentStepName === "plan" && (
          <PlanStep modules={selectedModules} />
        )}
      </div>
    </div>
  );
}
