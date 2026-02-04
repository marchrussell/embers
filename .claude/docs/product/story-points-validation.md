# 🎲 Validação de Story Points no `/engineer/start`

Documentação sobre a validação automática de story points antes de iniciar desenvolvimento.

## 🎯 Objetivo

Garantir que tasks tenham estimativas de story points antes de iniciar desenvolvimento, melhorando:
- Planejamento de sprints
- Tracking de velocity
- Previsibilidade de entrega
- Consistência nas estimativas

## ⚡ Quando Ocorre

A validação acontece automaticamente no comando `/engineer/start` após:
1. Carregar task do gerenciador configurado
2. Ler custom field "Story Points"
3. Antes de iniciar análise e arquitetura

## 🔍 Tipos de Validação

### 1. Task Sem Estimativa

**Condição:** `storyPoints === null || storyPoints === 0 || storyPoints === undefined`

**Ação:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ATENÇÃO: TASK SEM ESTIMATIVA DE STORY POINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Task: [nome da task]
🎲 Story Points: Não estimado

💡 RECOMENDAÇÕES:
∟ Estimar antes de iniciar desenvolvimento
∟ Usar: /product/estimate "[nome da task]"
∟ Ou: @story-points-framework-specialist

⚠️ Continuar sem estimativa pode afetar:
   - Planejamento de sprint
   - Tracking de velocity
   - Previsibilidade de entrega

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Comportamento:**
- ⚠️ **Alerta** (não bloqueia)
- 💡 **Oferece** estimar agora
- ✅ **Permite** continuar sem estimativa (com aviso)

### 2. Task Identificada como Épico

**Condição:** `storyPoints > 13`

**Ação:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ALERTA: TASK IDENTIFICADA COMO ÉPICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Task: [nome da task]
🎲 Story Points: [X] pontos (> 13)

💡 RECOMENDAÇÕES:
∟ Considerar quebrar em múltiplas tasks menores
∟ Usar: /product/refine para detalhar requisitos
∟ Verificar se realmente precisa ser uma única task

⚠️ Tasks > 13 pontos têm:
   - Maior margem de erro na estimativa
   - Risco de não caber no sprint
   - Dificuldade de tracking de progresso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Comportamento:**
- ⚠️ **Alerta** sobre riscos
- 💡 **Sugere** quebrar task
- ❓ **Pergunta** se deseja continuar mesmo assim
- ✅ **Permite** continuar após confirmação

### 3. Task com Estimativa Válida

**Condição:** `storyPoints >= 1 && storyPoints <= 13`

**Ação:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VALIDAÇÃO DE ESTIMATIVA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Task: [nome da task]
🎲 Story Points: [X] pontos

✅ Estimativa válida para desenvolvimento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Comportamento:**
- ✅ **Confirma** estimativa válida
- 🚀 **Prossegue** normalmente

## 🔧 Implementação

### Código de Validação

```typescript
// No comando /engineer/start, após carregar task
const task = await taskManager.getTask(taskId);
const storyPoints = task.customFields?.find(f => f.name === 'Story Points')?.value;

if (!storyPoints || storyPoints === 0) {
  // Validação 1: Sem estimativa
  await showWarningNoEstimate(task);
  const shouldEstimate = await askUser('Deseja estimar story points agora? (s/n)');
  if (shouldEstimate) {
    await invokeStoryPointsEstimation(task);
  }
} else if (storyPoints > 13) {
  // Validação 2: Épico
  await showWarningEpic(task, storyPoints);
  const shouldContinue = await askUser('Deseja continuar mesmo assim? (s/n)');
  if (!shouldContinue) {
    console.log('💡 Sugestão: Use /product/refine para detalhar e quebrar a task');
    return;
  }
} else {
  // Validação 3: OK
  await showSuccessEstimate(task, storyPoints);
}
```

### Integração com Agente

```typescript
async function invokeStoryPointsEstimation(task: Task) {
  // Invocar agente de estimativa
  const estimate = await invokeAgent('story-points-framework-specialist', {
    taskDescription: task.name + '\n' + task.description,
    assigneeLevel: task.assignee?.level || 'pleno'
  });
  
  // Atualizar task com estimativa
  await taskManager.updateTask(task.id, {
    customFields: {
      'Story Points': estimate.points
    }
  });
  
  // Adicionar comentário
  await taskManager.addComment(task.id, formatEstimateComment(estimate));
}
```

## 📊 Fluxo Completo

```mermaid
graph TD
    A[/engineer/start] --> B[Carregar Task]
    B --> C{Task tem Story Points?}
    C -->|Não| D[Alerta: Sem Estimativa]
    D --> E{Deseja estimar?}
    E -->|Sim| F[Invocar @story-points-framework-specialist]
    E -->|Não| G[Continuar com aviso]
    F --> H[Atualizar Task]
    H --> I[Prosseguir]
    C -->|Sim| J{Story Points > 13?}
    J -->|Sim| K[Alerta: Épico]
    K --> L{Deseja continuar?}
    L -->|Sim| I
    L -->|Não| M[Sugerir refinement]
    J -->|Não| N[Validar Estimativa]
    N --> I
    G --> I
```

## ⚠️ Regras Importantes

### Não Bloqueia Desenvolvimento

**Princípio:** Validação é **informativa**, não bloqueante.

- ⚠️ Alerta sobre problemas
- 💡 Oferece soluções
- ✅ Permite continuar após confirmação

### Estimativa Opcional mas Recomendada

**Princípio:** Estimativas melhoram planejamento, mas não são obrigatórias.

- Tasks sem estimativa podem ser desenvolvidas
- Sistema alerta sobre impacto
- Usuário decide se estima ou não

### Épicos Podem Ser Desenvolvidos

**Princípio:** Tasks grandes podem existir, mas devem ser conscientes.

- Sistema alerta sobre riscos
- Sugere quebra quando apropriado
- Permite continuar após confirmação

## 🔗 Comandos Relacionados

- `/product/estimate` - Estimar task manualmente
- `/product/refine` - Refinar e recalcular estimativa
- `/product/task` - Criar task com estimativa automática

## 📚 Referências

- **Agente:** @story-points-framework-specialist
- **Framework:** `docs/knowbase/frameworks/framework_story_points.md`
- **Integração:** `.cursor/docs/product/story-points-integration.md`

---

**Versão:** 3.0.0  
**Última atualização:** 2025-11-24  
**Mantido por:** Sistema Onion

