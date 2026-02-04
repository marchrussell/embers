---
name: work
description: |
  Continuar trabalho em feature ativa. Lê sessão e identifica próxima fase.
  Atualiza progresso via Task Manager abstraction.
model: sonnet
category: engineer
tags: [development, workflow, session]
version: "3.0.0"
updated: "2025-11-24"
---

# Engineer Work

Estamos atualmente trabalhando em uma funcionalidade que está especificada na seguinte pasta:

<folder>
#$ARGUMENTS
</folder>

Para trabalhar nisso, você deve:

- Ler todos os arquivos markdown na pasta
- Revisar o arquivo plan.md e identificar qual Fase está atualmente em progresso
- Apresentar ao usuário um plano para abordar a próxima fase

## 🔄 **Auto-Update Task Manager**

Este comando **automaticamente atualiza** a task durante desenvolvimento usando a abstração:

```typescript
// Detectar provedor e obter adapter
const config = detectProvider();
const taskManager = getTaskManager();

if (!taskManager.isConfigured) {
  console.warn('⚠️ Modo offline - progresso não será sincronizado');
}
```

### **✅ Updates Automáticos A CADA FASE:**
- **Comentário de progresso** quando fase é completada
- **SUBTASK STATUS UPDATE** - Atualiza status da subtask correspondente para "done"
- **Atualização do plan.md** com status e decisões
- **Progresso % estimado** baseado nas fases concluídas
- **Timestamp de atividade** para tracking temporal

### **🔗 CRITICAL: Phase→Subtask Mapping**
**OBRIGATÓRIO**: Quando uma fase é completada, o sistema deve:
1. **Identificar subtask correspondente** via mapeamento estabelecido no context.md
2. **Atualizar status da subtask** para "done" automaticamente
3. **Documentar conclusão** com timestamp e métricas da fase

### **💬 Estratégia DUAL de Comentários:**

Ao completar uma fase, o sistema automaticamente:

1. **Cria comentário DETALHADO na SUBTASK**
2. **Cria comentário RESUMIDO na TASK PRINCIPAL**

### **📋 Identificação da Task:**
1. **Context.md**: Lê task-id do arquivo de contexto da sessão
2. **Sessão ativa**: Detecta automaticamente a sessão em `.cursor/sessions/`
3. **🆕 PHASE-SUBTASK MAPPING**: Lê mapeamento de context.md para correlacionar fases→subtasks

### **🗺️ SUBTASK MAPPING STRUCTURE (context.md):**
```markdown
## 📋 Phase-Subtask Mapping
- **Phase 1**: "Nome da Fase" → Subtask ID: [subtask-id-1]
- **Phase 2**: "Nome da Fase" → Subtask ID: [subtask-id-2]
```

### **⚡ AUTOMATIC EXECUTION (Via Abstração):**
Quando uma fase é marcada como "Completada ✅" no plan.md, o sistema deve **EXECUTAR NESTA ORDEM**:

```typescript
// 1. Obter task manager
const taskManager = getTaskManager();

if (taskManager.isConfigured) {
  // 2. Comentário DETALHADO na SUBTASK
  await taskManager.addComment(subtaskId, `
🔧 FASE COMPLETADA: ${phaseName}

━━━━━━━━━━━━━━

📁 ARQUIVOS MODIFICADOS:
${filesModified.map(f => `   ∟ ${f}`).join('\n')}

🔧 IMPLEMENTAÇÕES:
${implementations.map(impl => `   ▶ ${impl}`).join('\n')}

💡 DECISÕES TÉCNICAS:
${decisions.map(d => `   ∟ ${d}`).join('\n')}

🚀 PRÓXIMOS PASSOS:
   ∟ ${nextPhase}

━━━━━━━━━━━━━━

⏰ Completado: ${timestamp} | 🎯 Status: Done
  `);

  // 3. Atualizar STATUS da SUBTASK
  await taskManager.updateStatus(subtaskId, 'done');

  // 4. Comentário RESUMIDO na TASK PRINCIPAL
  await taskManager.addComment(mainTaskId, `
📝 PROGRESSO: Fase ${phaseNum}/${totalPhases} Completada

✅ ${phaseName} - Concluída
   ∟ Subtask: #${subtaskId}
   ∟ Detalhes: Ver comentário na subtask

🎯 Próximo: Fase ${phaseNum + 1}/${totalPhases} - ${nextPhaseName}

⏰ ${timestamp}
  `);
}
```

## Importante:

Quando você desenvolver o código para a fase atual, use os sub-agentes de desenvolvimento, code-review e teste quando apropriado para preservar o máximo possível do seu contexto.

Toda vez que completar uma fase do plano:
- **AUTO-UPDATE**: Adicione comentário de progresso via abstração
- **RASTREAMENTO**: Marque checkboxes na description correspondentes aos critérios completados
- Pause e peça ao usuário para validar seu código.
- Faça as mudanças necessárias até ser aprovado
- Atualize a fase correspondente no arquivo plan.md marcando o que foi feito e adicionando comentários úteis para o desenvolvedor que abordará as próximas fases, especialmente sobre questões, decisões, etc.
- Apenas inicie a próxima fase após o usuário concordar que você deve começar.

## 🔗 Referências

- Abstração: `.cursor/utils/task-manager/`
- Detector: `.cursor/utils/task-manager/detector.md`
- Factory: `.cursor/utils/task-manager/factory.md`
- Padrões de comentários: `common/prompts/clickup-patterns.md`

Agora, veja a fase atual de desenvolvimento e forneça um plano ao usuário sobre como abordá-la.
