---
name: start
description: |
  Iniciar desenvolvimento de feature. Cria sessão e analisa tasks.
  Suporta múltiplos gerenciadores via TASK_MANAGER_PROVIDER.
model: sonnet
category: engineer
tags: [development, workflow, session]
version: "3.0.0"
updated: "2025-11-24"
---

# Engineer Start

Este é o comando para iniciar o desenvolvimento de uma funcionalidade.

## 🔧 Pré-requisito: Detectar Provedor

```typescript
// Consultar .cursor/utils/task-manager/detector.md
const config = detectProvider();
const taskManager = getTaskManager();

// Se tem task-id no input, validar compatibilidade
if (taskId) {
  const validation = validateProviderMatch(taskId, config.provider);
  if (!validation.valid) {
    console.warn(validation.warning);
    // Perguntar ao usuário como proceder
  }
}
```

## Configuração
- Se não estivermos em uma feature branch, peça permissão para criar uma
- Se estivermos em uma feature branch que corresponde ao nome da funcionalidade, estamos prontos.
- Certifique-se de que existe uma pasta .cursor/sessions/<feature-slug>
- Peça ao usuário o input para esta sessão (você receberá um ou mais tasks para trabalhar)

## Análise

Analise as tasks, pais e filhos se necessário, e construa um entendimento inicial do que precisa ser desenvolvido. 

### **📋 Análise via Task Manager:**
**IMPORTANTE**: Use a abstração para ler tasks independente do provedor:

```typescript
// Via abstração - funciona para qualquer provedor (ClickUp, Asana, Linear)
const task = await taskManager.getTask(taskId);
const subtasks = await taskManager.getSubtasks(taskId);

// Documentar no context.md
console.log(`Provider: ${task.provider}`);
console.log(`Task: ${task.name}`);
console.log(`URL: ${task.url}`);
```

### **🎲 Validação de Story Points (Opcional mas Recomendado):**

**CRÍTICO:** Antes de iniciar desenvolvimento, validar se task tem estimativa de story points:

```typescript
// Verificar se task tem story points estimados
const storyPoints = task.customFields?.find(f => f.name === 'Story Points')?.value;

if (!storyPoints || storyPoints === 0) {
  console.warn(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ATENÇÃO: TASK SEM ESTIMATIVA DE STORY POINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Task: ${task.name}
🎲 Story Points: Não estimado

💡 RECOMENDAÇÕES:
∟ Estimar antes de iniciar desenvolvimento
∟ Usar: /product/estimate "${task.name}"
∟ Ou: @story-points-framework-specialist

⚠️ Continuar sem estimativa pode afetar:
   - Planejamento de sprint
   - Tracking de velocity
   - Previsibilidade de entrega

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  // Perguntar ao usuário se deseja estimar agora
  const shouldEstimate = await askUser('Deseja estimar story points agora? (s/n)');
  
  if (shouldEstimate) {
    // Invocar agente de estimativa
    await invokeStoryPointsEstimation(task);
  }
} else if (storyPoints > 13) {
  console.warn(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ALERTA: TASK IDENTIFICADA COMO ÉPICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Task: ${task.name}
🎲 Story Points: ${storyPoints} pontos

💡 RECOMENDAÇÕES:
∟ Considerar quebrar em múltiplas tasks menores
∟ Usar: /product/refine para detalhar requisitos
∟ Verificar se realmente precisa ser uma única task

⚠️ Tasks > 13 pontos têm:
   - Maior margem de erro na estimativa
   - Risco de não caber no sprint
   - Dificuldade de tracking de progresso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  // Perguntar ao usuário se deseja continuar
  const shouldContinue = await askUser('Deseja continuar mesmo assim? (s/n)');
  if (!shouldContinue) {
    console.log('💡 Sugestão: Use /product/refine para detalhar e quebrar a task');
    return;
  }
} else {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VALIDAÇÃO DE ESTIMATIVA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Task: ${task.name}
🎲 Story Points: ${storyPoints} pontos

✅ Estimativa válida para desenvolvimento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
```

### **🔍 Validação de ID Incompatível:**
Se o task-id salvo for de um provedor diferente do configurado:

```
⚠️ INCOMPATIBILIDADE DETECTADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task ID: "86adfe9eb"
Provedor detectado: clickup
Provedor configurado: asana

💡 Ações sugeridas:
   1. Altere TASK_MANAGER_PROVIDER para 'clickup' no .env
   2. Ou limpe a sessão atual e crie uma nova task
   3. Execute /meta/setup-integration para reconfigurar
```

### **🔍 Questões de Análise:**
Pense cuidadosamente sobre o que é solicitado, certifique-se de entender exatamente:
    - Por que isso está sendo construído (contexto)
    - Qual é o resultado esperado para esta task? (objetivo)
    - Como deve ser construído, apenas direcionalmente, não em detalhes (abordagem)
    - Se requer o uso de novas APIs/ferramentas, você as entende?
    - Como deve ser testado?
    - Quais são as dependências?
    - Quais são as restrições?

Após refletir sobre essas questões, formule as 3-5 clarificações mais importantes necessárias para completar a tarefa. Pergunte essas questões ao humano, enquanto também fornece seu entendimento e sugestões.

Depois de obter as respostas do humano, considere se precisa fazer mais perguntas. Se sim, faça mais perguntas ao humano.

Uma vez que tenha um bom entendimento do que está sendo construído, salve-o no arquivo .cursor/sessions/<feature-slug>/context.md e peça ao humano para revisar.

Se o humano concordar com seu entendimento, você pode prosseguir para o próximo passo. Caso contrário, continue iterando juntos até obter aprovação explícita para seguir em frente.

Se algo que você discutiu aqui afeta o que foi escrito nos requisitos, peça permissão ao humano para editar esses requisitos e fazer ajustes.

## Arquitetura

Dado seu entendimento do que será construído, você agora procederá ao desenvolvimento da arquitetura da funcionalidade.

É aqui que você colocará seu chapéu de pensamento ultra e considerará o melhor caminho para construir a funcionalidade, considerando também os padrões e melhores práticas deste projeto.

Seu documento de arquitetura deve incluir:
    - Uma visão geral de alto nível do sistema (antes e depois da mudança)
    - Componentes afetados e suas relações, dependências
    - Padrões e melhores práticas que serão mantidos ou introduzidos
    - Dependências externas
    - Restrições e suposições
    - Trade-offs e alternativas
    - Lista dos principais arquivos a serem editados/criados

Uma vez que tenha um bom entendimento do que está sendo construído, salve-o no arquivo .cursor/sessions/<feature-slug>/architecture.md e peça ao humano para revisar.

## 🔄 **Auto-Update Task Manager**

Este comando **automaticamente atualiza** a task quando inicia:

### **✅ Updates Automáticos SEMPRE:**
```typescript
// Via abstração - funciona para qualquer provedor
if (taskManager.isConfigured && taskId) {
  // Atualizar status
  await taskManager.updateStatus(taskId, 'in_progress');
  
  // Adicionar comentário de início
  await taskManager.addComment(taskId, `
🚀 DESENVOLVIMENTO INICIADO

━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ SESSÃO ATIVADA:
   ▶ Branch: feature/[slug]
   ▶ Sessão: .cursor/sessions/[slug]/
   ▶ Provider: ${taskManager.provider}

📋 PLANO DE IMPLEMENTAÇÃO:
   ∟ Fase 1: [Descrição]
   ∟ Fase N: [Descrição]

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Iniciado: ${new Date().toISOString()}
  `);
}
```

### **📋 Identificação da Task:**
1. **Context.md**: Lê task-id do arquivo `.cursor/sessions/[slug]/context.md`
2. **Task Manager**: Usa `taskManager.getTask(taskId)` para estrutura completa
3. **🆕 PHASE-SUBTASK MAPPING**: Cria mapeamento automático fase→subtask no context.md
4. **Validação de ID**: Verifica compatibilidade do ID com provedor configurado
5. **Não encontrada**: Pergunta ao usuário se deve vincular a uma task específica

### **🗺️ OBRIGATÓRIO: Criar Phase-Subtask Mapping**
Quando subtasks existem, o sistema deve **automaticamente**:
1. **Detectar subtasks** via `taskManager.getSubtasks(taskId)`
2. **Correlacionar com fases** do plan.md (por ordem ou nome)
3. **Salvar mapeamento** no context.md para uso pelo `/engineer/work`
4. **Validar correlação** e alertar se houver mismatch

## Pesquisa

Se você não tem certeza de como uma biblioteca específica funciona, você pode usar Context7 e Perplexity para buscar informações sobre ela. Então, não tente adivinhar.

## 🔗 Referências

- Abstração: `.cursor/utils/task-manager/`
- Detector: `.cursor/utils/task-manager/detector.md`
- Factory: `.cursor/utils/task-manager/factory.md`

<feature-slug>
#$ARGUMENTS
</feature-slug>
