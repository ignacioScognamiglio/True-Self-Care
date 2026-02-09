import { describe, test, expect } from "vitest";

// Pure logic tests for plan management (no convex-test)
// Mirrors the logic in convex/functions/plans.ts

interface Plan {
  id: string;
  type: string;
  status: "active" | "completed" | "archived";
  content: any;
}

function createPlan(
  existingPlans: Plan[],
  newPlan: { type: string; content: any }
): { plans: Plan[]; newPlanId: string } {
  const id = `plan_${Date.now()}_${Math.random()}`;

  // Archive existing active plans of the same type
  const updated = existingPlans.map((p) =>
    p.type === newPlan.type && p.status === "active"
      ? { ...p, status: "archived" as const }
      : p
  );

  updated.push({ id, type: newPlan.type, status: "active", content: newPlan.content });
  return { plans: updated, newPlanId: id };
}

function getActivePlan(plans: Plan[], type: string): Plan | null {
  return plans.find((p) => p.type === type && p.status === "active") ?? null;
}

function updatePlanStatus(plans: Plan[], planId: string, status: Plan["status"]): Plan[] {
  return plans.map((p) => (p.id === planId ? { ...p, status } : p));
}

function updatePlanContent(plans: Plan[], planId: string, content: any): Plan[] {
  return plans.map((p) => (p.id === planId ? { ...p, content } : p));
}

describe("plans", () => {
  test("createPlan crea un plan con status active", () => {
    const { plans } = createPlan([], {
      type: "meal",
      content: { title: "Plan semanal" },
    });

    expect(plans).toHaveLength(1);
    expect(plans[0].status).toBe("active");
    expect(plans[0].type).toBe("meal");
    expect(plans[0].content.title).toBe("Plan semanal");
  });

  test("createPlan archiva plan previo del mismo tipo", () => {
    const { plans: step1 } = createPlan([], {
      type: "meal",
      content: { title: "Plan 1" },
    });

    const { plans: step2 } = createPlan(step1, {
      type: "meal",
      content: { title: "Plan 2" },
    });

    expect(step2).toHaveLength(2);
    expect(step2[0].content.title).toBe("Plan 1");
    expect(step2[0].status).toBe("archived");
    expect(step2[1].content.title).toBe("Plan 2");
    expect(step2[1].status).toBe("active");
  });

  test("getActivePlan retorna solo el plan activo", () => {
    const { plans: step1 } = createPlan([], {
      type: "meal",
      content: { title: "Plan viejo" },
    });

    const { plans: step2 } = createPlan(step1, {
      type: "meal",
      content: { title: "Plan activo" },
    });

    const active = getActivePlan(step2, "meal");
    expect(active).not.toBeNull();
    expect(active?.content.title).toBe("Plan activo");
    expect(active?.status).toBe("active");
  });

  test("getActivePlan retorna null sin planes", () => {
    const active = getActivePlan([], "workout");
    expect(active).toBeNull();
  });

  test("planes de diferente tipo no se archivan entre si", () => {
    const { plans: step1 } = createPlan([], {
      type: "meal",
      content: { title: "Plan comidas" },
    });

    const { plans: step2 } = createPlan(step1, {
      type: "workout",
      content: { title: "Rutina PPL" },
    });

    // Meal plan should still be active
    const mealPlan = getActivePlan(step2, "meal");
    expect(mealPlan?.status).toBe("active");

    const workoutPlan = getActivePlan(step2, "workout");
    expect(workoutPlan?.status).toBe("active");
  });

  test("updatePlanStatus cambia el status", () => {
    const { plans, newPlanId } = createPlan([], {
      type: "meal",
      content: { title: "Plan" },
    });

    const updated = updatePlanStatus(plans, newPlanId, "completed");
    expect(updated[0].status).toBe("completed");
  });

  test("updatePlanContent actualiza el contenido", () => {
    const { plans, newPlanId } = createPlan([], {
      type: "meal",
      content: { title: "Plan original" },
    });

    const updated = updatePlanContent(plans, newPlanId, { title: "Plan editado" });
    expect(updated[0].content.title).toBe("Plan editado");
  });
});
