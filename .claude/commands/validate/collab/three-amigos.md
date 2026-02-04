---
name: three-amigos
description: |
  Facilita sessão Three Amigos (PO + Developer + QA) para refinement de stories.
  Gera agenda estruturada, template de ata e checklist de outputs.
model: sonnet

parameters:
  - name: story_id
    description: ID da story no task manager (ex: STORY-123, TASK-456)
    required: true
  - name: task_manager
    description: Task manager usado (clickup|jira|linear|asana). Default: clickup
    required: false
    default: clickup
  - name: generate_agenda
    description: Gerar agenda automaticamente antes da sessão
    required: false
    default: false

category: validate
tags:
  - collaboration
  - three-amigos
  - refinement
  - qa
  - product

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /validate/test-strategy/create
  - /product/refine
  - /product/task

related_agents:
  - test-engineer
  - product-agent
---

# 🤝 Three Amigos - Sessão de Colaboração

Facilita sessões Three Amigos (Product Owner + Developer + QA) para refinement de user stories, estimativa de pontos e definição de estratégia de testes.

## 🎯 Objetivo

Estruturar e facilitar sessões Three Amigos que resultem em:
- **User story refinada** com critérios de aceitação claros
- **Dev story points** estimados
- **QA story points** estimados  
- **Cross-testing points** identificados
- **Test strategy** definida
- **Riscos** identificados por todas as perspectivas
- **Definition of Done** acordada

## ⚡ Fluxo de Execução

### Passo 1: Preparação da Sessão

**SE** `{{generate_agenda}}` fornecido **OU** agenda não existe:

```bash
# 1. Buscar informações da story no task manager
# 2. Gerar agenda estruturada baseada no padrão Three Amigos
# 3. Criar template de ata
# 4. Preparar checklist de outputs
```

**Agenda Estruturada:**

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 THREE AMIGOS SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Story: {{story_id}}
👥 Participantes: PO + Developer + QA
⏱️  Duração: 60-90 minutos
📅 Data: [auto-detect]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 AGENDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ PERSPECTIVA PO (15-20min)
   ∟ Requisitos e valor de negócio
   ∟ Critérios de aceitação
   ∟ Dependências de produto
   ∟ Prioridade e contexto

2️⃣ PERSPECTIVA DEVELOPER (15-20min)
   ∟ Viabilidade técnica
   ∟ Riscos técnicos
   ∟ Estimativa Dev Story Points
   ∟ Dependências técnicas
   ∟ Arquitetura proposta

3️⃣ PERSPECTIVA QA (15-20min)
   ∟ Cenários de teste identificados
   ∟ Estimativa QA Story Points
   ∟ Riscos de qualidade
   ∟ Test strategy proposta
   ∟ Edge cases conhecidos

4️⃣ PERSPECTIVA CROSS (15-20min)
   ∟ Integrações necessárias
   ∟ Cross-testing points
   ∟ Dependencies entre equipes
   ∟ Definition of Done
   ∟ Riscos compartilhados

5️⃣ CONSOLIDAÇÃO (10-15min)
   ∟ Alinhamento final
   ∟ Story refinada
   ∟ Pontos acordados
   ∟ Próximos passos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**SENÃO:**

```bash
# Usar agenda existente ou criar manualmente
```

### Passo 2: Buscar Contexto da Story

**SE** `{{task_manager}}` = `clickup`:

```bash
# Usar ClickUp MCP para buscar:
# - Detalhes da task/story
# - Descrição atual
# - Critérios de aceitação existentes
# - Subtasks relacionadas
# - Comentários anteriores
```

**SENÃO SE** `{{task_manager}}` = `jira`:

```bash
# Buscar via Jira API ou manualmente
# Extrair: summary, description, acceptance criteria
```

**SENÃO:**

```bash
# Solicitar informações manualmente ao usuário
```

### Passo 3: Gerar Template de Ata

Criar template estruturado para documentação da sessão:

```markdown
# 📝 Ata - Three Amigos: {{story_id}}

**Data:** [DATA]
**Participantes:** 
- PO: [NOME]
- Developer: [NOME]  
- QA: [NOME]

## 📋 Story Context
- **ID:** {{story_id}}
- **Título:** [TÍTULO]
- **Descrição:** [DESCRIÇÃO]

## 🎯 Perspectiva PO

### Requisitos Identificados
- [ ] Requisito 1
- [ ] Requisito 2

### Critérios de Aceitação
1. [Critério 1]
2. [Critério 2]

### Valor de Negócio
[Descrição do valor]

### Dependências de Produto
- [Dependência 1]
- [Dependência 2]

## 🔧 Perspectiva Developer

### Viabilidade Técnica
[Análise técnica]

### Riscos Técnicos
- [ ] Risco 1: [Descrição]
- [ ] Risco 2: [Descrição]

### Estimativa Dev Story Points
**Pontos:** [X] pontos
**Justificativa:** [Razão]

### Dependências Técnicas
- [Dependência técnica 1]
- [Dependência técnica 2]

### Arquitetura Proposta
[Descrição da solução técnica]

## 🧪 Perspectiva QA

### Cenários de Teste Identificados
1. **Cenário 1:** [Descrição]
   - Tipo: [White-box|Black-box|Grey-box]
   - Complexidade: [Baixa|Média|Alta]

2. **Cenário 2:** [Descrição]
   - Tipo: [White-box|Black-box|Grey-box]
   - Complexidade: [Baixa|Média|Alta]

### Estimativa QA Story Points
**Pontos:** [X] pontos
**Justificativa:** [Razão]

### Riscos de Qualidade
- [ ] Risco 1: [Descrição]
- [ ] Risco 2: [Descrição]

### Test Strategy
- **Abordagem:** [White-box|Black-box|Grey-box|Híbrida]
- **Cobertura:** [Áreas cobertas]
- **Ferramentas:** [Ferramentas necessárias]

### Edge Cases Conhecidos
- [Edge case 1]
- [Edge case 2]

## 🔄 Perspectiva Cross

### Integrações Necessárias
- [Integração 1]
- [Integração 2]

### Cross-Testing Points
**Pontos:** [X] pontos
**Justificativa:** [Razão]

### Dependencies Entre Equipes
- [Dependência 1]
- [Dependência 2]

### Riscos Compartilhados
- [ ] Risco compartilhado 1
- [ ] Risco compartilhado 2

## ✅ Consolidação

### Story Refinada
[Descrição final refinada da story]

### Estimativas Finais
- **Dev Points:** [X]
- **QA Points:** [X]
- **Cross Points:** [X]
- **Total:** [X] pontos

### Definition of Done
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

### Próximos Passos
1. [Ação 1] - Responsável: [NOME] - Prazo: [DATA]
2. [Ação 2] - Responsável: [NOME] - Prazo: [DATA]

### Riscos Consolidados
| Risco | Impacto | Probabilidade | Mitigação |
|-------|--------|---------------|------------|
| [Risco] | [Alto/Médio/Baixo] | [Alta/Média/Baixa] | [Ação] |

## 📌 Observações
[Notas adicionais da sessão]
```

### Passo 4: Criar Checklist de Outputs

Gerar checklist para validar completude da sessão:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CHECKLIST DE OUTPUTS - THREE AMIGOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 STORY REFINEMENT
  ✅ Story descrição atualizada
  ✅ Critérios de aceitação claros e testáveis
  ✅ Dependências identificadas
  ✅ Prioridade confirmada

📊 ESTIMATIVAS
  ✅ Dev Story Points estimados
  ✅ QA Story Points estimados
  ✅ Cross-Testing Points identificados
  ✅ Total de pontos documentado

🧪 TEST STRATEGY
  ✅ Cenários de teste identificados
  ✅ Abordagem de teste definida (White/Black/Grey-box)
  ✅ Edge cases mapeados
  ✅ Ferramentas de teste definidas

⚠️ RISCOS
  ✅ Riscos técnicos identificados
  ✅ Riscos de qualidade mapeados
  ✅ Riscos compartilhados documentados
  ✅ Plano de mitigação definido

📝 DOCUMENTAÇÃO
  ✅ Ata da sessão completa
  ✅ Definition of Done acordada
  ✅ Próximos passos definidos
  ✅ Story atualizada no task manager

🔗 INTEGRAÇÕES
  ✅ Dependências técnicas mapeadas
  ✅ Dependências de produto identificadas
  ✅ Integrações necessárias documentadas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Passo 5: Integração com Task Manager

**SE** `{{task_manager}}` = `clickup`:

```bash
# 1. Atualizar descrição da task com story refinada
# 2. Adicionar comentário com resumo da sessão
# 3. Criar subtasks para:
#    - Desenvolvimento (com Dev points)
#    - Testes (com QA points)
#    - Cross-testing (com Cross points)
# 4. Adicionar tags: three-amigos, refined
# 5. Atualizar custom fields se disponíveis:
#    - Dev Points
#    - QA Points
#    - Cross Points
```

**Formato de Comentário ClickUp:**

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 THREE AMIGOS SESSION COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Data: [DATA]
👥 Participantes: PO + Dev + QA

📊 ESTIMATIVAS FINAIS:
∟ Dev Points: [X]
∟ QA Points: [X]
∟ Cross Points: [X]
∟ Total: [X] pontos

✅ OUTPUTS:
∟ Story refinada ✓
∟ Test strategy definida ✓
∟ Riscos mapeados ✓
∟ DoD acordada ✓

📝 Ata completa: [LINK ou anexo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**SENÃO:**

```bash
# Documentar manualmente ou usar integração específica
```

### Passo 6: Integração com Calendar (Opcional)

**SE** calendar integration disponível:

```bash
# 1. Criar evento no calendário
#    - Título: "Three Amigos: {{story_id}}"
#    - Duração: 60-90 minutos
#    - Participantes: PO, Developer, QA
#    - Descrição: Agenda + link para story
#    - Anexar: Template de ata
# 2. Enviar convite
# 3. Criar reminder 15min antes
```

**SENÃO:**

```bash
# Gerar link de calendário (.ics) para importação manual
# Ou instruir criação manual
```

## 📤 Output Esperado

### Arquivos Gerados

1. **Agenda Estruturada** (`three-amigos-agenda-{{story_id}}.md`)
   - Agenda completa com timing
   - Tópicos por perspectiva
   - Duração estimada

2. **Template de Ata** (`three-amigos-ata-{{story_id}}.md`)
   - Template preenchível
   - Seções por perspectiva
   - Checklist integrado

3. **Checklist de Outputs** (`three-amigos-checklist-{{story_id}}.md`)
   - Validação de completude
   - Outputs esperados
   - Status tracking

4. **Calendar Event** (se integration disponível)
   - Evento criado
   - Convites enviados
   - Reminders configurados

### Atualizações no Task Manager

- ✅ Story descrição atualizada
- ✅ Comentário com resumo da sessão
- ✅ Subtasks criadas (Dev, QA, Cross)
- ✅ Tags aplicadas
- ✅ Custom fields atualizados (se disponíveis)

### Resumo Visual

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ THREE AMIGOS SESSION PREPARED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Story: {{story_id}}
📁 Arquivos criados:
  ∟ Agenda: three-amigos-agenda-{{story_id}}.md
  ∟ Template Ata: three-amigos-ata-{{story_id}}.md
  ∟ Checklist: three-amigos-checklist-{{story_id}}.md

🔗 Task Manager: {{task_manager}}
  ∟ Story atualizada ✓
  ∟ Comentário adicionado ✓

📅 Calendar: [Status]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- **Padrão Three Amigos:** `docs/knowbase/frameworks/framework_testes.md` (seção "Padrões de Colaboração")
- **QA Story Points:** `docs/knowbase/frameworks/framework_testes.md` (seção "QA Story Points")
- **Test Strategy:** `/validate/test-strategy/create`
- **ClickUp Integration:** `.cursor/docs/clickup/clickup-integration.md`

## ⚠️ Notas

- **Duração recomendada:** 60-90 minutos por story
- **Timing ideal:** Sprint Planning ou Story Refinement
- **Participantes obrigatórios:** PO + Developer + QA
- **Outputs críticos:** Estimativas (Dev + QA + Cross) e Test Strategy
- **Documentação:** Sempre documentar ata completa para referência futura
- **Calendar:** Integração opcional, pode ser feito manualmente se necessário

## 💡 Exemplos de Uso

### Exemplo 1: Sessão com Agenda Automática

```bash
/validate/collab/three-amigos STORY-123 clickup --generate-agenda
```

**Output:**
- Agenda gerada automaticamente
- Template de ata criado
- Checklist preparado
- Story atualizada no ClickUp

### Exemplo 2: Sessão Manual (sem agenda)

```bash
/validate/collab/three-amigos TASK-456 jira
```

**Output:**
- Template de ata criado
- Checklist preparado
- Instruções para buscar story no Jira manualmente

### Exemplo 3: Sessão com Calendar Integration

```bash
/validate/collab/three-amigos FEATURE-789 clickup --generate-agenda --calendar
```

**Output:**
- Todos os outputs anteriores
- Evento criado no calendário
- Convites enviados aos participantes

