# 📋 Estratégia de Critérios de Aceitação com Checkboxes Interativos

## 🎯 Objetivo

Usar **checkboxes markdown interativos** nativos do ClickUp para rastreamento visual de critérios de aceitação durante desenvolvimento.

---

## ✅ Como Funciona

### O ClickUp Renderiza Checkboxes Markdown

O ClickUp renderiza automaticamente checkboxes markdown em descriptions:

```markdown
- [ ] Critério não marcado
- [x] Critério marcado
```

**Resultado no ClickUp:**
- ☑️ Checkboxes **completamente interativos**
- ✅ Podem ser **marcados/desmarcados** dinamicamente
- 📊 **Rastreamento visual** de progresso
- 🎯 **Não requer API** especial, tudo via markdown

---

## 📝 Template de Critérios de Aceitação

### Para DESCRIPTIONS (Markdown com Checkboxes):

```markdown
## 🎯 Objetivo da Task

[DESCRIÇÃO_DETALHADA]

---

## 📋 Escopo de Implementação

### ✅ Funcionalidades:
- [x] Feature A - Implementada
- [ ] Feature B - Em progresso
- [ ] Feature C - Pendente

### 🔧 Arquitetura Técnica:
- [x] Componente X modificado
- [ ] Integration Y implementada

### 📊 Métricas Esperadas:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Performance | N/A | [VALOR] | ✅ |
| Coverage | N/A | [VALOR] | ✅ |

---

## ✅ Critérios de Aceitação

- [ ] Funcionalidade A implementada
- [ ] Testes passando com cobertura > 95%
- [ ] Documentation atualizada
- [ ] Performance dentro do target
- [ ] Code review aprovado

---

**🎯 Success Metric**: Todos os critérios marcados = Task completa  
**🕒 Timeline**: [PRAZO_ESTIMADO]
```

---

## 🔄 Fluxo de Atualização Durante Desenvolvimento

### Quando Usar `/engineer/work`:

```
Fase 1: Backend Implementation
├── ✅ COMPLETA
└── Marcar critérios relacionados como [x]

Fase 2: Frontend Integration
├── 🔄 EM PROGRESSO
└── Atualizar checkboxes conforme progresso

Fase 3: Testing & QA
├── ⏳ PENDENTE
└── Manter como [ ] até início
```

### Atualização Automática de Checkboxes:

**Quando uma fase é completada:**

1. **Identificar critérios relacionados** àquela fase
2. **Atualizar description** marcando checkboxes `[x]`
3. **Adicionar comentário** com progresso
4. **Manter sincronizado** conforme desenvolvimento

---

## 💻 Implementação em Comandos

### Em `/engineer/work`:

```typescript
// Quando uma fase é completada
async function completePhase(taskId, phaseName, criteria) {
  // 1. Buscar description atual
  const task = await mcp_clickup_get_task({ task_id: taskId });
  let description = task.description;
  
  // 2. Marcar critérios relacionados
  for (const criterion of criteria) {
    // Trocar "- [ ]" por "- [x]" para este critério
    description = description.replace(
      `- [ ] ${criterion}`,
      `- [x] ${criterion}`
    );
  }
  
  // 3. Atualizar description com checkboxes marcados
  await mcp_clickup_update_task({
    task_id: taskId,
    markdown_description: description
  });
  
  // 4. Adicionar comentário com progresso
  await mcp_clickup_create_task_comment({
    task_id: taskId,
    comment_text: `✅ Fase Completada: ${phaseName}
    
    Critérios de aceitação relacionados marcados como completos.
    Veja description para status visual completo.`
  });
}
```

### Em `/product/check-acceptance`:

```typescript
// Validar e marcar automaticamente critérios
async function checkAcceptanceCriteria(taskId) {
  // 1. Buscar task
  const task = await mcp_clickup_get_task({ task_id: taskId });
  
  // 2. Extrair critérios da description
  const criteria = extractCriteria(task.markdown_description);
  
  // 3. Validar cada um
  let updated = false;
  let newDescription = task.markdown_description;
  
  for (const criterion of criteria) {
    const isValid = await validateCriterion(criterion);
    
    if (isValid && criterion.status === 'unchecked') {
      // Marcar como válido
      newDescription = newDescription.replace(
        `- [ ] ${criterion.text}`,
        `- [x] ${criterion.text} ✅`
      );
      updated = true;
    }
  }
  
  // 4. Atualizar se houve mudanças
  if (updated) {
    await mcp_clickup_update_task({
      task_id: taskId,
      markdown_description: newDescription
    });
    
    console.log(`✅ ${countMarked(newDescription)}/${criteria.length} critérios marcados`);
  }
}
```

---

## 📊 Exemplo Prático

### Task Inicial (Todos pendentes):

```markdown
## ✅ Critérios de Aceitação

- [ ] Usuário consegue fazer login com email/senha
- [ ] JWT é gerado e retornado após login
- [ ] Refresh token permite renovação de sessão
- [ ] Rotas protegidas bloqueam acesso não autenticado
- [ ] Logout invalida tokens corretamente
- [ ] Testes de segurança passando
- [ ] Documentação de API atualizada
```

**Progresso Visual:** 0/7 completos

---

### Após Fase 1 (Backend completa):

```markdown
## ✅ Critérios de Aceitação

- [x] Usuário consegue fazer login com email/senha
- [x] JWT é gerado e retornado após login
- [x] Refresh token permite renovação de sessão
- [ ] Rotas protegidas bloqueam acesso não autenticado
- [x] Logout invalida tokens corretamente
- [ ] Testes de segurança passando
- [ ] Documentação de API atualizada
```

**Progresso Visual:** 4/7 completos

---

### Após Fase 2 (Frontend completa):

```markdown
## ✅ Critérios de Aceitação

- [x] Usuário consegue fazer login com email/senha
- [x] JWT é gerado e retornado após login
- [x] Refresh token permite renovação de sessão
- [x] Rotas protegidas bloqueam acesso não autenticado
- [x] Logout invalida tokens corretamente
- [ ] Testes de segurança passando
- [ ] Documentação de API atualizada
```

**Progresso Visual:** 5/7 completos

---

### Após Validação (Todos completos):

```markdown
## ✅ Critérios de Aceitação

- [x] Usuário consegue fazer login com email/senha ✅
- [x] JWT é gerado e retornado após login ✅
- [x] Refresh token permite renovação de sessão ✅
- [x] Rotas protegidas bloqueam acesso não autenticado ✅
- [x] Logout invalida tokens corretamente ✅
- [x] Testes de segurança passando ✅
- [x] Documentação de API atualizada ✅
```

**Progresso Visual:** 7/7 completos ✅

---

## 🎯 Benefícios

### Para Desenvolvedores:
- ✅ Visão clara do progresso
- ✅ Feedback imediato ao marcar
- ✅ Rastreamento de cada critério
- ✅ Fácil identificar o que falta

### Para Product Owners:
- ✅ Status visual na description
- ✅ Não precisa abrir comentários
- ✅ Fácil ver completude da task
- ✅ Melhor comunicação do progresso

### Para Code Reviewers:
- ✅ Validação rápida de requisitos
- ✅ Checklist de aceitar/rejeitar
- ✅ Rastreabilidade de critérios
- ✅ Menos discussão sobre requisitos

---

## 🔧 Boas Práticas

### ✅ Fazer:
- ✅ Manter checkboxes simples e diretos
- ✅ Descrever o que cada critério testa
- ✅ Usar linguagem clara e acionável
- ✅ Atualizar regularmente conforme progresso
- ✅ Marcar como completo quando realmente está pronto

### ❌ Evitar:
- ❌ Critérios muito vagos ou ambíguos
- ❌ Criterios não mensuráveis
- ❌ Marcar como completo sem validar
- ❌ Deixar checkboxes desatualizados
- ❌ Misturar com informações técnicas detalhadas

---

## 📚 Integração com Outros Comandos

### `/product/task`
- Cria task com template de checkboxes
- Descrição já inclui seção de critérios

### `/engineer/work`
- Marca checkboxes ao completar fases
- Atualiza description conforme progresso

### `/product/check-acceptance`
- Valida automaticamente critérios
- Marca como completo quando validado

### `/engineer/pr`
- Referencia checkboxes na PR
- Valida que todos estão marcados antes de merge

---

## 🚀 Próximos Passos

1. **Usar em `/product/task`** - Template com checkboxes
2. **Atualizar `/engineer/work`** - Marcar conforme completa
3. **Criar `/product/check-acceptance`** - Validação automática
4. **Testar com task real** - Validar fluxo completo

---

**Última atualização**: 2025-11-05  
**Status**: Documentado e pronto para implementação  
**Prioridade**: ALTA - Rastreamento visual de progresso

