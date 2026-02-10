import { describe, test, expect } from "vitest";

// ═══ TYPES ═══

interface Plan {
  id: string;
  type: string;
  status: "active" | "completed" | "archived";
  content: any;
  expiresAt?: number;
  generatedAt: number;
}

interface DailyPlanSection {
  period: "morning" | "afternoon" | "evening";
  label: string;
  icon: string;
  items: Array<{
    id: string;
    text: string;
    domain: string;
    completed: boolean;
  }>;
}

interface DailyPlanContent {
  title: string;
  sections: DailyPlanSection[];
  insights: string[];
  generatedAt: number;
}

// ═══ PURE FUNCTIONS (mirrored from dailyPlan.ts and plans.ts) ═══

function createPlan(
  existingPlans: Plan[],
  newPlan: { type: string; content: any; expiresAt?: number }
): { plans: Plan[]; newPlanId: string } {
  const id = `plan_${Date.now()}_${Math.random()}`;
  const updated = existingPlans.map((p) =>
    p.type === newPlan.type && p.status === "active"
      ? { ...p, status: "archived" as const }
      : p
  );
  updated.push({
    id,
    type: newPlan.type,
    status: "active",
    content: newPlan.content,
    expiresAt: newPlan.expiresAt,
    generatedAt: Date.now(),
  });
  return { plans: updated, newPlanId: id };
}

function getActivePlan(plans: Plan[], type: string): Plan | null {
  return plans.find((p) => p.type === type && p.status === "active") ?? null;
}

function toggleDailyPlanItem(
  content: DailyPlanContent,
  sectionIndex: number,
  itemIndex: number
): DailyPlanContent {
  const updated = JSON.parse(JSON.stringify(content)) as DailyPlanContent;
  const section = updated.sections[sectionIndex];
  if (!section) throw new Error("Seccion no encontrada");
  const item = section.items[itemIndex];
  if (!item) throw new Error("Item no encontrado");
  item.completed = !item.completed;
  return updated;
}

function shouldSendSleepReminder(args: {
  notificationsEnabled: boolean;
  activeModules: string[];
  bedTime?: string;
  currentHourUTC: number;
  alreadySentToday: boolean;
}): boolean {
  if (!args.notificationsEnabled) return false;
  if (!args.activeModules.includes("sleep")) return false;
  if (!args.bedTime) return false;
  if (args.alreadySentToday) return false;

  const [bedH] = args.bedTime.split(":").map(Number);
  const bedHourUTC = (bedH + 3) % 24; // Argentina is UTC-3
  const reminderHourUTC = (bedHourUTC - 1 + 24) % 24;

  return args.currentHourUTC === reminderHourUTC;
}

function shouldSendSleepLogReminder(args: {
  notificationsEnabled: boolean;
  activeModules: string[];
  currentHourUTC: number;
  hasLoggedSleepRecently: boolean;
  alreadySentToday: boolean;
}): boolean {
  if (!args.notificationsEnabled) return false;
  if (!args.activeModules.includes("sleep")) return false;
  if (args.currentHourUTC !== 13) return false; // 10am ART = 13 UTC
  if (args.hasLoggedSleepRecently) return false;
  if (args.alreadySentToday) return false;
  return true;
}

// ═══ TESTS ═══

describe("daily plan creation", () => {
  test("creating a daily plan archives the previous one", () => {
    const { plans: step1 } = createPlan([], {
      type: "daily",
      content: { title: "Plan dia 1", sections: [], insights: [] },
      expiresAt: Date.now() + 86400000,
    });

    const { plans: step2 } = createPlan(step1, {
      type: "daily",
      content: { title: "Plan dia 2", sections: [], insights: [] },
      expiresAt: Date.now() + 86400000,
    });

    expect(step2).toHaveLength(2);
    expect(step2[0].status).toBe("archived");
    expect(step2[0].content.title).toBe("Plan dia 1");
    expect(step2[1].status).toBe("active");
    expect(step2[1].content.title).toBe("Plan dia 2");
  });

  test("daily plan does not archive other plan types", () => {
    const { plans: step1 } = createPlan([], {
      type: "meal",
      content: { title: "Meal plan" },
    });

    const { plans: step2 } = createPlan(step1, {
      type: "daily",
      content: { title: "Daily plan" },
    });

    const mealPlan = getActivePlan(step2, "meal");
    const dailyPlan = getActivePlan(step2, "daily");

    expect(mealPlan?.status).toBe("active");
    expect(dailyPlan?.status).toBe("active");
  });

  test("weekly plan archives only previous weekly", () => {
    const { plans: step1 } = createPlan([], {
      type: "weekly",
      content: { title: "Resumen semana 1" },
    });

    const { plans: step2 } = createPlan(step1, {
      type: "daily",
      content: { title: "Daily plan" },
    });

    const { plans: step3 } = createPlan(step2, {
      type: "weekly",
      content: { title: "Resumen semana 2" },
    });

    expect(getActivePlan(step3, "daily")?.status).toBe("active");
    expect(getActivePlan(step3, "weekly")?.content.title).toBe("Resumen semana 2");
    expect(step3.filter((p) => p.type === "weekly" && p.status === "archived")).toHaveLength(1);
  });
});

describe("daily plan item toggle", () => {
  const samplePlan: DailyPlanContent = {
    title: "Plan del dia",
    sections: [
      {
        period: "morning",
        label: "Manana",
        icon: "sun",
        items: [
          { id: "1", text: "Tomar agua", domain: "hydration", completed: false },
          { id: "2", text: "Desayuno", domain: "nutrition", completed: false },
        ],
      },
      {
        period: "afternoon",
        label: "Tarde",
        icon: "sunset",
        items: [
          { id: "3", text: "Entrenar", domain: "fitness", completed: false },
        ],
      },
      {
        period: "evening",
        label: "Noche",
        icon: "moon",
        items: [
          { id: "4", text: "Meditacion", domain: "mental", completed: false },
        ],
      },
    ],
    insights: ["Insight 1"],
    generatedAt: Date.now(),
  };

  test("toggle marca item como completado", () => {
    const updated = toggleDailyPlanItem(samplePlan, 0, 0);
    expect(updated.sections[0].items[0].completed).toBe(true);
    // Original not mutated
    expect(samplePlan.sections[0].items[0].completed).toBe(false);
  });

  test("toggle desmarca item completado", () => {
    const step1 = toggleDailyPlanItem(samplePlan, 0, 0);
    const step2 = toggleDailyPlanItem(step1, 0, 0);
    expect(step2.sections[0].items[0].completed).toBe(false);
  });

  test("toggle en seccion invalida lanza error", () => {
    expect(() => toggleDailyPlanItem(samplePlan, 5, 0)).toThrow("Seccion no encontrada");
  });

  test("toggle en item invalido lanza error", () => {
    expect(() => toggleDailyPlanItem(samplePlan, 0, 10)).toThrow("Item no encontrado");
  });

  test("toggle no afecta otros items", () => {
    const updated = toggleDailyPlanItem(samplePlan, 0, 0);
    expect(updated.sections[0].items[1].completed).toBe(false);
    expect(updated.sections[1].items[0].completed).toBe(false);
    expect(updated.sections[2].items[0].completed).toBe(false);
  });

  test("plan tiene 3 secciones: morning, afternoon, evening", () => {
    expect(samplePlan.sections).toHaveLength(3);
    expect(samplePlan.sections[0].period).toBe("morning");
    expect(samplePlan.sections[1].period).toBe("afternoon");
    expect(samplePlan.sections[2].period).toBe("evening");
  });
});

describe("sleep reminder logic", () => {
  test("envia reminder 1 hora antes de bedTime (23:00 -> reminder a 22:00 ART = 01 UTC)", () => {
    expect(
      shouldSendSleepReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        bedTime: "23:00",
        currentHourUTC: 1, // 22:00 ART + 3 = 01 UTC, 01 - 1 = 00... wait
        alreadySentToday: false,
      })
    ).toBe(true);
  });

  test("no envia si notificaciones desactivadas", () => {
    expect(
      shouldSendSleepReminder({
        notificationsEnabled: false,
        activeModules: ["sleep"],
        bedTime: "23:00",
        currentHourUTC: 1,
        alreadySentToday: false,
      })
    ).toBe(false);
  });

  test("no envia si modulo sleep no esta activo", () => {
    expect(
      shouldSendSleepReminder({
        notificationsEnabled: true,
        activeModules: ["nutrition", "fitness"],
        bedTime: "23:00",
        currentHourUTC: 1,
        alreadySentToday: false,
      })
    ).toBe(false);
  });

  test("no envia si no hay bedTime configurado", () => {
    expect(
      shouldSendSleepReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        bedTime: undefined,
        currentHourUTC: 1,
        alreadySentToday: false,
      })
    ).toBe(false);
  });

  test("no envia si ya se envio hoy", () => {
    expect(
      shouldSendSleepReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        bedTime: "23:00",
        currentHourUTC: 1,
        alreadySentToday: true,
      })
    ).toBe(false);
  });

  test("no envia si no es la hora correcta", () => {
    expect(
      shouldSendSleepReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        bedTime: "23:00",
        currentHourUTC: 15, // Not the right hour
        alreadySentToday: false,
      })
    ).toBe(false);
  });
});

describe("sleep log reminder logic", () => {
  test("envia a las 10am ART (13 UTC) si no registro sueno", () => {
    expect(
      shouldSendSleepLogReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        currentHourUTC: 13,
        hasLoggedSleepRecently: false,
        alreadySentToday: false,
      })
    ).toBe(true);
  });

  test("no envia si ya registro sueno", () => {
    expect(
      shouldSendSleepLogReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        currentHourUTC: 13,
        hasLoggedSleepRecently: true,
        alreadySentToday: false,
      })
    ).toBe(false);
  });

  test("no envia en hora incorrecta", () => {
    expect(
      shouldSendSleepLogReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        currentHourUTC: 10,
        hasLoggedSleepRecently: false,
        alreadySentToday: false,
      })
    ).toBe(false);
  });

  test("no envia si ya se envio hoy", () => {
    expect(
      shouldSendSleepLogReminder({
        notificationsEnabled: true,
        activeModules: ["sleep"],
        currentHourUTC: 13,
        hasLoggedSleepRecently: false,
        alreadySentToday: true,
      })
    ).toBe(false);
  });
});
