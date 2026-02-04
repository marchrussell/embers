# 📋 Padrões de Comentários ClickUp - Source of Truth

## 🎯 Objetivo

Centralizar **TODOS os 12 padrões de comentários** usados no Sistema Onion, garantindo consistência, legibilidade e reusabilidade em toda a integração ClickUp.

---

## 📑 Índice Rápido

1. [Padrão 1: Fase Completada](#padrão-1-fase-completada)
2. [Padrão 2: Progress Update](#padrão-2-progress-update)
3. [Padrão 3: PR Criada](#padrão-3-pr-criada)
4. [Padrão 4: PR Atualizada](#padrão-4-pr-atualizada)
5. [Padrão 5: Validação Pre-PR](#padrão-5-validação-pre-pr)
6. [Padrão 6: Subfase Completada](#padrão-6-subfase-completada)
7. [Padrão 7: Checkpoint/Validação](#padrão-7-checkpointvalidação-intermediária)
8. [Padrão 8: Task Arquivada](#padrão-8-task-arquivadafinalizada)
9. [Padrão 9: Desenvolvimento Iniciado](#padrão-9-desenvolvimento-iniciado)
10. [Padrão 10: Setup/Preparação](#padrão-10-setuppreparação-de-task)
11. [Padrão 11: Bloqueio/Aguardando](#padrão-11-bloqueioaguardando)
12. [Padrão 12: Reversão/Rollback](#padrão-12-reversãorollback)

---

## 🔧 Padrão 1: Fase Completada

### Quando Usar
Quando uma **fase completa de desenvolvimento** é finalizada. Fase = etapa maior do plano com múltiplas implementações.

### Contexto
- Trabalho significativo foi concluído
- Múltiplos arquivos foram modificados
- Testes foram adicionados
- Status pronto para próxima fase
- Tem detalhes técnicos importantes

### Template: Comentário DETALHADO (Subtask)

```
🔧 FASE COMPLETADA: [NOME_FASE]

━━━━━━━━━━━━━━

📁 ARQUIVOS MODIFICADOS:
   ∟ [arquivo1.ts]
   ∟ [arquivo2.tsx]
   ∟ [arquivo3.spec.ts]
   ∟ ... e mais [N] arquivos

🔧 IMPLEMENTAÇÕES:
   ▶ [Implementação 1 - breve descrição]
   ▶ [Implementação 2 - breve descrição]
   ▶ [Implementação 3 - breve descrição]

✅ TESTES ADICIONADOS:
   ∟ [test-file-1.spec.ts] ([N] testes, cobertura X%)
   ∟ [test-file-2.spec.ts] ([N] testes, cobertura Y%)
   ∟ Cobertura Total: [X]%

💡 DECISÕES TÉCNICAS:
   ∟ [Decisão 1 e justificativa]
   ∟ [Decisão 2 e justificativa]
   ∟ [Versões de libs importantes]

🚀 PRÓXIMOS PASSOS:
   ∟ Fase [N+1]: [Nome Próxima Fase]
   ∟ [Ação específica 1]
   ∟ [Ação específica 2]

━━━━━━━━━━━━━━

⏰ Completado: [TIMESTAMP] | 🎯 Status: Done
```

### Template: Comentário RESUMIDO (Task Principal)

```
📝 PROGRESSO: Fase [N]/[TOTAL] Completada

✅ [NOME_FASE] - Concluída
   ∟ Subtask: #[SUBTASK_ID]
   ∟ Detalhes: Ver comentário na subtask

🎯 Próximo: Fase [N+1] - [NOME_PRÓXIMA_FASE]

⏰ [TIMESTAMP]
```

### Campos Variáveis

| Campo | Exemplo | Tipo |
|-------|---------|------|
| NOME_FASE | "Backend Implementation" | string |
| arquivo1, arquivo2... | "src/auth/service.ts" | file paths |
| Implementação 1-N | "JWT token generation" | string |
| N testes | "12" | number |
| [X]% | "95%" | percentage |
| TIMESTAMP | "2025-11-05 16:45" | datetime |
| NOME_PRÓXIMA_FASE | "Frontend Integration" | string |
| SUBTASK_ID | "86abc123" | ID |

### Exemplo Prático

```
🔧 FASE COMPLETADA: Backend Implementation

━━━━━━━━━━━━━━

📁 ARQUIVOS MODIFICADOS:
   ∟ src/services/auth.service.ts
   ∟ src/controllers/auth.controller.ts
   ∟ src/middleware/jwt.middleware.ts
   ∟ src/models/user.model.ts
   ∟ src/routes/auth.routes.ts

🔧 IMPLEMENTAÇÕES:
   ▶ JWT generation com expiração configurável
   ▶ Refresh token mechanism
   ▶ Password hashing com bcrypt (rounds: 10)
   ▶ Error handling centralizado
   ▶ Rate limiting para endpoints

✅ TESTES ADICIONADOS:
   ∟ auth.service.spec.ts (12 testes, 95%)
   ∟ auth.controller.spec.ts (8 testes, 93%)
   ∟ jwt.middleware.spec.ts (6 testes, 97%)
   ∟ Cobertura Total: 95%

💡 DECISÕES TÉCNICAS:
   ∟ Usamos jsonwebtoken v9.0.0 (mais recente e segura)
   ∟ Access token: 15min, Refresh: 7 dias
   ∟ Bcrypt rounds: 10 (balanceamento perf/segurança)
   ∟ Rate limit: 5 tentativas/15min por IP

🚀 PRÓXIMOS PASSOS:
   ∟ Fase 2: Frontend Integration
   ∟ Criar AuthContext no React
   ∟ Implementar token storage seguro (localStorage com encryption)

━━━━━━━━━━━━━━

⏰ Completado: 2025-11-05 16:45 | 🎯 Status: Done
```

---

## 📝 Padrão 2: Progress Update

### Quando Usar
Atualizar **status executivo da task principal** sobre progresso geral. Resumo para stakeholders que não querem detalhes técnicos.

### Contexto
- Fase foi completada
- Precisa reportar progresso geral
- Audiência: Product Owners, Stakeholders
- Deve ser breve e objetivo

### Template

```
📝 PROGRESSO: Fase [N]/[TOTAL] Completada

✅ [NOME_FASE] - Concluída
   ∟ Subtask: #[SUBTASK_ID]
   ∟ Detalhes: Ver comentário na subtask

🎯 Próximo: Fase [N+1] - [NOME_PRÓXIMA_FASE]
   ∟ Estimativa: [HORAS] horas

⏰ [TIMESTAMP] | 📊 Progresso: [N]/[TOTAL] = X%
```

### Exemplo Prático

```
📝 PROGRESSO: Fase 1/4 Completada

✅ Backend Implementation - Concluída
   ∟ Subtask: #86abc123
   ∟ Detalhes: Ver comentário na subtask

🎯 Próximo: Fase 2/4 - Frontend Integration
   ∟ Estimativa: 2 horas

⏰ 2025-11-05 16:45 | 📊 Progresso: 1/4 = 25%
```

---

## 🚀 Padrão 3: PR Criada

### Quando Usar
Quando um **Pull Request é criado** no repositório. Documenta mudanças, status de testes.

### Contexto
- Feature branch foi feita push
- PR foi aberto no repositório
- Pronto para code review
- Todos testes passando

### Template

```
🚀 PULL REQUEST CRIADA

━━━━━━━━━━━━━━

📋 MUDANÇAS IMPLEMENTADAS:
   ∟ [Mudança 1]
   ∟ [Mudança 2]
   ∟ Code review solicitado

🔗 DETALHES DO REVIEW:
   ▶ PR: [URL_PR]
   ▶ Branch: [BRANCH_NAME]
   ▶ Status: Ready for review
   ▶ Testes: ✅ Todos passando

✅ VALIDAÇÕES COMPLETADAS:
   ◆ Code review request criado
   ◆ Testes passando (CI green)
   ◆ Documentação atualizada
   ◆ Meta-specs compliance: OK

━━━━━━━━━━━━━━

⏰ Criada: [TIMESTAMP] | 🎯 Próximo: Code review & merge
```

### Exemplo Prático

```
🚀 PULL REQUEST CRIADA

━━━━━━━━━━━━━━

📋 MUDANÇAS IMPLEMENTADAS:
   ∟ JWT authentication implementation
   ∟ Refresh token mechanism
   ∟ Request middleware for protected routes
   ∟ Comprehensive test suite (95% coverage)

🔗 DETALHES DO REVIEW:
   ▶ PR: https://github.com/project/pull/42
   ▶ Branch: feature/jwt-auth
   ▶ Status: Ready for review
   ▶ Testes: ✅ Todos passando (26 testes)

✅ VALIDAÇÕES COMPLETADAS:
   ◆ Code review request criado
   ◆ Testes passando (CI green) - 26/26
   ◆ Documentação atualizada
   ◆ Meta-specs compliance: OK

━━━━━━━━━━━━━━

⏰ Criada: 2025-11-05 17:30 | 🎯 Próximo: Code review & merge
```

---

## 🔄 Padrão 4: PR Atualizada

### Quando Usar
Quando **mudanças adicionais** são feitas no PR (após feedback do review ou melhorias).

### Contexto
- PR já existe
- Novos commits foram adicionados
- Correções de feedback ou enhancements
- Testes ainda passando

### Template

```
📝 PR ATUALIZADA - [TIPO_COMMIT]

━━━━━━━━━━━━━━

🔄 COMMITS ADICIONAIS REALIZADOS:
   ▶ Commit: [HASH]
   ▶ Tipo: [fix|feat|refactor]
   ▶ Arquivos: [N] modificados
   ▶ Linhas: +[X]/-[Y]

🛠️ MUDANÇAS IMPLEMENTADAS:
   ∟ [Mudança 1]
   ∟ [Mudança 2]
   ∟ [Mudança 3]

✅ STATUS:
   ∟ Testes: ✅ Passando
   ∟ CI: ✅ Green
   ∟ Review: Em progresso

━━━━━━━━━━━━━━

⏰ Atualizada: [TIMESTAMP] | 🚀 Status: Ready for merge
```

### Exemplo Prático

```
📝 PR ATUALIZADA - fix

━━━━━━━━━━━━━━

🔄 COMMITS ADICIONAIS REALIZADOS:
   ▶ Commit: 8a3f2b1c
   ▶ Tipo: fix
   ▶ Arquivos: 3 modificados
   ▶ Linhas: +15/-8

🛠️ MUDANÇAS IMPLEMENTADAS:
   ∟ Corrigido bug no refresh token expiration
   ∟ Melhorado error handling para edge cases
   ∟ Adicionados testes para nova validação

✅ STATUS:
   ∟ Testes: ✅ Passando (28/28)
   ∟ CI: ✅ Green
   ∟ Review: Em progresso (2 aprovações)

━━━━━━━━━━━━━━

⏰ Atualizada: 2025-11-05 18:15 | 🚀 Status: Ready for merge
```

---

## 🔍 Padrão 5: Validação Pre-PR

### Quando Usar
Quando validações **finais antes do PR** são executadas. Checklist de qualidade.

### Contexto
- Código pronto para review
- Validações técnicas feitas
- Critérios de aceitação verificados
- Antes de abrir PR

### Template

```
🔍 PREPARAÇÃO PARA PULL REQUEST

━━━━━━━━━━━━━━

✅ CRITÉRIOS DE ACEITAÇÃO:
   ◆ [x] Todos os checkboxes marcados
   ◆ Total: [X]/[Y] critérios completos

✅ VERIFICAÇÕES TÉCNICAS:
   ◆ Meta-specs compliance: [✅/❌]
   ◆ Code review: [✅/❌]
   ◆ Documentation: [✅/❌]
   ◆ Tests coverage: [✅/❌]

📊 QUALIDADE:
   ∟ Lint errors: [N]
   ∟ Test coverage: [X]%
   ∟ Documentation: [Updated/Pending]

🚀 STATUS:
   ∟ [PRONTO_PARA_PR/REQUER_AJUSTES]

━━━━━━━━━━━━━━

⏰ Validado: [TIMESTAMP] | 🎯 Próximo: Abrir Pull Request
```

### Exemplo Prático

```
🔍 PREPARAÇÃO PARA PULL REQUEST

━━━━━━━━━━━━━━

✅ CRITÉRIOS DE ACEITAÇÃO:
   ◆ [x] Todos os checkboxes marcados
   ◆ Total: 7/7 critérios completos ✅

✅ VERIFICAÇÕES TÉCNICAS:
   ◆ Meta-specs compliance: ✅
   ◆ Code review: ✅ (self-review completo)
   ◆ Documentation: ✅ (README atualizado)
   ◆ Tests coverage: ✅ (95%)

📊 QUALIDADE:
   ∟ Lint errors: 0
   ∟ Test coverage: 95%
   ∟ Documentation: Updated

🚀 STATUS:
   ∟ PRONTO PARA PR ✅

━━━━━━━━━━━━━━

⏰ Validado: 2025-11-05 16:30 | 🎯 Próximo: Abrir Pull Request
```

---

## 🔶 Padrão 6: Subfase Completada

### Quando Usar
Quando uma **parte/milestone de uma fase** é completada. Menor que fase completa.

### Contexto
- Dentro de uma fase maior
- Validação intermediária
- Progresso visível
- Pronto para próximo step

### Template

```
✅ SUBFASE COMPLETADA: [NOME_SUBFASE]

━━━━━━━━━━━━━━

📋 ATIVIDADES CONCLUÍDAS:
   ∟ [Atividade 1]
   ∟ [Atividade 2]
   ∟ [Atividade 3]

🎯 CHECKPOINT VALIDADO:
   ✅ Todos os testes passando
   ✅ Funcionalidade testada manualmente
   ✅ Pronto para próximo milestone

🚀 PRÓXIMO MILESTONE:
   ∟ [Próximo marco]

━━━━━━━━━━━━━━

⏰ Completado: [TIMESTAMP] | 📊 Fase: [N]/[TOTAL] subfases
```

---

## ✔️ Padrão 7: Checkpoint/Validação Intermediária

### Quando Usar
Validações **intermediárias durante desenvolvimento**. Não é conclusão, é ponto de controle.

### Contexto
- Durante implementação
- Validação de progresso
- Checkpoint de arquitetura
- Antes de continuar

### Template

```
✔️ CHECKPOINT: [NOME_CHECKPOINT]

━━━━━━━━━━━━━━

📋 VALIDAÇÕES REALIZADAS:
   ∟ [Validação 1] - OK
   ∟ [Validação 2] - OK
   ∟ [Validação 3] - OK

🎯 STATUS ATUAL:
   ✅ Tudo validado
   ✅ Pronto para próxima etapa

🚀 PRÓXIMA ETAPA:
   ∟ [Descrição]

━━━━━━━━━━━━━━

⏰ Checkpoint: [TIMESTAMP] | 📊 Progresso: [X%]
```

---

## 🏁 Padrão 8: Task Arquivada/Finalizada

### Quando Usar
Quando uma **task é finalizada e arquivada** completamente.

### Contexto
- Feature completamente pronta
- Merge feito
- Deploy validado
- Tudo pronto para arquivo

### Template

```
🏁 TASK FINALIZADA E ARQUIVADA

━━━━━━━━━━━━━━

✅ CONCLUSÃO:
   ✅ Feature 100% completa
   ✅ Testes passando
   ✅ Merge realizado
   ✅ Deploy validado

📊 SUMMARY:
   ∟ Total de horas: [X]h
   ∟ Commits: [N]
   ∟ Arquivos alterados: [N]
   ∟ Cobertura: [X]%

📚 DOCUMENTAÇÃO:
   ∟ README atualizado
   ∟ API docs atualizado
   ∟ Decisões registradas

🏆 RESULTADO:
   ∟ [Descrição do resultado]

━━━━━━━━━━━━━━

⏰ Finalizada: [TIMESTAMP] | 🎉 Status: Done & Archived
```

---

## 🚀 Padrão 9: Desenvolvimento Iniciado

### Quando Usar
Quando **desenvolvimento é iniciado** em uma nova task/sessão.

### Contexto
- Task recém-criada
- Desenvolvimento começando
- Sessão ativa
- Próxima etapa é implementação

### Template

```
🚀 DESENVOLVIMENTO INICIADO

━━━━━━━━━━━━━━

📋 SETUP EXECUTADO:
   ✅ Sessão criada: [SESSION_PATH]
   ✅ Branch criada: [BRANCH_NAME]
   ✅ Arquitetura definida
   ✅ Plano de fases pronto

🏗️ ESTRUTURA:
   ├── Fase 1: [Nome]
   ├── Fase 2: [Nome]
   └── Fase 3: [Nome]

📚 DOCUMENTAÇÃO:
   ∟ Architecture: Definida
   ∟ Plan: Pronto
   ∟ Context: Inicializado

🎯 PRÓXIMO PASSO:
   ∟ Iniciar Fase 1: [Nome]

━━━━━━━━━━━━━━

⏰ Iniciado: [TIMESTAMP] | 📊 Fases: [TOTAL]
```

---

## 📦 Padrão 10: Setup/Preparação de Task

### Quando Usar
Quando **preparação/setup inicial** de uma task é feito.

### Contexto
- Task recém-criada
- Setup inicial
- Antes de desenvolvimento
- Infraestrutura pronta

### Template

```
📦 SETUP DA TASK COMPLETADO

━━━━━━━━━━━━━━

✅ SETUP ITEMS:
   ✅ [Item 1] - Completo
   ✅ [Item 2] - Completo
   ✅ [Item 3] - Completo

📋 ESTRUTURA CRIADA:
   ├── session/
   ├── context.md
   ├── plan.md
   └── architecture.md

🎯 PRÓXIMO PASSO:
   ∟ [Próximo passo]

━━━━━━━━━━━━━━

⏰ Setup: [TIMESTAMP] | 🎯 Pronto para: Desenvolvimento
```

---

## 🚫 Padrão 11: Bloqueio/Aguardando

### Quando Usar
Quando desenvolvimento é **bloqueado por dependência externa** ou aguardando algo.

### Contexto
- Impedimento encontrado
- Aguardando feedback/ação externa
- Não pode continuar agora
- Precisa comunicar bloqueio

### Template

```
🚫 BLOQUEIO: [TIPO_BLOQUEIO]

━━━━━━━━━━━━━━

⚠️ IMPEDIMENTO:
   [Descrição do impedimento]

🔗 DEPENDÊNCIA:
   ∟ [Descrição da dependência]
   ∟ Status: Aguardando
   ∟ Estimativa de resolução: [Data/Hora]

💬 DETALHES:
   [Detalhes adicionais]

🚀 PRÓXIMO PASSO:
   ∟ Aguardando [Descrição]
   ∟ Retomar quando: [Condição]

━━━━━━━━━━━━━━

⏰ Bloqueado: [TIMESTAMP] | 🕐 Aguardando desde: [TEMPO]
```

---

## ⏮️ Padrão 12: Reversão/Rollback

### Quando Usar
Quando mudanças precisam ser **desfeitas/revertidas** por algum motivo.

### Contexto
- Problema encontrado
- Mudanças precisam ser revertidas
- Rollback para versão anterior
- Registo do ocorrido

### Template

```
⏮️ ROLLBACK REALIZADO

━━━━━━━━━━━━━━

🔄 MUDANÇAS REVERTIDAS:
   ∟ Revert commit: [HASH]
   ∟ Razão: [Motivo do rollback]

📋 O QUE FOI DESFEITO:
   ∟ [Mudança 1]
   ∟ [Mudança 2]
   ∟ [Mudança 3]

🔍 ANÁLISE:
   [Análise do problema que levou ao rollback]

✅ AÇÕES TOMADAS:
   ∟ [Ação 1]
   ∟ [Ação 2]

🚀 PRÓXIMO PASSO:
   ∟ [Plano para resolver e refazer]

━━━━━━━━━━━━━━

⏰ Revertido: [TIMESTAMP] | 🎯 Próximo: [Ação]
```

---

## 🎨 Visual Patterns Globais

### Separadores
```
━━━━━━━━━━━━━━  (14 caracteres - padrão para todos)
```

### Emojis Principais
- `🔧` - Implementação/Fase completada
- `📝` - Progresso/Update
- `🚀` - PR/Launch/Início
- `🔍` - Validação/Review
- `✅` - Completo/OK
- `⏰` - Timestamp/Tempo
- `📊` - Estatísticas/Progresso
- `🎯` - Próximo passo/Meta
- `🚫` - Bloqueio/Impedimento
- `⏮️` - Rollback/Reversão

### Estrutura Consistente
1. Emoji + Título
2. Separador
3. Seções com emojis
4. Informações estruturadas
5. Separador final
6. Timestamp + Próximo passo

---

## 🔗 Referências e Relacionamentos

### Padrões que funcionam em PARES:

**Par 1: Fase Completada**
- Padrão 1 (Detalhado) → Subtask
- Padrão 2 (Resumido) → Task Principal

**Par 2: Pull Request**
- Padrão 3 (Criada) → Início
- Padrão 4 (Atualizada) → Mudanças subsequentes

**Padrões Intermediários:**
- Padrão 6 (Subfase) - Dentro de Padrão 1
- Padrão 7 (Checkpoint) - Validação durante implementação

**Padrões Especiais:**
- Padrão 11 (Bloqueio) - Pode ocorrer em qualquer ponto
- Padrão 12 (Rollback) - Reação a problema

---

## 📚 Guia de Uso Rápido

| Situação | Padrão | Onde |
|----------|--------|------|
| Fase concluída | 1 | Subtask + Task |
| Update executivo | 2 | Task Principal |
| PR aberto | 3 | Task Principal |
| Mudanças no PR | 4 | Task Principal |
| Validação final | 5 | Task Principal |
| Milestone dentro de fase | 6 | Subtask |
| Validação intermediária | 7 | Task/Subtask |
| Task totalmente pronta | 8 | Task |
| Novo desenvolvimento | 9 | Task |
| Setup realizado | 10 | Task |
| Bloqueado | 11 | Task/Subtask |
| Reverter mudanças | 12 | Task/Subtask |

---

**Última atualização**: 2025-11-05  
**Status**: Documentado e pronto para uso  
**Total de Padrões**: 12  
**Responsável**: Sistema Onion - Pattern Specialist

