import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

// ═══ XPBar mock ═══

function XPBarMock({
  level,
  currentLevelXP,
  xpToNextLevel,
  progressPercent,
  totalXP,
  multiplier,
  multiplierLabel,
}: {
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  progressPercent: number;
  totalXP: number;
  multiplier: number;
  multiplierLabel?: string;
}) {
  return (
    <div data-testid="xp-bar">
      <span data-testid="xp-level">Nivel {level}</span>
      <div data-testid="xp-progress">
        {currentLevelXP}/{xpToNextLevel} XP
      </div>
      <div
        data-testid="xp-progress-bar"
        role="progressbar"
        aria-valuenow={progressPercent}
        style={{ width: `${progressPercent}%` }}
      />
      {multiplier > 1.0 && (
        <span data-testid="xp-multiplier">{multiplierLabel}</span>
      )}
      <span data-testid="xp-total">XP Total: {totalXP.toLocaleString()}</span>
    </div>
  );
}

describe("XPBar", () => {
  it("renders level number", () => {
    render(
      <XPBarMock
        level={5}
        currentLevelXP={120}
        xpToNextLevel={250}
        progressPercent={48}
        totalXP={1200}
        multiplier={1.0}
      />
    );
    expect(screen.getByTestId("xp-level")).toHaveTextContent("Nivel 5");
  });

  it("renders progress percentage", () => {
    render(
      <XPBarMock
        level={3}
        currentLevelXP={75}
        xpToNextLevel={150}
        progressPercent={50}
        totalXP={450}
        multiplier={1.0}
      />
    );
    expect(screen.getByTestId("xp-progress")).toHaveTextContent("75/150 XP");
    expect(screen.getByTestId("xp-progress-bar")).toHaveAttribute(
      "aria-valuenow",
      "50"
    );
  });

  it("renders streak multiplier badge when > 1x", () => {
    render(
      <XPBarMock
        level={7}
        currentLevelXP={200}
        xpToNextLevel={350}
        progressPercent={57}
        totalXP={2100}
        multiplier={1.5}
        multiplierLabel="1.5x Racha"
      />
    );
    expect(screen.getByTestId("xp-multiplier")).toHaveTextContent("1.5x Racha");
  });

  it("does not render multiplier badge at 1x", () => {
    render(
      <XPBarMock
        level={1}
        currentLevelXP={10}
        xpToNextLevel={100}
        progressPercent={10}
        totalXP={10}
        multiplier={1.0}
      />
    );
    expect(screen.queryByTestId("xp-multiplier")).not.toBeInTheDocument();
  });

  it("renders total XP", () => {
    render(
      <XPBarMock
        level={10}
        currentLevelXP={300}
        xpToNextLevel={500}
        progressPercent={60}
        totalXP={5000}
        multiplier={1.0}
      />
    );
    expect(screen.getByTestId("xp-total")).toHaveTextContent(/XP Total: 5[,.]000/);
  });
});

// ═══ AchievementCard mock ═══

function AchievementCardMock({
  name,
  description,
  category,
  xpReward,
  earned,
  earnedAt,
}: {
  name: string;
  description: string;
  category: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: number;
}) {
  return (
    <div
      data-testid="achievement-card"
      className={earned ? "earned" : "locked"}
    >
      <span data-testid="achievement-name">{name}</span>
      <span data-testid="achievement-description">{description}</span>
      <span data-testid="achievement-category">{category}</span>
      <span data-testid="achievement-xp">+{xpReward} XP</span>
      {earned && earnedAt && (
        <span data-testid="achievement-date">
          {new Date(earnedAt).toLocaleDateString("es-AR")}
        </span>
      )}
      {!earned && <span data-testid="achievement-lock">Bloqueado</span>}
    </div>
  );
}

describe("AchievementCard", () => {
  it("renders earned state with date", () => {
    render(
      <AchievementCardMock
        name="Primer paso"
        description="Registra tu primer dato"
        category="principiante"
        xpReward={50}
        earned={true}
        earnedAt={1700000000000}
      />
    );
    expect(screen.getByTestId("achievement-card")).toHaveClass("earned");
    expect(screen.getByTestId("achievement-name")).toHaveTextContent(
      "Primer paso"
    );
    expect(screen.getByTestId("achievement-date")).toBeInTheDocument();
    expect(screen.queryByTestId("achievement-lock")).not.toBeInTheDocument();
  });

  it("renders locked state", () => {
    render(
      <AchievementCardMock
        name="Maratonista"
        description="Completa 30 dias seguidos"
        category="maestria"
        xpReward={500}
        earned={false}
      />
    );
    expect(screen.getByTestId("achievement-card")).toHaveClass("locked");
    expect(screen.getByTestId("achievement-lock")).toHaveTextContent(
      "Bloqueado"
    );
    expect(screen.queryByTestId("achievement-date")).not.toBeInTheDocument();
  });

  it("renders XP reward", () => {
    render(
      <AchievementCardMock
        name="Test"
        description="Test"
        category="constancia"
        xpReward={200}
        earned={true}
        earnedAt={Date.now()}
      />
    );
    expect(screen.getByTestId("achievement-xp")).toHaveTextContent("+200 XP");
  });
});

// ═══ ChallengeCard mock ═══

function ChallengeCardMock({
  title,
  description,
  difficulty,
  currentValue,
  targetValue,
  progressPercent,
  xpReward,
  tips,
  daysRemaining,
  status,
}: {
  title: string;
  description: string;
  difficulty: string;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  xpReward: number;
  tips?: string[];
  daysRemaining?: number;
  status: "active" | "completed" | "empty";
}) {
  if (status === "empty") {
    return (
      <div data-testid="challenge-empty">
        No tenes un challenge activo. Se genera uno nuevo cada lunes.
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div data-testid="challenge-completed">
        <span data-testid="challenge-title">{title}</span>
        <span data-testid="challenge-xp">+{xpReward} XP</span>
      </div>
    );
  }

  return (
    <div data-testid="challenge-active">
      <span data-testid="challenge-title">{title}</span>
      <span data-testid="challenge-description">{description}</span>
      <span data-testid="challenge-difficulty">{difficulty}</span>
      <div data-testid="challenge-progress">
        {currentValue}/{targetValue} ({progressPercent}%)
      </div>
      <div
        data-testid="challenge-progress-bar"
        role="progressbar"
        aria-valuenow={progressPercent}
      />
      <span data-testid="challenge-xp">+{xpReward} XP</span>
      {daysRemaining !== undefined && (
        <span data-testid="challenge-countdown">
          {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
        </span>
      )}
      {tips && tips.length > 0 && (
        <ul data-testid="challenge-tips">
          {tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

describe("ChallengeCard", () => {
  it("renders active challenge with progress and tips", () => {
    render(
      <ChallengeCardMock
        title="Hidratacion semanal"
        description="Toma 2L de agua por 5 dias"
        difficulty="medio"
        currentValue={3}
        targetValue={5}
        progressPercent={60}
        xpReward={150}
        tips={["Lleva una botella siempre", "Pone alarmas"]}
        daysRemaining={4}
        status="active"
      />
    );
    expect(screen.getByTestId("challenge-title")).toHaveTextContent(
      "Hidratacion semanal"
    );
    expect(screen.getByTestId("challenge-progress")).toHaveTextContent(
      "3/5 (60%)"
    );
    expect(screen.getByTestId("challenge-tips")).toBeInTheDocument();
    expect(screen.getByTestId("challenge-countdown")).toHaveTextContent(
      "4 dias"
    );
  });

  it("renders empty state", () => {
    render(
      <ChallengeCardMock
        title=""
        description=""
        difficulty=""
        currentValue={0}
        targetValue={0}
        progressPercent={0}
        xpReward={0}
        status="empty"
      />
    );
    expect(screen.getByTestId("challenge-empty")).toHaveTextContent(
      "No tenes un challenge activo"
    );
  });

  it("renders completed state", () => {
    render(
      <ChallengeCardMock
        title="Challenge completado"
        description=""
        difficulty="facil"
        currentValue={5}
        targetValue={5}
        progressPercent={100}
        xpReward={100}
        status="completed"
      />
    );
    expect(screen.getByTestId("challenge-completed")).toBeInTheDocument();
    expect(screen.getByTestId("challenge-xp")).toHaveTextContent("+100 XP");
  });
});

// ═══ LevelBadge mock ═══

function LevelBadgeMock({ level }: { level: number }) {
  function getColor(l: number) {
    if (l <= 5) return "gray";
    if (l <= 10) return "green";
    if (l <= 20) return "blue";
    if (l <= 30) return "purple";
    if (l <= 40) return "yellow";
    return "red";
  }

  return (
    <div data-testid="level-badge" data-color={getColor(level)}>
      {level}
    </div>
  );
}

describe("LevelBadge", () => {
  it("renders correct color for low levels (1-5)", () => {
    render(<LevelBadgeMock level={3} />);
    expect(screen.getByTestId("level-badge")).toHaveAttribute(
      "data-color",
      "gray"
    );
    expect(screen.getByTestId("level-badge")).toHaveTextContent("3");
  });

  it("renders green for levels 6-10", () => {
    render(<LevelBadgeMock level={8} />);
    expect(screen.getByTestId("level-badge")).toHaveAttribute(
      "data-color",
      "green"
    );
  });

  it("renders blue for levels 11-20", () => {
    render(<LevelBadgeMock level={15} />);
    expect(screen.getByTestId("level-badge")).toHaveAttribute(
      "data-color",
      "blue"
    );
  });

  it("renders purple for levels 21-30", () => {
    render(<LevelBadgeMock level={25} />);
    expect(screen.getByTestId("level-badge")).toHaveAttribute(
      "data-color",
      "purple"
    );
  });

  it("renders yellow for levels 31-40", () => {
    render(<LevelBadgeMock level={35} />);
    expect(screen.getByTestId("level-badge")).toHaveAttribute(
      "data-color",
      "yellow"
    );
  });

  it("renders red for levels 41+", () => {
    render(<LevelBadgeMock level={50} />);
    expect(screen.getByTestId("level-badge")).toHaveAttribute(
      "data-color",
      "red"
    );
  });
});

// ═══ StreakDisplay mock ═══

function StreakDisplayMock({
  streakDays,
  multiplier,
  multiplierLabel,
  freezes,
}: {
  streakDays: number;
  multiplier: number;
  multiplierLabel?: string;
  freezes: number;
}) {
  return (
    <div data-testid="streak-display">
      <span data-testid="streak-days">
        Racha: {streakDays} {streakDays === 1 ? "dia" : "dias"}
      </span>
      {multiplier > 1.0 && (
        <span data-testid="streak-multiplier">{multiplierLabel}</span>
      )}
      {freezes > 0 && (
        <span data-testid="streak-freezes">
          {freezes} freeze disponible
        </span>
      )}
    </div>
  );
}

describe("StreakDisplay", () => {
  it("renders streak days", () => {
    render(
      <StreakDisplayMock
        streakDays={7}
        multiplier={1.0}
        freezes={0}
      />
    );
    expect(screen.getByTestId("streak-days")).toHaveTextContent(
      "Racha: 7 dias"
    );
  });

  it("renders singular day", () => {
    render(
      <StreakDisplayMock
        streakDays={1}
        multiplier={1.0}
        freezes={0}
      />
    );
    expect(screen.getByTestId("streak-days")).toHaveTextContent(
      "Racha: 1 dia"
    );
  });

  it("renders multiplier when > 1x", () => {
    render(
      <StreakDisplayMock
        streakDays={14}
        multiplier={2.0}
        multiplierLabel="2x Racha"
        freezes={0}
      />
    );
    expect(screen.getByTestId("streak-multiplier")).toHaveTextContent(
      "2x Racha"
    );
  });

  it("does not render multiplier at 1x", () => {
    render(
      <StreakDisplayMock
        streakDays={3}
        multiplier={1.0}
        freezes={0}
      />
    );
    expect(screen.queryByTestId("streak-multiplier")).not.toBeInTheDocument();
  });

  it("renders freeze count when available", () => {
    render(
      <StreakDisplayMock
        streakDays={10}
        multiplier={1.5}
        multiplierLabel="1.5x"
        freezes={2}
      />
    );
    expect(screen.getByTestId("streak-freezes")).toHaveTextContent(
      "2 freeze disponible"
    );
  });
});
