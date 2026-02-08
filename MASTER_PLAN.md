# Plan maestro: app de cuidado personal con agentes de IA

**No existe hoy una sola app que integre skincare, nutrición, fitness, sueño, salud mental e hidratación con inteligencia artificial que conecte todos estos dominios.** Este vacío representa una oportunidad de **$11.27B** (mercado 2024, crecimiento del 14.9% CAGR). La personalización con IA eleva la retención entre un 25-40%, y el 62% de la financiación en salud digital en 2025 fue a startups con IA. El stack elegido — Next.js, Convex, shadcn/ui y blocks.so — resulta excepcionalmente adecuado gracias al componente `@convex-dev/agents` de Convex, que resuelve de forma nativa threads de conversación, streaming persistente, búsqueda vectorial, RAG y herramientas para agentes, eliminando la necesidad de infraestructura externa.

Este documento constituye el plan maestro completo: arquitectura del producto, diseño de agentes de IA, esquema de datos, estructura del proyecto, fases de implementación, monetización y métricas.

---

## Visión del producto y arquitectura de agentes

La app se estructura como un **sistema multi-agente orquestado** donde cada dominio de cuidado personal tiene un agente de IA especializado, coordinado por un agente orquestador central. El usuario interactúa con una interfaz unificada y los agentes colaboran internamente para ofrecer **insights cross-domain** — por ejemplo, correlacionar un brote de acné con cambios en la dieta, estrés elevado o mala calidad de sueño.

### Los 8 agentes del sistema

| Agente | Función principal | Modelo LLM | Herramientas |
|--------|------------------|------------|--------------|
| **Orquestador** | Clasifica intención, enruta al especialista, agrega resultados | GPT-4o | `routeToAgent`, `aggregateInsights`, `getUserContext` |
| **Skincare** | Análisis de piel por foto, rutinas personalizadas, tracking de progreso | GPT-4o (visión) | `analyzeSkinImage`, `getSkincareRoutine`, `trackSkinProgress` |
| **Nutrición** | Planes alimenticios, reconocimiento de comida por foto, tracking macro/micro | GPT-4o-mini + GPT-4o (visión) | `analyzeFoodImage`, `createMealPlan`, `logMeal`, `searchNutritionDB` |
| **Fitness** | Planes de entrenamiento, coaching en tiempo real, adaptación por recuperación | GPT-4o-mini | `createWorkoutPlan`, `logExercise`, `adjustIntensity`, `readWearableData` |
| **Salud Mental** | Check-ins emocionales, técnicas CBT, journaling guiado, meditación | GPT-4o | `logMood`, `suggestCBTExercise`, `generateJournalPrompt`, `guidedMeditation` |
| **Sueño** | Análisis de calidad de sueño, optimización circadiana, rutinas nocturnas | GPT-4o-mini | `analyzeSleepData`, `optimizeBedtimeRoutine`, `trackSleepTrends` |
| **Hidratación y Hábitos** | Tracking de agua, gestión de hábitos, streaks, gamificación | GPT-4o-mini | `logWater`, `trackHabit`, `calculateStreaks`, `sendReminder` |
| **Seguridad (Safety)** | Revisa TODAS las respuestas antes de entregarlas, detecta crisis, inyecta disclaimers | GPT-4o-mini | `checkMedicalSafety`, `detectCrisis`, `injectDisclaimer`, `escalateToHuman` |

El **patrón arquitectónico es Orchestrator-Worker con Generator-Critic**: el Orquestador recibe la consulta del usuario, la enruta al agente especialista adecuado (o a varios en paralelo para insights cross-domain), y antes de entregar cualquier respuesta al usuario, el agente de Seguridad la revisa. Esto garantiza que ninguna recomendación de salud llega al usuario sin pasar por filtros de seguridad.

### Flujo de una interacción típica

```
Usuario: "Me siento cansado y tengo granitos, ¿qué me pasa?"
    │
    ▼
[Orquestador] → Detecta: sueño + skincare + posible estrés
    │
    ├──► [Agente Sueño] → Consulta datos recientes de sueño → "Llevas 3 noches bajo 6h"
    ├──► [Agente Skincare] → Revisa historial de piel → "Aumento de comedones esta semana"
    ├──► [Agente Mental] → Revisa mood logs → "Estrés elevado últimos 5 días"
    │
    ▼
[Orquestador] → Sintetiza insights cross-domain
    │
    ▼
[Agente Seguridad] → Valida respuesta, agrega disclaimers
    │
    ▼
Usuario recibe: Análisis holístico conectando sueño, estrés y piel con plan de acción
```

---

## Arquitectura técnica detallada

### Stack y cómo encaja cada pieza

**Next.js 15 (App Router)** sirve como capa de presentación y API. Los Server Components renderizan contenido estático y layouts. Los Client Components (`"use client"`) manejan toda la interactividad y las suscripciones reactivas de Convex vía `useQuery`. Para streaming de IA se usa el **async delta streaming de Convex**, que persiste los deltas en la base de datos y los suscriptores los reciben vía WebSocket — esto sobrevive a refrescos de página e interrupciones de red.

**Convex** es el corazón del backend. No es solo una base de datos: es el runtime completo para los agentes de IA gracias a `@convex-dev/agents`. Este componente proporciona:

- **Threads persistentes** con historial automático de mensajes
- **Búsqueda vectorial híbrida** (vector + texto) incorporada — sin necesidad de Pinecone o Weaviate
- **RAG nativo** vía `@convex-dev/rag` para la base de conocimiento de wellness
- **Streaming asíncrono con deltas** que se guardan en la DB y se sincronizan en tiempo real
- **Workflows durables** para flujos multi-paso (onboarding, planes semanales)
- **Tracking de uso** por proveedor, modelo, usuario y agente para control de costes
- **Cron jobs** para planes diarios, resúmenes semanales, notificaciones inteligentes
- **File storage** para fotos de piel, comida y progreso

**shadcn/ui** proporciona **55+ componentes** accesibles y customizables. Los más relevantes: **Chart** (Recharts) para visualizar métricas de salud, **Calendar** (30+ bloques) para tracking de hábitos, **Progress** para metas, **Sheet/Drawer** para la interfaz de chat con IA, **Slider** para escalas de mood/energía, **Card** para métricas, y el nuevo componente **Field** (Oct 2025) para formularios.

**blocks.so** añade **60+ bloques prefabricados** organizados en 11 categorías. Los más útiles: **15 bloques de Stats** para dashboards de métricas de salud, **5 bloques de AI Components** para interfaces de IA, **9 bloques de Login/Signup** para autenticación, **6 bloques de Sidebar** para navegación, y **12 bloques de Dialogs** para interacciones modales.

### Esquema de base de datos Convex

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══ USUARIOS ═══
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    preferences: v.object({
      activeModules: v.array(v.string()), // ["skincare","nutrition","fitness","mental","sleep","hydration"]
      unitSystem: v.union(v.literal("metric"), v.literal("imperial")),
      language: v.string(),
      notificationsEnabled: v.boolean(),
      wakeUpTime: v.optional(v.string()),
      bedTime: v.optional(v.string()),
    }),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ═══ PERFILES DE SALUD ═══
  healthProfiles: defineTable({
    userId: v.id("users"),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    skinType: v.optional(v.string()), // "oily","dry","combination","normal","sensitive"
    skinConcerns: v.optional(v.array(v.string())),
    dietaryRestrictions: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    fitnessLevel: v.optional(v.string()),
    healthGoals: v.optional(v.array(v.string())),
    medicalConditions: v.optional(v.array(v.string())),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ═══ ENTRADAS DE WELLNESS (polimórfica) ═══
  wellnessEntries: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("mood"), v.literal("exercise"), v.literal("nutrition"),
      v.literal("sleep"), v.literal("water"), v.literal("skincare"),
      v.literal("weight"), v.literal("habit")
    ),
    data: v.any(), // Estructura flexible según tipo
    timestamp: v.number(),
    source: v.union(v.literal("manual"), v.literal("wearable"), v.literal("ai")),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_user_time", ["userId", "timestamp"])
    .index("by_type_time", ["type", "timestamp"]),

  // ═══ PLANES GENERADOS POR IA ═══
  aiPlans: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("daily"), v.literal("meal"), v.literal("workout"),
      v.literal("skincare_routine"), v.literal("sleep_routine"), v.literal("weekly")
    ),
    content: v.any(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    generatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_user_status", ["userId", "status"]),

  // ═══ HÁBITOS ═══
  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    category: v.string(),
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("custom")),
    targetPerPeriod: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ═══ FOTOS DE PROGRESO ═══
  progressPhotos: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("skin"), v.literal("body"), v.literal("food")),
    storageId: v.string(),
    aiAnalysis: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_user_time", ["userId", "timestamp"]),

  // ═══ METAS ═══
  goals: defineTable({
    userId: v.id("users"),
    category: v.string(),
    title: v.string(),
    targetValue: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("paused")),
    createdAt: v.number(),
  }).index("by_user_category", ["userId", "category"]),

  // ═══ NOTIFICACIONES ═══
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_read", ["userId", "read"])
    .index("by_user_time", ["userId", "createdAt"]),

  // ═══ BASE DE CONOCIMIENTO WELLNESS (para RAG) ═══
  wellnessKnowledge: defineTable({
    text: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    source: v.string(),
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["category"],
  }),
});
```

### Estructura del proyecto Next.js

```
├── app/
│   ├── layout.tsx                    # Root layout (Server Component)
│   ├── providers.tsx                 # Convex + Clerk providers (Client)
│   ├── page.tsx                      # Landing page
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── onboarding/
│   │   ├── page.tsx                  # Flujo de onboarding progresivo
│   │   └── steps/                    # Componentes de cada paso
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout con sidebar
│   │   ├── page.tsx                  # Home: resumen diario + insights IA
│   │   ├── chat/page.tsx             # Chat principal con IA
│   │   ├── skincare/
│   │   │   ├── page.tsx              # Dashboard skincare
│   │   │   ├── analysis/page.tsx     # Análisis de piel con foto
│   │   │   └── routine/page.tsx      # Rutina personalizada
│   │   ├── nutrition/
│   │   │   ├── page.tsx              # Dashboard nutrición
│   │   │   ├── log/page.tsx          # Log de comidas (foto + manual)
│   │   │   └── plans/page.tsx        # Planes alimenticios
│   │   ├── fitness/
│   │   │   ├── page.tsx              # Dashboard fitness
│   │   │   ├── workout/page.tsx      # Entrenamiento activo + coaching
│   │   │   └── history/page.tsx      # Historial
│   │   ├── mental/
│   │   │   ├── page.tsx              # Dashboard salud mental
│   │   │   ├── checkin/page.tsx      # Check-in emocional
│   │   │   └── journal/page.tsx      # Journaling guiado
│   │   ├── sleep/page.tsx            # Dashboard sueño
│   │   ├── habits/page.tsx           # Tracker de hábitos
│   │   ├── progress/page.tsx         # Progreso global + fotos
│   │   └── settings/page.tsx         # Configuración
│   └── api/                          # API routes (si se necesitan)
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── blocks/                       # blocks.so adaptados
│   ├── chat/                         # Chat UI (streaming, mensajes)
│   ├── dashboard/                    # Widgets del dashboard
│   ├── wellness/                     # Componentes específicos de dominio
│   └── shared/                       # Componentes reutilizables
├── convex/
│   ├── schema.ts                     # Esquema de DB
│   ├── convex.config.ts              # Configuración de componentes (agents, rag)
│   ├── agents/
│   │   ├── orchestrator.ts           # Agente orquestador
│   │   ├── skincare.ts               # Agente skincare
│   │   ├── nutrition.ts              # Agente nutrición
│   │   ├── fitness.ts                # Agente fitness
│   │   ├── mental.ts                 # Agente salud mental
│   │   ├── sleep.ts                  # Agente sueño
│   │   ├── habits.ts                 # Agente hidratación/hábitos
│   │   └── safety.ts                 # Agente de seguridad
│   ├── tools/                        # Herramientas para agentes
│   │   ├── healthData.ts
│   │   ├── mealPlanning.ts
│   │   ├── workoutPlanning.ts
│   │   ├── imageAnalysis.ts
│   │   └── notifications.ts
│   ├── functions/
│   │   ├── users.ts                  # CRUD usuarios
│   │   ├── wellness.ts               # CRUD entradas wellness
│   │   ├── plans.ts                  # Gestión de planes IA
│   │   ├── habits.ts                 # Gestión de hábitos
│   │   ├── goals.ts                  # Gestión de metas
│   │   └── analytics.ts             # Consultas analíticas
│   ├── crons.ts                      # Jobs programados
│   └── http.ts                       # Webhooks (Clerk, wearables)
├── lib/
│   ├── utils.ts
│   ├── constants.ts
│   └── prompts/                      # System prompts para agentes
│       ├── orchestrator.ts
│       ├── skincare.ts
│       ├── nutrition.ts
│       └── ...
└── public/
```

### Definición de un agente en Convex

```typescript
// convex/agents/skincare.ts
import { Agent, createTool } from "@convex-dev/agents";
import { openai } from "@ai-sdk/openai";
import { components, internal } from "../_generated/api";
import { z } from "zod";
import { SKINCARE_SYSTEM_PROMPT } from "../lib/prompts/skincare";

const analyzeSkinImage = createTool({
  description: "Analiza una foto de la piel del usuario para evaluar condición, hidratación, textura, pigmentación y preocupaciones visibles",
  args: z.object({
    imageStorageId: z.string(),
  }),
  handler: async (ctx, args) => {
    const imageUrl = await ctx.runQuery(internal.files.getUrl, { storageId: args.imageStorageId });
    // La imagen se enviará como contenido multimodal al LLM
    return { imageUrl, instruction: "Analiza esta imagen de piel" };
  },
});

const getSkincareHistory = createTool({
  description: "Obtiene el historial de análisis de piel y rutinas del usuario",
  args: z.object({ timeRange: z.enum(["week", "month", "quarter"]) }),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    return await ctx.runQuery(internal.wellness.getSkinEntries, {
      userId: user._id,
      timeRange: args.timeRange,
    });
  },
});

export const skincareAgent = new Agent(components.agent, {
  name: "Skincare Specialist",
  chat: openai.chat("gpt-4o"), // Visión necesaria para análisis de piel
  textEmbedding: openai.embedding("text-embedding-3-small"),
  instructions: SKINCARE_SYSTEM_PROMPT,
  tools: {
    analyzeSkinImage,
    getSkincareHistory,
    getUserProfile: profileTool,
    searchSkincareKnowledge: ragSearchTool,
  },
});
```

---

## Diseño de la experiencia de usuario

### Onboarding progresivo (5-7 minutos)

El onboarding determina la primera impresión y la retención a largo plazo. El **77% de los usuarios abandona en los primeros 3 días**, así que el onboarding debe demostrar valor inmediato. El flujo se diseña como una conversación con el agente orquestador, no como un formulario aburrido:

**Paso 1 — Bienvenida y selección de módulos** (30s). El usuario elige qué pilares le interesan: skincare, nutrición, fitness, salud mental, sueño, hábitos. La app solo muestra contenido de los pilares activados, evitando sobrecarga. Se pueden activar más después.

**Paso 2 — Perfil básico** (60s). Edad, género (opcional), altura, peso. Formulario limpio usando shadcn/ui Field + blocks.so Form Layout.

**Paso 3 — Cuestionario adaptativo por módulo** (2-3 min). Para cada módulo activado, preguntas específicas generadas por el agente: tipo de piel y preocupaciones (skincare), restricciones alimentarias y objetivos (nutrición), nivel de fitness y frecuencia (fitness), estado emocional actual (mental), calidad de sueño percibida (sueño).

**Paso 4 — Foto opcional de piel** (30s). Si skincare está activado, ofrecer análisis inicial con foto. Resultado inmediato = valor demostrado.

**Paso 5 — Plan personalizado** (instantáneo). El orquestador genera un plan diario inicial basado en toda la información recolectada. El usuario ve inmediatamente recomendaciones personalizadas. **Este es el "quick win" que ancla la retención.**

### Pantalla principal: Daily Hub

La pantalla principal muestra un **resumen diario personalizado** generado cada mañana por el cron job de Convex. Usa bloques de Stats de blocks.so (15 variantes) para métricas clave, Chart de shadcn/ui para tendencias, y Card para insights del día. Estructura:

- **Saludo + insight del día** (generado por IA): "Buenos días. Tu sueño mejoró 12% esta semana. Hoy enfócate en hidratación — tu piel lo agradecerá."
- **Métricas rápidas**: Agua, pasos, horas de sueño, mood score, streak de hábitos
- **Plan del día**: Lista colapsable con tareas de cada módulo activo
- **Acceso rápido al chat**: Botón flotante para hablar con la IA en cualquier momento

### Interfaz de chat con agentes

El chat usa **Convex async delta streaming** con `useUIMessages` para una experiencia fluida. El componente `<SmoothText>` suaviza el rendering del texto streameado. El usuario no necesita saber qué agente le responde — el orquestador maneja el routing internamente, pero se puede mostrar un badge sutil indicando el dominio ("🧴 Skincare" o "🏋️ Fitness").

---

## Plan maestro de implementación en fases

### FASE 0: Fundación (Semanas 1-2)

**Objetivo**: Infraestructura base funcional, autenticación y estructura del proyecto.

| Tarea | Detalle | Duración |
|-------|---------|----------|
| Setup Next.js 15 + App Router | Crear proyecto, configurar Tailwind, ESLint, TypeScript estricto | 1 día |
| Instalar y configurar Convex | `npx convex dev`, definir schema inicial, configurar `convex.config.ts` con `@convex-dev/agents` y `@convex-dev/rag` | 1 día |
| Integrar Clerk + Convex | `ConvexProviderWithClerk`, middleware de Clerk, webhook para sync de usuarios, template JWT | 1 día |
| Instalar shadcn/ui completo | `npx shadcn@latest init`, instalar todos los componentes necesarios, configurar tema personalizado (colores wellness) | 1 día |
| Importar bloques de blocks.so | Stats, Sidebar, Login/Signup, AI Components, Form Layout — adaptar al tema | 1 día |
| Estructura de carpetas y rutas | Crear toda la estructura del proyecto como se definió arriba | 0.5 días |
| Layout base del dashboard | Sidebar con navegación por módulos, header con avatar/notificaciones, responsive | 1.5 días |
| Sistema de temas | Modo claro/oscuro, paleta de colores wellness, CSS variables | 1 día |
| CI/CD básico | Deploy en Vercel + Convex, preview deployments, variables de entorno | 0.5 días |
| Testing base | Vitest + Testing Library setup, tests básicos de componentes | 0.5 días |

**Entregable**: App desplegada con autenticación funcional, dashboard vacío con sidebar y navegación.

---

### FASE 1: Motor de IA y primer agente (Semanas 3-5)

**Objetivo**: Primer agente funcional (Hábitos + Hidratación) con chat streaming.

| Tarea | Detalle | Duración |
|-------|---------|----------|
| Configurar `@convex-dev/agents` | Instalar componente, configurar en `convex.config.ts`, probar con agente básico | 1 día |
| Implementar Agente Orquestador | System prompt detallado, routing de intención, herramientas de contexto de usuario | 2 días |
| Implementar Agente de Hábitos/Hidratación | System prompt, herramientas: `logWater`, `trackHabit`, `calculateStreaks`, `sendReminder` | 2 días |
| Implementar Agente de Seguridad | Revisión de outputs, inyección de disclaimers, detección de crisis (keywords + semántica), routing a hotlines | 2 días |
| UI de Chat con streaming | Componente chat usando `useUIMessages`, `<SmoothText>`, async delta streaming de Convex | 2 días |
| Tracker de hábitos | CRUD de hábitos, visualización de streaks (Calendar de shadcn), completar/skip hábitos diarios | 2 días |
| Tracker de hidratación | Log de vasos de agua, meta diaria personalizable, Progress bar, recordatorios vía `ctx.scheduler` | 1.5 días |
| Cron job: recordatorios | Scheduled functions para recordar hidratación y hábitos pendientes | 1 día |
| Testing y QA | Tests de agentes (respuestas apropiadas, safety checks), tests de UI, tests de mutations | 1.5 días |

**Entregable**: Chat funcional con IA, tracking de hábitos y agua, primeros recordatorios automatizados.

---

### FASE 2: Nutrición y fitness (Semanas 6-9)

**Objetivo**: Agentes de nutrición y fitness completos con tracking y planes.

| Tarea | Detalle | Duración |
|-------|---------|----------|
| Agente de Nutrición | System prompt, herramientas: `analyzeFoodImage` (GPT-4o vision), `createMealPlan`, `logMeal`, `searchNutritionDB` | 3 días |
| Agente de Fitness | System prompt, herramientas: `createWorkoutPlan`, `logExercise`, `adjustIntensity`, integración con datos de wearable | 3 días |
| UI log de comidas | Foto + reconocimiento automático, entrada manual, búsqueda en base de datos, macro breakdown (Chart de shadcn) | 3 días |
| Upload de fotos de comida | Convex file storage con `generateUploadUrl`, preview, análisis automático via agente | 1.5 días |
| Dashboard de nutrición | Calorías diarias, macros, tendencia semanal, insights de IA (Stats blocks de blocks.so) | 2 días |
| UI de workout activo | Timer, lista de ejercicios, coaching en tiempo real del agente fitness (streaming rápido con GPT-4o-mini) | 2.5 días |
| Historial y progreso fitness | Logs de entrenamientos, volumen semanal, PRs, gráficos de progreso | 2 días |
| Generación de planes | Meal plans y workout plans generados por IA, guardados en `aiPlans`, editables | 2 días |
| Base de conocimiento RAG | Poblar `wellnessKnowledge` con datos de nutrición y ejercicio, configurar `@convex-dev/rag` con embeddings | 2 días |
| Testing y QA | Análisis de imagen preciso, plans coherentes, safety de recomendaciones nutricionales | 2 días |

**Entregable**: Tracking completo de nutrición (con foto) y fitness, planes generados por IA, coaching en tiempo real.

---

### FASE 3: Skincare y salud mental (Semanas 10-13)

**Objetivo**: Los diferenciadores clave — análisis de piel con IA y soporte de salud mental con guardrails robustos.

| Tarea | Detalle | Duración |
|-------|---------|----------|
| Agente de Skincare | System prompt especializado, herramientas: `analyzeSkinImage`, `getSkincareHistory`, `generateRoutine`, `trackSkinProgress` | 3 días |
| UI análisis de piel | Captura/upload de selfie, guía de iluminación, análisis con GPT-4o vision, resultados visuales (hidratación, textura, manchas, acné) | 3 días |
| Rutina de skincare | Generación de rutina AM/PM personalizada, pasos con productos sugeridos por categoría (no marcas para evitar conflictos), timer | 2 días |
| Progreso de piel | Comparación before/after con fotos, timeline visual, métricas de evolución | 2 días |
| Agente de Salud Mental | System prompt con CBT/DBT frameworks, tono empático obligatorio, **protocolo de crisis estricto** | 3 días |
| Protocolo de crisis | Detección de keywords de autolesión/suicidio, interrupción inmediata de flujo normal, mostrar recursos de crisis (988, Crisis Text Line), log de incidente | 2 días |
| Check-in emocional | Mood slider (shadcn Slider), selección de emociones, nota opcional, análisis de tendencias | 1.5 días |
| Journaling guiado | Prompts generados por IA basados en mood actual, historial de journaling searchable | 1.5 días |
| Ejercicios guiados | Técnicas de respiración con animación, body scan, gratitud, reframing cognitivo | 2 días |
| Compliance legal | Disclaimers permanentes en módulo de salud mental (cumplir California SB 243, AB 489, Illinois WOPR Act), disclosure de IA continua | 1.5 días |
| Testing robusto de safety | Red-teaming del agente de salud mental, probar edge cases de crisis, validar que safety agent bloquea respuestas peligrosas | 2 días |

**Entregable**: Análisis de piel con IA, rutinas personalizadas, sistema de salud mental con CBT y guardrails completos.

---

### FASE 4: Sueño, insights cross-domain y Daily Hub (Semanas 14-16)

**Objetivo**: Completar todos los agentes, implementar la orquestación cross-domain y el Daily Hub.

| Tarea | Detalle | Duración |
|-------|---------|----------|
| Agente de Sueño | System prompt, herramientas: `analyzeSleepData`, `optimizeBedtimeRoutine`, `trackSleepTrends` | 2 días |
| UI de sueño | Log manual de sueño (hora acostarse/despertar, calidad percibida), dashboard con tendencias | 2 días |
| Integración wearables (API) | Apple HealthKit y Google Fit vía APIs REST/webhooks para importar sueño, pasos, heart rate | 3 días |
| Orquestación cross-domain | Actualizar Orquestador para consultar múltiples agentes en paralelo, generar insights que conectan dominios | 3 días |
| Cron job: Daily Plan | Cada mañana a las 6am, generar plan personalizado considerando todos los datos del usuario | 2 días |
| Cron job: Weekly Summary | Cada domingo, generar resumen semanal con insights, logros, áreas de mejora | 1 día |
| Daily Hub UI | Pantalla principal con saludo IA, métricas, plan del día, insights — usando Stats blocks + Chart | 2 días |
| Sistema de notificaciones | Push notifications vía web push, notificaciones in-app, preferencias de frecuencia | 2 días |
| Testing integración | Flujos end-to-end cross-domain, coherencia de insights, rendimiento de crons | 2 días |

**Entregable**: Todos los agentes funcionando, insights holísticos cross-domain, experiencia diaria completa.

---

### FASE 5: Gamificación, comunidad y pulido (Semanas 17-20)

**Objetivo**: Retención a largo plazo mediante gamificación, social features y optimización.

| Tarea | Detalle | Duración |
|-------|---------|----------|
| Sistema de puntos y niveles | XP por completar hábitos, logs, entrenamientos; niveles con badges desbloqueables | 3 días |
| Streaks con recompensas | Multiplicadores de XP por streaks consecutivos, "freeze" de streak (1/semana) | 1.5 días |
| Challenges semanales | Retos generados por IA ("Bebe 2.5L diarios esta semana"), tracking de progreso | 2 días |
| Sistema de logros | Achievements por milestones (100 entrenamientos, 30 días de journaling, etc.) | 2 días |
| Perfil público opcional | Badges visibles, estadísticas compartibles, nivel de bienestar | 1.5 días |
| Comunidad anónima | Foro por temas (como "Secret Chats" de Flo), anónimo por defecto, moderación por IA | 3 días |
| Optimización de rendimiento | Audit de bundle size, lazy loading de módulos, optimización de queries Convex, caching | 2 días |
| Optimización de costes IA | Implementar model routing (GPT-4o-mini para tareas simples), semantic caching, prompt caching | 2 días |
| Accesibilidad (a11y) | WCAG 2.1 AA compliance, screen reader testing, keyboard navigation completa | 2 días |
| PWA | Service worker, instalable, offline básico (ver datos cacheados) | 1.5 días |
| Testing final | Tests de rendimiento, tests de seguridad, tests de accesibilidad, beta testing con usuarios reales | 3 días |

**Entregable**: App completa con gamificación, comunidad, optimizada y lista para beta.

---

### FASE 6: Monetización y lanzamiento (Semanas 21-24)

**Objetivo**: Implementar modelo de negocio, preparar lanzamiento público.

| Tarea | Detalle | Duración |
|-------|---------|----------|
| Sistema de suscripciones | Stripe/RevenueCat integración, tiers Free/Premium, trial de 7 días | 3 días |
| Feature gating | Limitar free: 3 chats IA/día, 1 módulo, sin insights cross-domain, sin análisis de fotos | 2 días |
| Tier Premium ($9.99/mes) | Chat ilimitado, todos los módulos, insights cross-domain, análisis de fotos, planes personalizados, exportación de datos | 1 día (configuración) |
| Tier Pro ($19.99/mes) | Todo Premium + coaches humanos (marketplace futuro), prioridad en IA (GPT-4o siempre), API de datos | 1 día (configuración) |
| Onboarding refinado | A/B testing de flujos de onboarding, optimización de conversión | 2 días |
| Analytics | Mixpanel/PostHog para product analytics, funnel de conversión, cohortes de retención | 2 días |
| Landing page | Marketing page con demo interactiva, testimonials, pricing, CTA claro | 3 días |
| Legal y compliance | Términos de servicio, política de privacidad, política de datos de salud, GDPR compliance, cookie consent | 2 días |
| App Store prep | Si React Native/Capacitor para mobile: preparar listings, screenshots, descripción | 3 días (si aplica) |
| Launch plan | Beta cerrada (200 usuarios) → Beta abierta → Lanzamiento público. Feedback loops en cada etapa | 3 días |
| Monitoring producción | Sentry para errores, Convex dashboard para backend, alertas de costes IA, uptime monitoring | 1.5 días |

**Entregable**: App en producción con monetización activa y usuarios reales.

---

## Estrategia de monetización recomendada

El modelo **freemium con suscripción** es el estándar del mercado, con una tasa de conversión típica del **5-10%**. La clave es que el tier gratuito sea lo suficientemente útil para generar el hábito, pero que las limitaciones se sientan naturales y no punitivas.

**Tier Gratuito** incluye 1 módulo activo, 3 interacciones con IA al día, tracking manual básico (hábitos, agua, mood), y acceso a la comunidad. Esto cuesta aproximadamente **$0.01/usuario/día** en LLM.

**Tier Premium ($9.99/mes o $79.99/año)** desbloquea todos los módulos, chat ilimitado con IA, análisis de fotos (piel y comida), planes personalizados, insights cross-domain, exportación de datos, y sin publicidad. Costo estimado: **$0.05-0.15/usuario/día** en LLM.

**Revenue targets**: Con **10,000 DAU** y 7% de conversión a Premium, se generarían ~**$7,000/mes** en suscripciones. Los costes de IA serían ~$1,500-3,000/mes con model routing optimizado. Convex Pro plan ~$25/mes. **Margen bruto estimado: 55-75%.**

A futuro, las líneas de expansión más prometedoras son **B2B/corporate wellness** (Calm y Headspace generan gran parte de sus ingresos aquí), **marketplace de coaches humanos** (comisión del 20%), y **partnerships con marcas de skincare/nutrición** (recomendaciones de productos con afiliación).

---

## Guardrails de seguridad y compliance

La seguridad no es un feature: es una capa del sistema que procesa el **100% de las respuestas**. El agente de Seguridad tiene las siguientes reglas inviolables implementadas como validaciones hard-coded, no solo prompts:

Nunca diagnosticar condiciones médicas. Nunca recomendar medicamentos específicos. Nunca sustituir consejos de profesionales de salud. Siempre incluir disclaimer en respuestas de salud. Detección inmediata de crisis con derivación a líneas de ayuda. Disclosure continuo de que el usuario interactúa con IA (cumplir **California SB 243**). Prohibición de usar títulos que impliquen expertise médica (cumplir **California AB 489**). Log de auditoría de cada interacción para compliance.

Los datos de salud se cifran en reposo y en tránsito. Se implementa **data minimization** — solo se recolecta lo necesario. El usuario puede exportar y eliminar todos sus datos en cualquier momento (GDPR). Si en el futuro se procesa PHI con entidades cubiertas, se requieren BAAs con todos los vendors.

---

## Métricas de éxito por fase

| Fase | Métrica clave | Target |
|------|--------------|--------|
| 0-1 | Setup completo + 1er agente funcional | Streaming < 200ms latency |
| 2 | Engagement con tracking | >60% de usuarios logean al menos 1 comida o workout/día |
| 3 | Análisis de piel satisfactorio | >80% de usuarios reportan análisis útil |
| 4 | Retención Day-7 | >25% (vs 15% promedio del mercado) |
| 5 | Retención Day-30 | >15% (vs 8% promedio del mercado) |
| 6 | Conversión Free→Premium | >5% en primer mes |
| 6+ | Retención anual de suscriptores | >33% (benchmark del mercado) |

---

## Conclusión: diferenciadores competitivos y riesgos clave

Esta app tiene **tres diferenciadores que no existen hoy en el mercado**: primero, la integración cross-domain genuina donde el agente orquestador conecta patrones entre sueño, piel, nutrición, ejercicio y salud mental — ninguna app actual hace esto. Segundo, skincare integrado en una plataforma de bienestar general — hoy existe solo en apps nicho aisladas. Tercero, arquitectura modular donde el usuario elige exactamente qué pilares activar, evitando la sobrecarga que mata a las apps "todo en uno".

Los riesgos principales son tres. **Costes de IA a escala**: con model routing agresivo (GPT-4o-mini como default, GPT-4o solo para visión y análisis complejos), semantic caching, y prompt caching, los costes se mantienen en **$0.05-0.15/usuario/día** para Premium — viable con $9.99/mes de suscripción. **Regulatory**: el espacio de salud mental tiene regulación activa en evolución (47 estados introdujeron bills en 2025); el diseño con Safety Agent como capa obligatoria y disclaimers permanentes mitiga esto. **Retención**: el 77% de usuarios abandona en 3 días; la estrategia de onboarding con "quick win" inmediato (plan personalizado desde el minuto 1), gamificación con streaks, e insights proactivos diarios ataca directamente este problema.

El stack Next.js + Convex con `@convex-dev/agents` es especialmente potente para este caso de uso: real-time nativo, agentes de IA como ciudadanos de primera clase, búsqueda vectorial integrada, streaming persistente, y cron jobs — todo en un sistema coherente sin necesidad de pegamento entre servicios externos. Esto reduce significativamente el tiempo de desarrollo y la complejidad operativa frente a alternativas como un sistema con LangChain + Pinecone + Redis + PostgreSQL + servidor separado de WebSockets.