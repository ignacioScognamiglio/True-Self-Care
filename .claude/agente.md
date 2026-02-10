# True Self-Care — Contexto del Proyecto

## Proyecto
**True Self-Care** es una app de bienestar personal integral que conecta skincare, nutricion, fitness, sueno, salud mental e hidratacion mediante agentes de IA especializados. La diferenciacion clave es la integracion cross-domain: correlacionar patrones entre dominios (ej. brote de acne + mal sueno + estres elevado).

## Stack Tecnologico
- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend/DB**: Convex (real-time, agentes, cron jobs, file storage)
- **Auth**: Clerk (con webhook sync a Convex)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Agentes IA**: `@convex-dev/agents` + Vercel AI SDK
- **LLM**: Anthropic Claude (Sonnet 4.5 para orquestador, Haiku 4.5 para agentes simples)
- **Fechas**: date-fns
- **Formularios**: react-hook-form + zod

## Arquitectura de Agentes
Sistema multi-agente orquestado con patron **Orchestrator-Worker + Generator-Critic**.

### Los 8 agentes
| Agente | Funcion | Modelo |
|--------|---------|--------|
| Orquestador | Clasifica intencion, enruta a especialistas | Sonnet 4.5 |
| Skincare | Analisis de piel, rutinas personalizadas | Haiku 4.5 |
| Nutricion | Planes alimenticios, tracking de comidas | Haiku 4.5 |
| Fitness | Planes de entrenamiento, coaching | Haiku 4.5 |
| Salud Mental | Check-ins emocionales, tecnicas CBT | Haiku 4.5 |
| Sueno | Analisis de calidad de sueno | Haiku 4.5 |
| Habitos/Hidratacion | Tracking de agua, gestion de habitos | Haiku 4.5 |
| Seguridad (Safety) | Revisa 100% de outputs, detecta crisis | Haiku 4.5 |

### Flujo de interaccion
```
Usuario -> Orquestador -> Agente(s) especialista(s) -> Agente Seguridad -> Usuario
```

### Modelos LLM
- Orquestador: `anthropic("claude-sonnet-4-5-20250929")`
- Agentes simples: `anthropic("claude-haiku-4-5-20251001")`

## Idioma
- UI y respuestas de IA: **Espanol**
- Codigo (variables, funciones): Ingles
- System prompts: Espanol

## Patron de Streaming
Async delta streaming de Convex:
```
mutation (guarda mensaje) -> ctx.scheduler.runAfter(0, ...) -> internalAction (streamText con saveStreamDeltas)
```
Los deltas se persisten en la DB y se sincronizan via WebSocket.

## Schema de Base de Datos
Referencia: `convex/schema.ts`

10 tablas:
- `users` — Usuarios con preferencias y modulos activos
- `healthProfiles` — Perfil de salud (edad, peso, tipo de piel, etc.)
- `wellnessEntries` — Entradas polimorfica (mood, exercise, nutrition, sleep, water, skincare, weight, habit)
- `aiPlans` — Planes generados por IA (daily, meal, workout, skincare_routine, sleep_routine, weekly)
- `habits` — Habitos con streaks
- `progressPhotos` — Fotos de progreso (piel, cuerpo, comida)
- `goals` — Metas por categoria
- `notifications` — Notificaciones in-app
- `wellnessKnowledge` — Base de conocimiento para RAG (con vector index)

## Estructura del Proyecto
```
convex/
  schema.ts          — Schema de DB (no modificar sin plan)
  convex.config.ts   — Registro de componentes (agents)
  agents/            — Definiciones de agentes
  prompts/           — System prompts (fuente canonica, accesible desde Convex)
  tools/             — Herramientas para agentes
  functions/         — Funciones backend (queries, mutations)
  users.ts           — CRUD usuarios + getCurrentUser
  http.ts            — Webhooks (Clerk)
lib/
  prompts/           — Re-exports de convex/prompts/ (para uso en cliente)
  utils.ts           — cn() utility
app/
  (dashboard)/       — Rutas del dashboard (con sidebar)
  (auth)/            — Sign-in / Sign-up
components/
  ui/                — shadcn/ui components
```

## Plan Maestro
Referencia: `.claude/planes/PlanMaestro/PlanMaestro.md`

### Estado de Fases
- **Fase 0**: Completa (fundacion, auth, estructura, layout, testing base)
- **Fase 1**: En progreso (motor de IA y primer agente)
  - 1A: Infraestructura de agentes (en progreso)
  - 1B-1E: Pendientes
- **Fases 2-6**: Pendientes

## Convenciones de Git
- **NO** incluir `Co-Authored-By` en los commits

## Convenciones de Codigo
- Server Components por defecto, `"use client"` solo para interactividad
- Usar `useQuery` / `useMutation` de Convex para datos reactivos
- `cn()` de `lib/utils.ts` para combinar clases de Tailwind
- `date-fns` para manipulacion de fechas
- Validacion con `zod`
- Archivos de agentes en `convex/agents/`, tools en `convex/tools/`, prompts en `convex/prompts/` (re-exports en `lib/prompts/`)

## Guardrails de Seguridad
- **Nunca** diagnosticar condiciones medicas
- **Nunca** recomendar medicamentos especificos
- **Siempre** incluir disclaimer en respuestas de salud
- **Deteccion de crisis**: keywords + semantica -> derivar a lineas de ayuda (988, Crisis Text Line)
- **Disclosure IA**: el usuario siempre sabe que habla con IA
- **Safety Agent** revisa el 100% de las respuestas antes de entregarlas
