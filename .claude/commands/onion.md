---
name: onion
description: |
  Ponto de entrada inteligente para o Sistema Onion.
  Use para navegação, recomendações e orquestração de workflows.
model: sonnet

parameters:
  - name: query
    description: Sua pergunta ou necessidade
    required: false

category: meta
tags:
  - navigation
  - orchestration
  - help

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /product/task
  - /engineer/start
  - /git/feature/start

related_agents:
  - onion
---

# 🧅 Comando Onion

Atalho inteligente para o agente orquestrador master @onion.

## 🎯 Objetivo

Acessar o Sistema Onion para navegação, recomendações e orquestração.

## ⚡ Uso

```bash
/onion                    # Ajuda geral
/onion "como criar task"  # Pergunta específica
/onion "workflow de PR"   # Orientação de workflow
```

## 🔄 Fluxo de Execução

### Passo 1: Detectar Tipo de Solicitação

| Tipo | Indicadores | Ação |
|------|-------------|------|
| 🆘 Ajuda | "como", "o que" | Explicar sistema |
| 🎯 Tarefa | "criar", "fazer" | Recomendar comando |
| 🔍 Busca | "qual", "onde" | Encontrar recurso |
| 🔧 Problema | "erro", "não funciona" | Diagnosticar |
| 🔄 Workflow | "do zero", "completo" | Orquestrar fluxo |

### Passo 2: Preparar Contexto

```bash
# Detectar sessões ativas
ls .cursor/sessions/*/context.md 2>/dev/null

# Verificar estado Git
git branch --show-current
git status --short
```

### Passo 3: Invocar @onion

Delegar para o agente com contexto coletado.

## 📤 Respostas Comuns

### Ajuda Geral

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧅 SISTEMA ONION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Estrutura:
∟ 57 comandos em 7 categorias
∟ 38 agentes especializados
∟ Integração ClickUp MCP

🚀 Comandos Principais:
∟ /product/task - Criar tasks
∟ /engineer/start - Iniciar feature
∟ /engineer/work - Continuar trabalho
∟ /git/feature/start - Criar branch

💡 Use: /onion "sua pergunta"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Recomendação de Comando

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 RECOMENDAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para: "criar task no ClickUp"

✅ Use: /product/task [descrição]

📋 Exemplo:
/product/task Implementar autenticação OAuth2

🔗 Relacionados:
∟ /product/spec - Criar especificação
∟ /product/feature - Detalhar feature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Workflow Completo

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 WORKFLOW: Feature Completa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Sequência:
1. /product/task [nome]
2. /engineer/start [feature-slug]
3. /git/feature/start
4. /engineer/work
5. /engineer/pre-pr
6. /engineer/pr
7. /git/sync

💡 Dica: Cada comando atualiza ClickUp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- Agente master: @onion
- Docs: `docs/onion/`
- Sistema de Testes: `docs/onion/testing-validation-system.md` - Framework completo de testes e validação

## ⚠️ Notas

- Sempre começa com contexto do workspace
- Detecta sessões ativas automaticamente
- Para ajuda específica de agente: @nome-do-agente

## 🔴 REGRA CRÍTICA: Criação de Tasks

**SEMPRE criar tasks no Task Manager configurado:**

Quando usar comandos que criam tasks (`/product/task`, `/product/feature`):
1. ✅ **SEMPRE** detectar provedor via `.cursor/utils/task-manager/detector.md`
2. ✅ **SEMPRE** usar abstração `getTaskManager()` para criar tasks
3. ✅ **SEMPRE** criar task principal + subtasks no provedor configurado
4. ✅ **SEMPRE** adicionar comentários e atualizar status
5. ❌ **NUNCA** criar apenas documentos locais sem sincronizar
6. ❌ **NUNCA** ignorar o provedor configurado no `.env`

**Provedores suportados:**
- ClickUp (via MCP) - `TASK_MANAGER_PROVIDER=clickup`
- Asana (via MCP) - `TASK_MANAGER_PROVIDER=asana`
- Linear (via API) - `TASK_MANAGER_PROVIDER=linear`
- None (modo offline) - `TASK_MANAGER_PROVIDER=none`

**Esta regra é OBRIGATÓRIA e será sempre executada.**
