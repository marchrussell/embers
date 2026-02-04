---
name: start
description: Iniciar hotfix branch para correção emergencial em produção.
model: sonnet
category: git
tags: [hotfix, gitflow, emergency]
version: "3.0.0"
updated: "2025-11-24"
---

# 🚨 Git Flow - Iniciar Hotfix

Iniciar correção emergencial criando hotfix branch a partir de main/master para resolver problemas críticos em produção. Workflow otimizado para máxima velocidade com validações de segurança essenciais.

## 🎯 Funcionalidades

### Emergency Hotfix Workflow
- Criação imediata de hotfix branch a partir de main/master (produção)
- Auto-versioning para patch releases emergenciais
- ClickUp task urgente com prioridade máxima automática
- Validações críticas de estado de produção
- Setup otimizado para correção imediata

### Safety-First Emergency Operations
- Detecção automática de primary branch (main/master)
- Validações essenciais de working directory
- Emergency override para uncommitted changes
- Rollback preparation automática
- Emergency documentation e tracking setup

### Criticidade e Tracking Urgente
- Tags de urgência automáticas no ClickUp
- Notificações escaladas para team awareness
- Emergency workflow prioritization
- Integration com @gitflow-specialist para emergency guidance
- Automated emergency documentation

## 🚀 Como Usar

```bash
/git/hotfix/start "fix-payment-gateway"    # Emergency payment fix
/git/hotfix/start "security-patch-auth"    # Security hotfix
/git/hotfix/start "critical-memory-leak"   # Performance emergency
/git/hotfix/start "api-timeout-fix"        # API emergency
```

**Pré-requisitos**: Nome da correção obrigatório, repositório Git válido

### Processo Executado
1. **Emergency Validation**: Verifica nome hotfix, repository state, critical validations
2. **Primary Branch Detection**: Detecta main/master automaticamente
3. **Emergency Override**: Handles uncommitted changes com emergency stashing
4. **Hotfix Branch Creation**: Cria hotfix/name branch a partir de produção
5. **ClickUp Emergency Setup**: Cria task urgente com máxima prioridade
6. **Team Notification**: Alerta equipe sobre emergency fix em andamento

### Emergency Features
Durante execução emergencial:
- Working directory: Emergency stash se necessário
- Branch detection: Main/master identification automática  
- Priority escalation: ClickUp task com urgência máxima
- Team alerts: Notification automática de emergency workflow

## 🤝 Integração @gitflow-specialist

*Este comando sempre consulta @gitflow-specialist para emergency workflow guidance, critical branch validation, hotfix strategy optimization e troubleshooting de situações emergenciais complexas.*

## ⚠️ Resolução de Problemas

### Hotfix Name Required
- **Sintoma**: Comando executado sem nome da correção
- **Solução**: Fornecer nome descritivo da correção emergencial

### Uncommitted Changes Emergency
- **Causa**: Working directory não limpo durante emergency
- **Fix**: Comando oferece emergency stash automático ou manual commit

### Primary Branch Detection Failed  
- **Sintoma**: Não consegue detectar main/master branch
- **Solução**: @gitflow-specialist fornece detection strategy para repository

### Not Git Repository
- **Causa**: Executado fora de repositório Git válido
- **Fix**: `git init && /git/init` para emergency setup

### Emergency Override Issues
- **Sintoma**: Problemas durante emergency workflow execution
- **Solução**: @gitflow-specialist fornece emergency guidance específica

### Critical State Validation Failed
- **Causa**: Repository em estado inconsistente para hotfix
- **Fix**: Emergency validation guidance via @gitflow-specialist consultation
