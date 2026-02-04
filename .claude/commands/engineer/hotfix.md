---
name: hotfix
description: |
  Emergency workflow completo: task ClickUp + branch hotfix + desenvolvimento.
  Use para correções urgentes em produção.
model: sonnet

parameters:
  - name: description
    description: Descrição do hotfix
    required: true
  - name: related_tasks
    description: IDs de tasks relacionadas (comma-separated)
    required: false
  - name: tags
    description: Tags adicionais (comma-separated)
    required: false

category: engineer
tags:
  - hotfix
  - emergency
  - gitflow

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /git/hotfix/start
  - /git/hotfix/finish
  - /product/task

related_agents:
  - gitflow-specialist
  - clickup-specialist
---

# 🔥 Engineer Hotfix

Emergency workflow completo: Task + Branch + Desenvolvimento.

## 🎯 Objetivo

Executar workflow de hotfix end-to-end em um único comando.

## ⚡ Fluxo de Execução

### Passo 1: Validar Input

```bash
# Verificar descrição
if [ -z "{{description}}" ]; then
  echo "❌ Descrição obrigatória"
  exit 1
fi

# Verificar branch atual
CURRENT=$(git branch --show-current)
if [[ ! "$CURRENT" =~ ^(main|master|develop)$ ]]; then
  echo "⚠️ Recomendado: iniciar de main/master"
fi
```

### Passo 2: Criar Task Emergencial

Via ClickUp MCP:

```yaml
name: "🔥 HOTFIX: {{description}}"
list_id: [lista de hotfixes]
priority: urgent
tags:
  - hotfix
  - urgent
  - {{tags}}
status: "In Progress"
markdown_description: |
  ## 🚨 Emergency Hotfix
  
  **Descrição**: {{description}}
  
  ## 📋 Checklist
  - [ ] Diagnóstico
  - [ ] Implementação
  - [ ] Testes
  - [ ] Deploy
```

### Passo 3: Criar Branch Hotfix

```bash
# Garantir main atualizada
git checkout main
git pull origin main

# Criar hotfix branch
VERSION=$(cat package.json | grep version | head -1 | awk -F'"' '{print $4}')
PATCH=$(echo $VERSION | awk -F. '{print $1"."$2"."$3+1}')
BRANCH="hotfix/$PATCH-$(echo '{{description}}' | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | head -c 30)"

git checkout -b $BRANCH
```

### Passo 4: Setup Session

```bash
# Criar sessão de desenvolvimento
mkdir -p .cursor/sessions/hotfix-$(date +%Y%m%d)/

# Criar context.md
cat > .cursor/sessions/hotfix-$(date +%Y%m%d)/context.md << EOF
# Hotfix Context

## Task
- ID: [task_id criado]
- URL: [url do clickup]

## Branch
- Nome: $BRANCH
- Base: main

## Descrição
{{description}}
EOF
```

### Passo 5: Iniciar Desenvolvimento

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 HOTFIX INICIADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Task: [URL do ClickUp]
🌿 Branch: hotfix/X.X.X-description

⚡ Próximos Passos:
1. Implementar correção
2. Testar localmente
3. /engineer/pre-pr
4. /git/hotfix/finish
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📤 Output Esperado

### Sucesso

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ HOTFIX SETUP COMPLETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ClickUp:
∟ Task: 🔥 HOTFIX: {{description}}
∟ ID: 86adfxxxx
∟ Status: In Progress
∟ Priority: Urgent

🌿 Git:
∟ Branch: hotfix/1.2.3-fix-description
∟ Base: main
∟ Remote: origin

📁 Session:
∟ Path: .cursor/sessions/hotfix-20251124/

🚀 Comandos:
∟ Desenvolver: /engineer/work
∟ Pre-PR: /engineer/pre-pr
∟ Finalizar: /git/hotfix/finish
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- Padrões: `common/prompts/git-workflow-patterns.md`
- Agente: @gitflow-specialist

## ⚠️ Notas

- Sempre parte de `main` ou `master`
- Task criada com prioridade máxima
- Merge automático para main E develop no finish
