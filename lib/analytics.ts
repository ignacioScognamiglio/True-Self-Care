import posthog from "posthog-js";

export const analytics = {
  // Onboarding
  onboardingStarted: () => posthog.capture("onboarding_started"),
  onboardingStepCompleted: (step: string) =>
    posthog.capture("onboarding_step_completed", { step }),
  onboardingCompleted: (modules: string[]) =>
    posthog.capture("onboarding_completed", {
      modules,
      module_count: modules.length,
    }),

  // Modules
  moduleUsed: (module: string) => posthog.capture("module_used", { module }),

  // AI Chat
  chatMessageSent: () => posthog.capture("chat_message_sent"),

  // Wellness actions
  wellnessLogged: (type: string) =>
    posthog.capture("wellness_logged", { type }),

  // Gamification
  achievementEarned: (code: string) =>
    posthog.capture("achievement_earned", { code }),
  levelUp: (level: number) => posthog.capture("level_up", { level }),
};
