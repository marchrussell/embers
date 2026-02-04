# 💡 Exemplos Práticos - Sistema Onion

## 📋 Índice

- [Exemplo 1: Nova Feature do Zero](#-exemplo-1-nova-feature-do-zero)
- [Exemplo 2: Hotfix Urgente](#-exemplo-2-hotfix-urgente)
- [Exemplo 3: Release e Deploy](#-exemplo-3-release-e-deploy)
- [Exemplo 4: Gerar Documentação](#-exemplo-4-gerar-documentação)
- [Exemplo 5: Integração ClickUp Completa](#-exemplo-5-integração-clickup-completa)
- [Anti-Patterns](#-anti-patterns-o-que-não-fazer)
- [Troubleshooting Comum](#-troubleshooting-comum)

---

## 🚀 Exemplo 1: Nova Feature do Zero

### Cenário
Você precisa implementar um sistema completo de autenticação JWT com refresh tokens.

### Workflow Completo

#### Passo 1: Criar Task Estruturada
```bash
/product/task "Implementar autenticação JWT com refresh tokens e logout seguro"
```

**O que acontece:**
1. Sistema analisa README.md e docs/
2. Identifica como feature de segurança (complexidade média)
3. Apresenta plano para confirmação:

```markdown
## 🎯 PLANO DE TASK PROPOSTO

### **📋 Task Principal**
**Nome**: 🎯 Implementar Autenticação JWT
**Tipo**: Feature
**Complexidade**: Média
**Estimativa**: 13-17 horas

### **🏗️ Decomposição**
📋 Task Principal
├── 🔧 Backend JWT Service (4-6h)
│   ├── ✅ Implementar geração de JWT
│   ├── ✅ Implementar validação de tokens
│   └── ✅ Implementar refresh mechanism
├── 🔧 API Integration (3-4h)
│   ├── ✅ Middleware de autenticação
│   ├── ✅ Protected routes
│   └── ✅ Error handling
├── 🔧 Frontend Integration (3-4h)
│   ├── ✅ Login component
│   ├── ✅ Token storage
│   └── ✅ Auto-refresh
└── 🔧 Testing & Security (3-4h)
    ├── ✅ Unit tests
    ├── ✅ Integration tests
    └── ✅ Security audit

❓ **Este plano está correto? Posso proceder?** [Y/n]
```

4. Após confirmação (`y`):
   - Cria task no ClickUp (ID: `86xyz123`)
   - Cria 4 subtasks com parent relationship
   - Executa `/git/feature/start jwt-authentication`
   - Cria sessão `.cursor/sessions/jwt-authentication/`
   - Gera context files

**Saída:**
```
✅ TASK CRIADA COM DECOMPOSIÇÃO INTELIGENTE

📋 ClickUp: https://app.clickup.com/t/86xyz123
🌿 Branch: feature/jwt-authentication
📁 Sessão: .cursor/sessions/jwt-authentication/
```

---

#### Passo 2: Iniciar Desenvolvimento
```bash
/engineer/start jwt-authentication
```

**O que acontece:**
1. Valida branch (já criada pelo `/product/task`)
2. Lê task do ClickUp com subtasks
3. Faz 5-7 questões de clarificação:

```markdown
## 🔍 Questões de Clarificação

1. **Algoritmo JWT**: Prefere RS256 (assimétrico) ou HS256 (simétrico)?
   - Sugestão: RS256 para melhor segurança

2. **Storage de Refresh Tokens**: Redis ou PostgreSQL?
   - Sugestão: Redis para performance

3. **Expiração**: Qual TTL para access e refresh tokens?
   - Sugestão: 15min (access), 7 dias (refresh)

4. **Logout**: Blacklist de tokens ou invalidação de refresh?
   - Sugestão: Invalidação de refresh (mais simples)

5. **Rate Limiting**: Implementar em endpoints de auth?
   - Sugestão: Sim, 5 tentativas por minuto

❓ **Concordas com estas sugestões?** [Y/n]
```

4. Após confirmação, cria arquitetura:

**`architecture.md`:**
```markdown
# Arquitetura - Autenticação JWT

## Componentes

### JWT Service
- Geração de access tokens (RS256)
- Validação de tokens
- Refresh mechanism

### Auth Middleware
- Validação de tokens em requests
- Error handling
- Rate limiting

### Token Storage
- Redis para refresh tokens
- TTL automático
- Blacklist opcional

## Decisões Técnicas

### RS256 vs HS256
**Escolhido**: RS256
**Razão**: Melhor segurança, permite validação sem secret

### Redis vs PostgreSQL
**Escolhido**: Redis
**Razão**: Performance, TTL nativo, uso temporário

## Trade-offs

### Positivos
- ✅ Stateless authentication
- ✅ Escalabilidade
- ✅ Performance

### Negativos
- ⚠️ Complexidade inicial
- ⚠️ Dependência de Redis
```

5. Gera plano de implementação:

**`plan.md`:**
```markdown
# Plano - Autenticação JWT

## Fase 1: Backend JWT Service (4-6h) ⏳ IN PROGRESS
- [ ] Instalar dependências (jsonwebtoken, bcrypt)
- [ ] Criar JWTService class
- [ ] Implementar generateToken()
- [ ] Implementar validateToken()
- [ ] Implementar refreshToken()
- [ ] Unit tests

## Fase 2: API Integration (3-4h)
- [ ] Criar auth middleware
- [ ] Proteger routes
- [ ] Implementar error handling
- [ ] Rate limiting
- [ ] Integration tests

## Fase 3: Frontend Integration (3-4h)
- [ ] Login component
- [ ] Token storage (localStorage)
- [ ] Axios interceptors
- [ ] Auto-refresh logic
- [ ] E2E tests

## Fase 4: Testing & Security (3-4h)
- [ ] Security audit
- [ ] Penetration testing
- [ ] Performance testing
- [ ] Documentation
```

6. Atualiza ClickUp:
   - Status → "In Progress"
   - Comentário de início
   - Cria mapeamento fase→subtask

---

#### Passo 3: Implementar Fases
```bash
/engineer/work jwt-authentication
```

**Ciclo de Implementação:**

**Fase 1: Backend JWT Service**
```typescript
// Sistema implementa código
// src/services/jwt.service.ts
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

export class JWTService {
  private privateKey: string;
  private publicKey: string;

  constructor() {
    this.privateKey = readFileSync('keys/private.pem', 'utf8');
    this.publicKey = readFileSync('keys/public.pem', 'utf8');
  }

  generateToken(payload: any): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '15m'
    });
  }

  validateToken(token: string): any {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256']
    });
  }

  // ... mais código
}
```

**Após completar Fase 1:**
1. Sistema pausa e pede validação ao usuário
2. Usuário revisa e aprova (`y`)
3. Sistema automaticamente:
   - Atualiza subtask "Backend JWT Service" → "done"
   - Adiciona comentário no ClickUp:

```
🔧 PROGRESSO DE DESENVOLVIMENTO

━━━━━━━━━━━━━━━━━━━━━━━━

📋 FASE COMPLETADA:
   ▶ Fase 1: Backend JWT Service
   ▶ Arquivos modificados: 8 arquivos
   ▶ Funcionalidades: Token generation, validation, refresh
   ▶ Testes: 15 unit tests ✅

✅ DECISÕES TÉCNICAS:
   ∟ Usamos RS256 (assimétrico)
   ∟ Tokens em Redis com TTL
   ∟ Rate limiting implementado
   ∟ Logging de eventos

🚀 PRÓXIMA FASE:
   ▶ Fase 2: API Integration
   ▶ Estimativa: 3-4 horas

📊 PROGRESSO GERAL: 25% completo (1/4 fases)

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 2025-01-27 15:45 | 🎯 Próximo: Integrar com API
```

4. Atualiza `plan.md`:

```markdown
## Fase 1: Backend JWT Service (4-6h) ✅ COMPLETED
- [x] Instalar dependências
- [x] Criar JWTService class
- [x] Implementar generateToken()
- [x] Implementar validateToken()
- [x] Implementar refreshToken()
- [x] Unit tests (15 tests)

**Decisões:**
- Usamos RS256 para melhor segurança
- Redis para storage com TTL automático
- Rate limiting: 5 req/min

**Próxima Fase:** API Integration
```

**Repete para Fases 2, 3 e 4...**

---

#### Passo 4: Criar Pull Request
```bash
/engineer/pr
```

**O que acontece:**
1. Valida que todos os testes passam
2. Commit e push das mudanças
3. Atualiza ClickUp:
   - Status → "in progress"
   - Tag → "under-review"
   - Comentário com PR link
4. Abre PR no GitHub/GitLab
5. Aguarda code review
6. Aplica correções (se necessário)

---

#### Passo 5: Pós-Merge
```bash
# Automático após merge
/git/sync
```

**O que acontece:**
1. GitFlow analysis
2. Cleanup de branches
3. Session archiving
4. Atualiza ClickUp → "Done"
5. Sincroniza branches locais

---

### Resultado Final
- ✅ Feature completa implementada
- ✅ 4 subtasks concluídas
- ✅ Documentação gerada
- ✅ Testes passando
- ✅ ClickUp sincronizado
- ✅ Branch merged e limpa

---

## 🔥 Exemplo 2: Hotfix Urgente

### Cenário
Bug crítico em produção: timeout na API de pagamentos causando perda de transações.

### Workflow Rápido

#### Passo 1: Criar Hotfix
```bash
/git/hotfix/start "fix-payment-timeout"
```

**Saída:**
```
🔥 HOTFIX BRANCH CRIADA

Branch: hotfix/fix-payment-timeout
Base: main (produção)
Sessão: .cursor/sessions/fix-payment-timeout/
```

---

#### Passo 2: Análise e Implementação
```bash
/engineer/hotfix "fix-payment-timeout"
```

**Análise Rápida:**
```markdown
## 🐛 Análise do Bug

### Sintomas
- Timeout após 30s em /api/payments
- 15% das transações falhando
- Logs mostram query lenta

### Root Cause
- Query N+1 em relacionamentos
- Falta de índice em payments.user_id
- Connection pool saturado

### Fix
1. Adicionar índice
2. Otimizar query (eager loading)
3. Aumentar connection pool
```

**Implementação:**
```sql
-- migrations/add_payment_index.sql
CREATE INDEX idx_payments_user_id ON payments(user_id);
```

```typescript
// src/services/payment.service.ts
// ANTES (N+1 problem)
const payments = await Payment.findAll();
for (const payment of payments) {
  const user = await payment.getUser(); // N+1!
}

// DEPOIS (eager loading)
const payments = await Payment.findAll({
  include: [{ model: User }] // ✅ Single query
});
```

---

#### Passo 3: Testes Rápidos
```bash
# Testes de regressão
npm test -- payment.service.spec.ts

# Performance test
artillery quick --count 100 --num 10 http://localhost:3000/api/payments
```

---

#### Passo 4: PR Urgente
```bash
/engineer/pr
```

**Code Review Acelerado:**
- ✅ Testes passam
- ✅ Performance melhorou 10x
- ✅ Sem breaking changes

---

#### Passo 5: Merge e Deploy
```bash
# Após aprovação
/git/hotfix/finish
```

**O que acontece:**
1. Merge para `main` (produção)
2. Merge para `develop` (desenvolvimento)
3. Tag `hotfix/fix-payment-timeout`
4. Deploy automático para produção
5. Notificação da equipe

---

### Resultado
- ⏱️ **Tempo total:** 2 horas (análise + fix + deploy)
- ✅ **Bug resolvido** em produção
- ✅ **Zero downtime**
- ✅ **Documentado** para postmortem

---

## 📦 Exemplo 3: Release e Deploy

### Cenário
Preparar release v1.2.0 com 15 features e 8 bugfixes.

### Workflow

#### Passo 1: Criar Release Branch
```bash
/git/release/start "v1.2.0"
```

---

#### Passo 2: Ajustes Finais
```bash
# Atualizar CHANGELOG
# Atualizar versão
/engineer/bump minor

# Testes finais
npm run test:e2e
npm run test:integration
```

---

#### Passo 3: PR e Aprovação
```bash
/engineer/pr
```

**Checklist de Release:**
- ✅ Todos os testes passam
- ✅ CHANGELOG atualizado
- ✅ Versão atualizada
- ✅ Documentação atualizada
- ✅ Breaking changes documentadas

---

#### Passo 4: Merge e Tag
```bash
/git/release/finish
```

**O que acontece:**
1. Merge para `main`
2. Merge para `develop`
3. Tag `v1.2.0`
4. Deploy para produção
5. Release notes geradas

---

## 📚 Exemplo 4: Gerar Documentação

### Cenário
Projeto novo precisa de documentação completa.

### Workflow

#### Passo 1: Documentação de Negócio
```bash
/docs/build-business-docs
```

**Saída:**
```
docs/business-context/
├── vision.md           # Visão do produto
├── stakeholders.md     # Stakeholders e papéis
└── business-model.md   # Modelo de negócio
```

---

#### Passo 2: Documentação Técnica
```bash
/docs/build-tech-docs
```

**Saída:**
```
docs/technical-context/
├── architecture.md         # Arquitetura do sistema
├── technology-stack.md     # Stack tecnológico
└── constraints.md          # Restrições técnicas
```

---

#### Passo 3: Índice Navegável
```bash
/docs/build-index
```

**Saída:** `docs/index.md` com links para toda documentação

---

#### Passo 4: Validação
```bash
/docs/validate-docs
/docs/docs-health
```

**Validações:**
- ✅ Links funcionam
- ✅ Estrutura completa
- ✅ Sem seções vazias
- ✅ Formatação consistente

---

## 🔗 Exemplo 5: Integração ClickUp Completa

### Cenário
Usar ClickUp MCP para gerenciar todo o ciclo de vida de uma feature.

### Workflow Detalhado

#### Passo 1: Criar Task com Decomposição
```bash
/product/task "Sistema de notificações push com preferências de usuário"
```

**ClickUp Structure Criada:**
```
📋 Sistema de Notificações Push (86abc789)
├── 🔧 Backend Push Service (86abc790)
│   └── Checklists Nativos:
│       ✅ Implementar FCM integration
│       ✅ Criar notification queue
│       ✅ Implementar retry logic
├── 🔧 User Preferences API (86abc791)
│   └── Checklists Nativos:
│       ✅ CRUD de preferências
│       ✅ Validação de regras
│       ✅ Testes de API
└── 🔧 Frontend Integration (86abc792)
    └── Checklists Nativos:
        ✅ Settings UI
        ✅ Push permission
        ✅ Notification display
```

---

#### Passo 2: Monitorar Progresso
```bash
# Durante desenvolvimento
/engineer/work notificacoes-push

# Sistema automaticamente:
# - Lê checklists nativos
# - Calcula progresso (3/9 items = 33%)
# - Atualiza ClickUp em tempo real
```

---

#### Passo 3: Sincronização Automática
```javascript
// Sistema monitora checklists nativos
const task = await mcp_clickup_get_task({
  task_id: "86abc789",
  subtasks: true
});

// Calcula progresso
let totalItems = 0;
let resolvedItems = 0;

task.subtasks.forEach(subtask => {
  subtask.checklists.forEach(checklist => {
    totalItems += checklist.unresolved + checklist.resolved;
    resolvedItems += checklist.resolved;
  });
});

const progress = (resolvedItems / totalItems * 100).toFixed(1);
console.log(`Progresso: ${progress}%`); // 33.3%
```

---

#### Passo 4: Validação de Conclusão
```bash
/product/task-check 86abc789
```

**Validações:**
- ✅ Todos os checklists resolvidos
- ✅ Critérios de aceitação atendidos
- ✅ Testes passando
- ✅ Documentação completa

---

## ❌ Anti-Patterns: O Que NÃO Fazer

### Anti-Pattern 1: Pular Análise
```bash
# ❌ ERRADO
/engineer/work feature-x  # Sem /engineer/start antes!

# ✅ CORRETO
/engineer/start feature-x  # Análise primeiro
/engineer/work feature-x   # Depois implementação
```

---

### Anti-Pattern 2: Não Usar Hierarquia ClickUp
```javascript
// ❌ ERRADO - Subtasks independentes
await create_bulk_tasks({
  tasks: [
    { name: "Subtask 1" },
    { name: "Subtask 2" }
  ]
});

// ✅ CORRETO - Hierarquia apropriada
const main = await create_task({ name: "Main" });
await create_task({ name: "Sub 1", parent: main.id });
await create_task({ name: "Sub 2", parent: main.id });
```

---

### Anti-Pattern 3: Commits Grandes
```bash
# ❌ ERRADO
git add .
git commit -m "Implementei tudo"

# ✅ CORRETO
git add src/services/jwt.service.ts
git commit -m "feat: implement JWT generation"

git add src/middleware/auth.middleware.ts
git commit -m "feat: add auth middleware"
```

---

### Anti-Pattern 4: Pular Testes
```bash
# ❌ ERRADO
/engineer/pr  # Sem rodar testes!

# ✅ CORRETO
npm test
/engineer/pre-pr  # Validações
/engineer/pr      # Depois PR
```

---

## 🔧 Troubleshooting Comum

### Problema 1: Branch já existe
```bash
# Sintoma
Error: Branch feature/x already exists

# Solução
git checkout feature/x  # Usar existente
# OU
git branch -D feature/x  # Deletar e recriar
/git/feature/start "x"
```

---

### Problema 2: ClickUp não atualiza
```bash
# Diagnóstico
cat .cursor/sessions/<feature-slug>/context.md | grep "Task ID"

# Se task-id incorreto, corrigir manualmente
# Se correto, validar conexão MCP
```

---

### Problema 3: Sessão não encontrada
```bash
# Sintoma
/engineer/work x
Error: Session not found

# Solução
/engineer/start x  # Criar sessão
```

---

### Problema 4: Testes falhando
```bash
# Diagnóstico
npm test -- --verbose

# Correção
# 1. Corrigir testes
# 2. Rodar novamente
# 3. Só então fazer PR
```

---

## 🔗 Documentos Relacionados

- [Guia de Comandos](./commands-guide.md) - Todos os comandos
- [Fluxos de Engenharia](./engineering-flows.md) - Workflows detalhados
- [Integração ClickUp](./clickup-integration.md) - ClickUp MCP
- [Referência de Agentes](./agents-reference.md) - Agentes disponíveis
- [Configuração Inicial](./getting-started.md) - Setup do sistema

---

**Última atualização:** 2025-01-27  
**Versão:** 2.0  
**Exemplos:** 5 completos + anti-patterns + troubleshooting

