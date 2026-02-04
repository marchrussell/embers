# 🔗 Integração ClickUp MCP - Sistema Onion

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Estratégia Dual de Formatação](#-estratégia-dual-de-formatação)
- [Formatação de Descriptions](#-formatação-de-descriptions-markdown)
- [Formatação de Comments](#-formatação-de-comments-unicode)
- [Bulk Operations](#-bulk-operations)
- [Hierarquia de Tasks](#-hierarquia-de-tasks)
- [Checklists Nativos](#-checklists-nativos)
- [Auto-Update Patterns](#-auto-update-patterns)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

---

## 🎯 Visão Geral

O Sistema Onion integra-se profundamente com o **ClickUp MCP** (Model Context Protocol) para sincronização automática de tasks, subtasks, comments e progresso durante todo o ciclo de desenvolvimento.

### Capacidades Principais
- ✅ **Criação de Tasks** com decomposição hierárquica
- ✅ **Auto-Update** de status e progresso
- ✅ **Comentários Estruturados** com formatação visual
- ✅ **Bulk Operations** otimizadas para performance
- ✅ **Checklists Nativos** para tracking interativo
- ✅ **Phase-Subtask Mapping** automático

---

## 🎨 Estratégia Dual de Formatação

O Sistema Onion usa **duas estratégias distintas** de formatação dependendo do contexto:

### 📋 Task Descriptions (markdown_description)
**Quando:** Criar ou atualizar descrições de tasks/subtasks  
**Formato:** Markdown nativo do ClickUp  
**Comandos:** `create_task`, `update_task`

### 💬 Task Comments (commentText)
**Quando:** Adicionar comentários de progresso ou status  
**Formato:** Formatação visual Unicode  
**Comandos:** `create_task_comment`

---

## 📋 Formatação de Descriptions (Markdown)

### Quando Usar
- Descrições de tasks principais
- Descrições de subtasks
- Action items em descrição markdown
- Documentação técnica na task

### Sintaxe Suportada

#### Headers
```markdown
# Header 1
## Header 2
### Header 3
```

#### Listas
```markdown
- Item não ordenado
- Outro item
  - Sub-item

1. Item ordenado
2. Segundo item
```

#### Tabelas
```markdown
| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Valor 1  | Valor 2  | Valor 3  |
| Valor 4  | Valor 5  | Valor 6  |
```

#### Formatação de Texto
```markdown
**Negrito**
*Itálico*
`Código inline`
[Link](https://example.com)
```

#### Code Blocks
````markdown
```python
def hello_world():
    print("Hello, World!")
```
````

#### Checkboxes (Action Items)
```markdown
- [ ] Action item não completado
- [x] Action item completado
```

### Exemplo Completo de Description

```markdown
## 🎯 Objetivo
Implementar autenticação JWT com refresh tokens para melhorar segurança.

## 📚 Contexto Técnico
Sistema atual usa sessões server-side. Migração para JWT permite:
- Stateless authentication
- Melhor escalabilidade
- Suporte a mobile apps

## 🏗️ Arquitetura

### Componentes Afetados
| Componente | Mudança | Impacto |
|------------|---------|---------|
| Auth Service | Adicionar JWT | Alto |
| API Gateway | Validar tokens | Médio |
| Database | Armazenar refresh tokens | Baixo |

### Stack Tecnológico
- **JWT**: jsonwebtoken v9.0.0
- **Crypto**: bcrypt v5.1.0
- **Storage**: Redis para refresh tokens

## ✅ Critérios de Aceitação
- [ ] Usuário pode fazer login e receber JWT
- [ ] Token expira após 15 minutos
- [ ] Refresh token permite renovação
- [ ] Logout invalida refresh token
- [ ] Testes de segurança passam

## 🧪 Estratégia de Testes
- Unit tests para geração de tokens
- Integration tests para fluxo completo
- Security tests para vulnerabilidades
```

---

## 💬 Formatação de Comments (Unicode)

### Quando Usar
- Comentários de progresso
- Updates de status
- Início/fim de desenvolvimento
- Conclusão de fases
- Notificações de PR

### Caracteres Unicode Permitidos

#### Separadores
```
━━━━━━━━━━━━━━━━━━━━━━━━  (linha horizontal)
```

#### Bullets e Marcadores
```
▶  (seta para direita - itens principais)
∟  (canto - sub-itens)
◆  (diamante - destaque)
✅ (check verde - concluído)
⏰ (relógio - timestamp)
🎯 (alvo - próxima ação)
```

#### Emojis de Status
```
🚀 (foguete - início/lançamento)
🔧 (ferramenta - trabalho em progresso)
📋 (clipboard - lista/plano)
🏗️  (construção - arquitetura)
✅ (check - concluído)
⚠️  (aviso - atenção)
```

### Template de Comentário de Início

```
🚀 DESENVOLVIMENTO INICIADO

━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ SESSÃO ATIVADA:
   ▶ Branch: feature/jwt-authentication
   ▶ Sessão: .cursor/sessions/jwt-authentication/
   ▶ Arquitetura: Definida e validada ✅

📋 PLANO DE IMPLEMENTAÇÃO:
   ∟ Fase 1: Backend JWT Service (4-6h)
   ∟ Fase 2: API Integration (3-4h)
   ∟ Fase 3: Frontend Integration (2-3h)
   ∟ Fase 4: Testing & Security (2-3h)

🎯 STACK TECNOLÓGICO:
   ∟ jsonwebtoken v9.0.0
   ∟ bcrypt v5.1.0
   ∟ Redis para refresh tokens

🔧 DECISÕES ARQUITETURAIS:
   ∟ JWT em Authorization header (Bearer)
   ∟ Refresh tokens em httpOnly cookies
   ∟ Redis para blacklist de tokens
   ∟ Rotação automática de refresh tokens

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Iniciado: 2025-01-27 10:30 | 🎯 Próximo: Implementar Fase 1
```

### Template de Comentário de Progresso

```
🔧 PROGRESSO DE DESENVOLVIMENTO

━━━━━━━━━━━━━━━━━━━━━━━━

📋 FASE COMPLETADA:
   ▶ Fase 1: Backend JWT Service
   ▶ Arquivos modificados: 8 arquivos
   ▶ Funcionalidades: Token generation, validation, refresh
   ▶ Testes: 15 unit tests, 5 integration tests ✅

✅ DECISÕES TÉCNICAS:
   ∟ Usamos RS256 (assimétrico) para melhor segurança
   ∟ Tokens armazenados em Redis com TTL automático
   ∟ Implementado rate limiting em refresh endpoint
   ∟ Adicionado logging de eventos de autenticação

🚀 PRÓXIMA FASE:
   ▶ Fase 2: API Integration
   ▶ Estimativa: 3-4 horas
   ▶ Bloqueadores: Nenhum

📊 PROGRESSO GERAL: 25% completo (1/4 fases)

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Atualização: 2025-01-27 15:45 | 🎯 Próximo: Integrar com API Gateway
```

### Template de Comentário de PR

```
🚀 PULL REQUEST CREATED

━━━━━━━━━━━━━━━━━━━━━━━━

📋 CHANGES IMPLEMENTED:
   ∟ JWT authentication service completo
   ∟ Refresh token mechanism
   ∟ Redis integration para token storage
   ∟ Security middleware para API routes
   ∟ Comprehensive test suite ✅

🔗 REVIEW DETAILS:
   ▶ PR: https://github.com/org/repo/pull/123
   ▶ Branch: feature/jwt-authentication
   ▶ Status: Ready for review
   ▶ Tests: All passing (45/45) ✅

✅ CHECKLIST:
   ◆ Code committed and pushed ✅
   ◆ Tests passing ✅
   ◆ Documentation updated ✅
   ◆ Task moved to "in progress" ✅
   ◆ Tag "under-review" added ✅

🤖 GITFLOW INTEGRATION:
   ∟ Auto-sync scheduled pós-merge
   ∟ GitFlow analysis will optimize cleanup
   ∟ Session archiving automático
   ∟ Performance-optimized operations

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Created: 2025-01-27 18:30 | 🎯 Next: Code review, merge, auto-sync
```

---

## ⚡ Bulk Operations

### Quando Usar
- Criar múltiplas subtasks de uma vez
- Atualizar status de várias tasks
- Operações em lote para performance

### Limitações Importantes

#### ❌ NÃO usar `create_bulk_tasks` para hierarquia
```javascript
// ERRADO - não suporta parent parameter
const subtasks = await create_bulk_tasks({
  tasks: [
    { name: "Subtask 1", parent: mainTaskId }, // ❌ parent ignorado!
    { name: "Subtask 2", parent: mainTaskId }
  ]
});
```

#### ✅ Usar `create_task` sequencial para hierarquia
```javascript
// CORRETO - cria hierarquia apropriada
// 1. Criar task principal
const mainTask = await create_task({
  name: "🎯 Feature Principal",
  listId: "901314121395",
  description: "Descrição completa..."
});

// 2. Criar subtasks com parent
const subtask1 = await create_task({
  name: "🔧 Subtask 1",
  listId: "901314121395",
  parent: mainTask.id,  // ✅ Hierarquia correta
  description: "..."
});

const subtask2 = await create_task({
  name: "🔧 Subtask 2",
  listId: "901314121395",
  parent: mainTask.id,  // ✅ Hierarquia correta
  description: "..."
});
```

### Quando usar `create_bulk_tasks`
✅ **Bom para:** Criar múltiplas tasks independentes no mesmo nível  
❌ **Ruim para:** Criar hierarquia (task → subtasks)

---

## 🏗️ Hierarquia de Tasks

### Estrutura de 3 Níveis

```
📋 TASK (Objetivo de Alto Nível)
├── 🔧 Subtask 1 (Componente Funcional)
│   ├── ✅ Checklist Item 1.1 (Ação Específica)
│   ├── ✅ Checklist Item 1.2
│   └── ✅ Checklist Item 1.3
└── 🔧 Subtask 2 (Componente Funcional)
    ├── ✅ Checklist Item 2.1
    └── ✅ Checklist Item 2.2
```

### Implementação Correta

```javascript
// PASSO 1: Criar Task Principal
const mainTask = await mcp_clickup_create_task({
  name: "🎯 Implementar Autenticação JWT",
  listId: "901314121395",
  markdown_description: `
## 🎯 Objetivo
Implementar autenticação JWT completa...

## ✅ Critérios de Aceitação
- [ ] Login retorna JWT válido
- [ ] Refresh token funciona
- [ ] Logout invalida tokens
  `,
  tags: ["feature", "security"],
  priority: "high"
});

// PASSO 2: Criar Subtasks com Parent
const subtask1 = await mcp_clickup_create_task({
  name: "🔧 Backend JWT Service",
  listId: "901314121395",
  parent: mainTask.id,  // ← CRITICAL
  markdown_description: `
## Objetivos
- Implementar geração de JWT
- Implementar validação de tokens
- Implementar refresh mechanism
  `,
  tags: ["subtask", "backend"]
});

const subtask2 = await mcp_clickup_create_task({
  name: "🔧 Frontend Integration",
  listId: "901314121395",
  parent: mainTask.id,  // ← CRITICAL
  markdown_description: `
## Objetivos
- Integrar login com JWT
- Implementar token storage
- Implementar auto-refresh
  `,
  tags: ["subtask", "frontend"]
});

// PASSO 3: Adicionar Comentário de Setup
await mcp_clickup_create_task_comment({
  task_id: mainTask.id,
  comment_text: `
🚀 TASK SETUP COMPLETO

━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTRUTURA CRIADA:
   ▶ Task Principal: ${mainTask.id}
   ▶ Subtasks: 2 componentes funcionais
   ▶ Total Estimate: 13-17 horas

🏗️ AMBIENTE PREPARADO:
   ▶ Branch: feature/jwt-authentication ✅
   ▶ Session: .cursor/sessions/jwt-authentication/ ✅
   ▶ Docs: Architecture + Implementation ✅

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Created: ${new Date().toISOString()} | 🎯 Next: /engineer/start
  `
});
```

---

## ✅ Checklists Nativos

### Visão Geral
O ClickUp suporta **checklists nativos** que são diferentes de checkboxes em markdown. Checklists nativos oferecem:
- ✅ Tracking interativo (resolved/unresolved)
- ✅ Progresso visual automático
- ✅ Notificações de conclusão
- ✅ API para leitura de status

### Estrutura Híbrida

O Sistema Onion suporta **estrutura híbrida**:
1. **Markdown checkboxes** na descrição (documentação)
2. **Checklists nativos** para tracking interativo

### Leitura de Checklists

```javascript
// Ler task com checklists
const task = await mcp_clickup_get_task({
  task_id: "86acu8pdk",
  subtasks: true  // Incluir subtasks e seus checklists
});

// Analisar checklists
task.checklists.forEach(checklist => {
  console.log(`Checklist: ${checklist.name}`);
  console.log(`Progress: ${checklist.resolved}/${checklist.unresolved + checklist.resolved}`);
  
  checklist.items.forEach(item => {
    console.log(`  ${item.resolved ? '✅' : '⬜'} ${item.name}`);
  });
});
```

### Monitoramento de Progresso

```javascript
// Calcular progresso baseado em checklists
function calculateProgress(task) {
  let totalItems = 0;
  let resolvedItems = 0;
  
  task.checklists.forEach(checklist => {
    totalItems += checklist.unresolved + checklist.resolved;
    resolvedItems += checklist.resolved;
  });
  
  return totalItems > 0 ? (resolvedItems / totalItems * 100).toFixed(1) : 0;
}

const progress = calculateProgress(task);
console.log(`Progresso: ${progress}%`);
```

---

## 🔄 Auto-Update Patterns

### Pattern 1: Início de Desenvolvimento (`/engineer/start`)

```javascript
// 1. Ler task do ClickUp
const task = await mcp_clickup_get_task({
  task_id: taskId,
  subtasks: true
});

// 2. Atualizar status
await mcp_clickup_update_task({
  task_id: taskId,
  status: "in progress"
});

// 3. Adicionar comentário de início
await mcp_clickup_create_task_comment({
  task_id: taskId,
  comment_text: `🚀 DESENVOLVIMENTO INICIADO...`
});

// 4. Criar mapeamento fase→subtask no context.md
const mapping = {
  "Phase 1": task.subtasks[0].id,
  "Phase 2": task.subtasks[1].id,
  "Phase 3": task.subtasks[2].id
};
```

### Pattern 2: Progresso de Fase (`/engineer/work`)

```javascript
// 1. Ler mapeamento do context.md
const phaseMapping = readPhaseMapping();

// 2. Identificar subtask correspondente
const subtaskId = phaseMapping[currentPhase];

// 3. Atualizar status da subtask
await mcp_clickup_update_task({
  task_id: subtaskId,
  status: "done"
});

// 4. Adicionar comentário de progresso
await mcp_clickup_create_task_comment({
  task_id: mainTaskId,
  comment_text: `🔧 PROGRESSO DE DESENVOLVIMENTO...`
});

// 5. Atualizar plan.md
updatePlanMd(currentPhase, "completed");
```

### Pattern 3: Pull Request (`/engineer/pr`)

```javascript
// 1. Atualizar status
await mcp_clickup_update_task({
  task_id: taskId,
  status: "in progress",
  tags: [...existingTags, "under-review"]
});

// 2. Adicionar comentário de PR
await mcp_clickup_create_task_comment({
  task_id: taskId,
  comment_text: `🚀 PULL REQUEST CREATED...`
});
```

### Pattern 4: Conclusão (`/git/sync`)

```javascript
// 1. Atualizar status final
await mcp_clickup_update_task({
  task_id: taskId,
  status: "done"
});

// 2. Adicionar comentário de conclusão
await mcp_clickup_create_task_comment({
  task_id: taskId,
  comment_text: `✅ FEATURE CONCLUÍDA E MERGED...`
});
```

---

## 🔧 Troubleshooting

### Problema: Hierarquia não criada corretamente

**Sintoma:** Subtasks aparecem como tasks independentes

**Causa:** Uso de `create_bulk_tasks` com `parent` parameter

**Solução:**
```javascript
// ❌ ERRADO
await create_bulk_tasks({
  tasks: [
    { name: "Sub 1", parent: mainId },
    { name: "Sub 2", parent: mainId }
  ]
});

// ✅ CORRETO
const sub1 = await create_task({
  name: "Sub 1",
  parent: mainId
});
const sub2 = await create_task({
  name: "Sub 2",
  parent: mainId
});
```

---

### Problema: Formatação quebrada em comments

**Sintoma:** Comentários aparecem com formatação estranha

**Causa:** Uso de markdown em vez de Unicode

**Solução:**
```javascript
// ❌ ERRADO - markdown em comments
comment_text: `
## Header
**Bold text**
- List item
`

// ✅ CORRETO - Unicode visual
comment_text: `
🚀 TÍTULO

━━━━━━━━━━━━━━━━━━

📋 SEÇÃO:
   ▶ Item principal
   ∟ Sub-item
`
```

---

### Problema: Auto-update não funciona

**Sintoma:** Status não atualiza automaticamente

**Diagnóstico:**
1. Verificar se `context.md` tem task-id correto
2. Verificar se mapeamento fase→subtask existe
3. Verificar permissões da API key

**Solução:**
```bash
# 1. Verificar context.md
cat .cursor/sessions/<feature-slug>/context.md | grep "Task ID"

# 2. Validar mapeamento
/engineer/validate-phase-sync

# 3. Testar conexão ClickUp
# (usar comando de teste do MCP)
```

---

### Problema: Checklists não aparecem

**Sintoma:** Checklists nativos não são lidos

**Causa:** Não usar `subtasks: true` no `get_task`

**Solução:**
```javascript
// ❌ ERRADO
const task = await get_task({ task_id: id });

// ✅ CORRETO
const task = await get_task({
  task_id: id,
  subtasks: true  // ← Inclui checklists
});
```

---

## 💡 Best Practices

### 1. Sempre use hierarquia correta
```javascript
// Sequência obrigatória:
// 1. Task principal
// 2. Subtasks com parent
// 3. Comentário de setup
```

### 2. Formatação apropriada por contexto
```javascript
// Descriptions: Markdown nativo
markdown_description: "## Header\n- List"

// Comments: Unicode visual
comment_text: "🚀 TÍTULO\n━━━━━━━━"
```

### 3. Sempre incluir timestamps
```javascript
comment_text: `
...
⏰ ${new Date().toISOString()} | 🎯 Next: ...
`
```

### 4. Mapeamento fase→subtask obrigatório
```markdown
## 📋 Phase-Subtask Mapping
- **Phase 1**: Backend → Subtask ID: 86acu8peq
- **Phase 2**: Frontend → Subtask ID: 86acu8pew
```

### 5. Validar estrutura após criação
```javascript
const task = await get_task({
  task_id: mainTaskId,
  subtasks: true
});

console.log(`Subtasks: ${task.subtasks.length}`);
// Esperado: >= 2
```

---

## 🔗 Documentos Relacionados

- [Guia de Comandos](./commands-guide.md) - Comandos que usam ClickUp
- [Fluxos de Engenharia](./engineering-flows.md) - Workflows com ClickUp
- [Exemplos Práticos](./practical-examples.md) - Casos de uso reais
- [Configuração Inicial](./getting-started.md) - Setup do ClickUp MCP

---

**Última atualização:** 2025-01-27  
**Versão:** 2.0  
**ClickUp MCP:** Integração completa

