# 📋 Validação de Critérios de Aceitação em Pre-PR

## 🎯 Objetivo

Garantir que **TODOS os critérios de aceitação foram atendidos** antes de abrir um Pull Request, validando automaticamente os checkboxes interativos da task ClickUp.

---

## ✅ Como Funciona

### Fluxo de Validação

```
1. Extrair critérios da description
   ↓
2. Contar checkboxes marcados vs total
   ↓
3. Gerar relatório de cobertura
   ↓
4. Decidir: PR pronto? Ou ajustes pendentes?
```

---

## 📊 Exemplo de Validação

### Description Original (Todos pendentes):
```markdown
## ✅ Critérios de Aceitação

- [ ] Usuário consegue fazer login com email/senha
- [ ] JWT é gerado e retornado após login
- [ ] Refresh token permite renovação de sessão
- [ ] Rotas protegidas bloqueam acesso não autenticado
- [ ] Logout invalida tokens corretamente
- [ ] Testes de segurança passando
- [ ] Documentação de API atualizada

Status: 0/7 critérios completados
```

### Durante o Desenvolvimento (Progresso):
```markdown
## ✅ Critérios de Aceitação

- [x] Usuário consegue fazer login com email/senha
- [x] JWT é gerado e retornado após login
- [x] Refresh token permite renovação de sessão
- [ ] Rotas protegidas bloqueam acesso não autenticado
- [x] Logout invalida tokens corretamente
- [ ] Testes de segurança passando
- [ ] Documentação de API atualizada

Status: 4/7 critérios completados ⚠️ (Bloqueado!)
```

### No Pre-PR (Todos completos):
```markdown
## ✅ Critérios de Aceitação

- [x] Usuário consegue fazer login com email/senha ✅
- [x] JWT é gerado e retornado após login ✅
- [x] Refresh token permite renovação de sessão ✅
- [x] Rotas protegidas bloqueam acesso não autenticado ✅
- [x] Logout invalida tokens corretamente ✅
- [x] Testes de segurança passando ✅
- [x] Documentação de API atualizada ✅

Status: 7/7 critérios completados ✅ PRONTO PARA PR
```

---

## 🔧 Algoritmo de Validação

### Pseudocódigo:

```typescript
async function validateAcceptanceCriteria(taskId) {
  // 1. Buscar task do ClickUp
  const task = await clickup_get_task({ task_id: taskId });
  
  // 2. Extrair checkboxes da description
  const description = task.markdown_description;
  const criteria = description.match(/- \[([ xX])\] (.+)/g) || [];
  
  // 3. Contar marcados vs total
  const checked = criteria.filter(c => c.includes('[x]') || c.includes('[X]')).length;
  const total = criteria.length;
  const coverage = (checked / total) * 100;
  
  // 4. Retornar relatório
  return {
    isComplete: checked === total,
    coverage: coverage,
    checked: checked,
    total: total,
    allCriteria: criteria.map(c => ({
      text: c.replace(/^- \[[xX ]\] /, ''),
      completed: c.includes('[x]') || c.includes('[X]')
    }))
  };
}
```

---

## 💬 Formato do Comentário de Validação

### Quando TODOS os critérios estão ✅:

```
🔍 PREPARAÇÃO PARA PULL REQUEST

━━━━━━━━━━━━

✅ CRITÉRIOS DE ACEITAÇÃO:
   ◆ [x] Todos os checkboxes marcados
   ◆ Total: 7/7 critérios completos ✅

✅ VERIFICAÇÕES TÉCNICAS:
   ◆ Meta-specs compliance: ✅
   ◆ Code review: ✅
   ◆ Documentation updated: ✅
   ◆ Tests coverage: ✅

📊 QUALIDADE DO CÓDIGO:
   ∟ Lint errors: 0 encontrados
   ∟ Test coverage: 98%
   ∟ Documentation: Atualizada

🚀 STATUS PARA PR:
   ∟ PRONTO PARA MERGE ✅

━━━━━━━━━━━━

⏰ Preparação: 2025-11-05 14:30 | 🎯 Próximo: Abrir Pull Request
```

### Quando FALTAM critérios ❌:

```
🔍 PREPARAÇÃO PARA PULL REQUEST - VALIDAÇÃO FALHOU

━━━━━━━━━━━━

❌ CRITÉRIOS DE ACEITAÇÃO INCOMPLETOS:
   ◆ Completos: 5/7 critérios (71%)
   ◆ Pendentes: 2 critérios

📋 CRITÉRIOS PENDENTES:
   ❌ Testes de segurança passando
   ❌ Documentação de API atualizada

🔧 AÇÕES NECESSÁRIAS:
   1. Implementar testes de segurança
   2. Completar documentação da API
   3. Marcar checkboxes no ClickUp
   4. Fazer commit + push
   5. Executar /engineer/pre-pr novamente

🚀 STATUS PARA PR:
   ∟ REQUER AJUSTES ⚠️ (Bloqueado até completos)

━━━━━━━━━━━━

⏰ Validação: 2025-11-05 14:30 | 🎯 Próximo: Completar critérios pendentes
```

---

## 📚 Integração com Workflow

### Fluxo Completo:

```
1. /engineer/work
   └── Implementar features
   └── Marcar critérios conforme completa
   
2. /engineer/pre-pr
   ├── Validar critérios de aceitação ← NOVO!
   ├── Se incompleto: ❌ Bloqueia e lista pendentes
   ├── Se completo: ✅ Continua com validações técnicas
   └── Adiciona comentário no ClickUp
   
3. /engineer/pr
   └── Abrir Pull Request (se pré-PR passou)
```

---

## 🎯 Checklist de Validação

### ✅ O que é Validado:

- [ ] Extração correta de checkboxes
- [ ] Contagem precisa de completos vs pendentes
- [ ] Percentual de cobertura calculado
- [ ] Identificação de critérios pendentes
- [ ] Comentário informativo no ClickUp
- [ ] Bloqueio de PR se critérios incompletos
- [ ] Atualização de tag ('ready-for-pr' ou 'needs-fixes')

### 🔍 Considerações Especiais:

- **Case-insensitive**: Aceita `[x]`, `[X]`, `[ ]`
- **Flexível**: Ignora espaços extras
- **Robusto**: Trata descriptions com múltiplas seções
- **Informativo**: Lista exatamente quais critérios faltam

---

## 💡 Boas Práticas

### ✅ Fazer:

- ✅ Manter critérios simples e acionáveis
- ✅ Usar linguagem clara e mensurável
- ✅ Marcar checkbox AO COMPLETAR, não antes
- ✅ Executar pre-pr ANTES de abrir PR
- ✅ Revisar lista de pendentes se falhar

### ❌ Evitar:

- ❌ Marcar checkbox sem implementar
- ❌ Adicionar critérios ambíguos ou não mensuráveis
- ❌ Forçar PR com critérios pendentes
- ❌ Deixar validação sem revisar

---

## 🚀 Próximos Passos

1. **Testar validação** com task real no ClickUp
2. **Implementar feedback** de usuários
3. **Integrar com CI/CD** para validação automática
4. **Criar dashboard** de status de critérios
5. **Documentar casos edge** (critérios aninhados, etc)

---

## 📊 Métricas de Sucesso

- ✅ **100% de tasks** têm critérios validados
- ✅ **0 PRs abertos** com critérios pendentes
- ✅ **95%+ cobertura** de critérios atendidos
- ✅ **Tempo reduzido** em validação manual
- ✅ **Qualidade melhorada** das implementações

---

**Última atualização**: 2025-11-05  
**Status**: Documentado e pronto para uso  
**Responsável**: Sistema Onion - Pre-PR Validator 🧅

