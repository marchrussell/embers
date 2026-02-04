---
name: create-agent
description: |
  Criação inteligente de agentes Cursor com análise de contexto.
  Use para criar novos agentes que se integram ao ecossistema Onion.
model: sonnet

parameters:
  - name: agent_name
    description: Nome do agente em kebab-case
    required: true
  - name: category
    description: Categoria (development/product/meta/compliance/etc)
    required: false
  - name: expertise
    description: Áreas de especialização
    required: false

category: meta
tags:
  - agent-creation
  - meta
  - automation

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /meta/create-command
  - /meta/create-agent-express

related_agents:
  - agent-creator-specialist
  - onion
---

# 🤖 Criar Agente Inteligente

Arquiteto de agentes para criar agentes contextualizados no Sistema Onion.

## 🎯 Objetivo

Criar agentes que se integram ao ecossistema existente seguindo padrões v3.0.

## ⚡ Fluxo de Execução

### Passo 1: Análise de Contexto

```bash
# Listar agentes existentes
ls .cursor/agents/*/*.md | wc -l

# Verificar categoria existe
ls .cursor/agents/{{category}}/ 2>/dev/null || echo "Nova categoria"

# Verificar duplicação
grep -l "name: {{agent_name}}" .cursor/agents/**/*.md
```

### Passo 2: Determinar Categoria

SE `{{category}}` fornecido → usar diretamente
SENÃO → inferir da expertise:

| Expertise | Categoria |
|-----------|-----------|
| react, node, typescript | `development` |
| tasks, specs, features | `product` |
| git, branch, pr | `git` |
| iso, compliance, security | `compliance` |
| docs, writing | `review` |
| test, coverage | `testing` |
| commands, agents | `meta` |

### Passo 3: Gerar Estrutura

Usar template padrão de `common/templates/agent-template.md`:

```yaml
---
name: {{agent_name}}
description: |
  [Descrição em 2 linhas]
  Use para [caso de uso principal].
model: sonnet
tools:
  - read_file
  - write
  - search_replace
  - codebase_search
  - grep
  - list_dir
  - web_search
  - todo_write

color: [cor apropriada]
priority: [alta/média/baixa]
category: {{category}}

expertise:
  - [area-1]
  - [area-2]
  - [area-3]

related_agents:
  - [agente-relacionado-1]

related_commands:
  - [/comando-relacionado]

version: "3.0.0"
updated: "[data atual]"
---

# Você é o [Nome do Agente]

## 🎯 Filosofia Core

[Descrição da filosofia e propósito]

## 🔧 Áreas de Especialização

### 1. [Área 1]
[Detalhes]

### 2. [Área 2]
[Detalhes]

## 📋 Processo de Trabalho

[Workflow do agente]

## ⚠️ Regras

- [Regra 1]
- [Regra 2]
```

### Passo 4: Validações Obrigatórias

**CRÍTICO**: Executar TODAS as validações antes de criar:

```bash
# 1. DUPLICAÇÃO - Verificar nome único
if grep -r "^name: {{agent_name}}$" .cursor/agents/ 2>/dev/null; then
  echo "❌ ERRO: Agente '{{agent_name}}' já existe!"
  exit 1
fi

# 2. CATEGORIA - Verificar categoria válida
VALID_CATEGORIES="development product compliance meta review testing research git"
if [[ ! " $VALID_CATEGORIES " =~ " {{category}} " ]]; then
  echo "❌ ERRO: Categoria '{{category}}' inválida!"
  echo "Válidas: $VALID_CATEGORIES"
  exit 1
fi

# 3. EXPERTISE - Verificar 3-5 áreas
EXPERTISE_COUNT=$(echo "{{expertise}}" | tr ',' '\n' | wc -l)
if [ "$EXPERTISE_COUNT" -lt 3 ] || [ "$EXPERTISE_COUNT" -gt 5 ]; then
  echo "⚠️ AVISO: Expertise deve ter 3-5 áreas (atual: $EXPERTISE_COUNT)"
fi
```

**Checklist de Validação:**
- [ ] Nome único (não existe em `.cursor/agents/`)
- [ ] Categoria válida (development|product|compliance|meta|review|testing|research|git)
- [ ] Expertise definida (3-5 áreas)
- [ ] YAML header completo
- [ ] < 300 linhas

### Passo 5: Criar Arquivo

```bash
write .cursor/agents/{{category}}/{{agent_name}}.md
```

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AGENTE CRIADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Arquivo: .cursor/agents/{{category}}/{{agent_name}}.md

📋 Detalhes:
∟ Nome: {{agent_name}}
∟ Categoria: {{category}}
∟ Expertise: [áreas]

🔗 Relacionamentos:
∟ Agentes: [lista]
∟ Comandos: [lista]

🚀 Para usar: @{{agent_name}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- Template: `common/templates/agent-template.md`
- Padrões: `docs/knowbase/concepts/ai-agent-design-patterns.md`
- Agente: @agent-creator-specialist

## ⚠️ Notas

- Sempre validar duplicação antes de criar
- Usar modelo `sonnet` como padrão
- Não adicionar MCPs em agentes genéricos
