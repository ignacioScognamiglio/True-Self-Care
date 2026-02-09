---
name: creating-convex-agents
description: Use when creating new AI agents with @convex-dev/agents for the True Self-Care project, defining agent tools, system prompts, or configuring agent behavior
---

# Creating Convex Agents — Best Practices

## 1. API Reference (`@convex-dev/agents`)

### Agent Constructor
```typescript
import { Agent } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "./_generated/api";

const myAgent = new Agent(components.agent, {
  name: "Agent Name",
  languageModel: anthropic("claude-haiku-4-5-20251001"),
  instructions: SYSTEM_PROMPT,
  tools: { tool1, tool2 },
  maxSteps: 5, // optional
});
```

### Creating Tools
```typescript
import { createTool } from "@convex-dev/agent";
import { z } from "zod";

const myTool = createTool({
  description: "Descripcion clara de lo que hace la herramienta",
  args: z.object({
    param1: z.string().describe("Que es este parametro"),
    param2: z.number().optional(),
  }),
  handler: async (ctx, args) => {
    // ctx includes: agent, userId, threadId, messageId, runQuery, runMutation, runAction
    const data = await ctx.runQuery(internal.myModule.myQuery, { id: args.param1 });
    return data;
  },
});
```

### Thread Management
```typescript
// Create a thread
const { threadId } = await agent.createThread(ctx, {
  userId: "user_id",
  title: "Thread title",
});

// Stream text response
await agent.streamText(
  ctx,
  { threadId },
  { prompt: "User message" },
  { saveStreamDeltas: true }
);

// Generate text (non-streaming)
const result = await agent.generateText(
  ctx,
  { threadId },
  { prompt: "User message" }
);
```

### Messages
```typescript
import { listMessages } from "@convex-dev/agent";

// List messages in a thread
const messages = await listMessages(ctx, components.agent, {
  threadId,
  paginationOpts: { numItems: 50, cursor: null },
});
```

### React Hooks
```typescript
import { useUIMessages, SmoothText, optimisticallySendMessage } from "@convex-dev/agent/react";
```

## 2. Patrones Arquitectonicos de Agentes

### Orchestrator-Worker
El orquestador clasifica la intencion del usuario y enruta al agente especialista correcto. No hace el trabajo — delega.

```
Usuario -> Orquestador -> Agente Skincare (si es sobre piel)
                       -> Agente Nutricion (si es sobre comida)
                       -> Agente Habitos (si es sobre habitos/agua)
```

### Generator-Critic
Cada respuesta generada por un agente especialista pasa por el Safety Agent antes de llegar al usuario. El Safety Agent puede:
- Aprobar la respuesta tal cual
- Inyectar disclaimers
- Bloquear la respuesta si detecta riesgo
- Activar protocolo de crisis

### Tool Minimalism
Cada agente solo tiene acceso a las herramientas que necesita. El agente de habitos no necesita `analyzeSkinImage`. Esto reduce errores y mejora el rendimiento.

### Execution Phases
Para tareas complejas: Research -> Plan -> Execute -> Verify.

## 3. Mejores Practicas

### System Prompts
- Claros y especificos, no genericos
- Siempre en espanol
- Definir rol, capacidades, limitaciones y tono
- Incluir guardrails de seguridad en cada prompt
- Evitar instrucciones contradictorias

### Especializacion
- Agentes enfocados > agentes generalistas
- Cada agente es experto en un dominio
- Mejor un agente que hace bien una cosa que uno que hace todo regular

### Seguridad en Capas
- Safety Agent revisa el 100% de outputs
- Guardrails hard-coded (no solo en prompts)
- Deteccion de crisis con keywords + analisis semantico
- Disclaimers automaticos en respuestas de salud

### Model Routing
- Sonnet 4.5 (`claude-sonnet-4-5-20250929`): orquestador, decisiones criticas, analisis complejo
- Haiku 4.5 (`claude-haiku-4-5-20251001`): agentes especialistas, tareas simples, alta velocidad

### Error Handling
- Nunca dejar al usuario sin respuesta
- Si un agente falla, el orquestador da una respuesta fallback
- Log de errores para debugging

### Streaming Async
Para UX fluida, usar el patron de streaming de Convex:
```typescript
// En una mutation:
await ctx.scheduler.runAfter(0, internal.agents.myAction, { threadId, prompt });

// En la internalAction:
await agent.streamText(ctx, { threadId }, { prompt }, { saveStreamDeltas: true });
```

## 4. Convenciones de Este Proyecto

### Ubicacion de Archivos
- Agentes: `convex/agents/{nombre}.ts`
- Tools: `convex/tools/{nombre}Tools.ts`
- System prompts: `convex/prompts/{nombre}.ts` (fuente canonica, dentro del bundle de Convex)
- Re-exports para cliente: `lib/prompts/{nombre}.ts`
- Funciones backend: `convex/functions/{nombre}.ts`

### Idioma
- System prompts: espanol
- Variables y funciones: ingles
- Respuestas al usuario: espanol

### Patron de Streaming
```
mutation (guarda mensaje del usuario)
  -> ctx.scheduler.runAfter(0, internalAction)
    -> internalAction ejecuta agent.streamText con saveStreamDeltas: true
      -> deltas se persisten en DB
        -> cliente recibe deltas via WebSocket (useUIMessages)
```

### Acceso a Datos en Tools
Cada tool usa `ctx.runQuery` / `ctx.runMutation` con funciones internas:
```typescript
const getUserData = createTool({
  description: "Obtiene datos del usuario actual",
  args: z.object({}),
  handler: async (ctx, args) => {
    return await ctx.runQuery(internal.users.getCurrentUser);
  },
});
```

### Modelos
```typescript
import { anthropic } from "@ai-sdk/anthropic";

// Orquestador (decisiones criticas)
anthropic("claude-sonnet-4-5-20250929")

// Agentes especialistas (velocidad)
anthropic("claude-haiku-4-5-20251001")
```

## 5. Checklist para Nuevo Agente

- [ ] Definir system prompt en `convex/prompts/{nombre}.ts` (y re-export en `lib/prompts/{nombre}.ts`)
- [ ] Crear tools en `convex/tools/{nombre}Tools.ts`
- [ ] Definir agente en `convex/agents/{nombre}.ts`
- [ ] Crear funciones backend en `convex/functions/{nombre}.ts`
- [ ] Agregar al orquestador si necesita routing
- [ ] Verificar con `npx convex dev` (sin errores)
- [ ] Verificar TypeScript compila sin errores
