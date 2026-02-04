---
name: finish
description: Finalizar release com merge, tag e publicação.
model: sonnet
category: git
tags: [release, gitflow, deploy]
version: "3.0.0"
updated: "2025-11-24"
---

# ✅ Git Flow - Finalizar Release

Finalizar processo de release realizando merge seguro para main/master e develop, criação de tags, publicação e cleanup. Workflow completo de release deployment com validações automáticas e ClickUp integration.

## 🎯 Funcionalidades

### Release Completion e Merge Strategy
- Merge seguro de release branch para main/master branch
- Back-merge para develop branch mantendo sincronização
- Criação automática de tags anotadas com release notes
- Validações pré-merge (conflicts, tests, working directory)
- Cleanup automático de release branch após finalização

### Publishing e Deployment Integration  
- Tag publishing para remote repository
- Release notes generation baseada em changelog
- ClickUp task completion e status updates
- Team notification via release completion workflow
- Integration com CI/CD pipelines através de tags

### Safety-First e Validações
- Confirmação obrigatória antes de merge para main
- Análise de impacto completa (commits, files, changes)
- Validação de release branch state e readiness
- Preview detalhado das mudanças que serão mergeadas
- Rollback guidance caso problemas sejam detectados

## 🚀 Como Usar

```bash
/git/release/finish                   # Auto-detecta release branch atual
/git/release/finish v2.1.0           # Finaliza release específica
```

**Pré-requisitos**: Em release branch ou especificar versão da release

### Processo Executado
1. **Detection**: Detecta release branch atual ou busca por versão específica
2. **Validations**: Verifica release branch state, conflicts, working directory
3. **Preview**: Exibe impacto do merge (commits, files, deployment implications)
4. **Confirmation**: Solicita confirmação explícita para merge em main
5. **Merge Strategy**: Executa merge para main + back-merge para develop
6. **Tag Creation**: Cria tag anotada com release notes automáticas
7. **Publishing**: Publica tags e atualiza remote branches
8. **Cleanup**: Remove release branch e atualiza ClickUp completion

### Merge Strategy Intelligence
Durante execução, aplica strategy inteligente:
- Main merge: Fast-forward quando possível, merge commit quando necessário
- Develop back-merge: Garante sincronização sem perder desenvolvimento
- Conflict detection: Identifica e orienta resolução antes do merge
- Tag management: Cria tags consistentes com convention estabelecida

## 🤝 Integração @gitflow-specialist

*Este comando sempre consulta @gitflow-specialist para merge strategy validation, conflict resolution guidance, tag creation best practices e troubleshooting de release deployment complexo.*

## ⚠️ Resolução de Problemas

### Release Branch Not Found
- **Sintoma**: Não consegue detectar release branch ativa
- **Solução**: `git checkout release/version` ou especificar versão no comando

### Merge Conflicts Detected
- **Causa**: Conflicts entre release branch e main/develop
- **Fix**: Resolver conflicts manualmente antes de finalizar release

### Uncommitted Changes in Release
- **Sintoma**: Release branch tem changes não commitadas
- **Solução**: `git add . && git commit -m "final release changes"`

### Tag Already Exists
- **Causa**: Tag da versão já existe no repository
- **Fix**: Usar `git tag -d tagname` para remover ou escolher versão diferente

### Main Branch Protection
- **Sintoma**: Branch protection impede merge direto
- **Solução**: Usar Pull Request workflow ou ajustar branch protection

### Tests Failing in Release
- **Causa**: Release branch não passa nos testes automatizados
- **Fix**: Corrigir testes ou usar override com approval (não recomendado)

### Remote Publishing Issues
- **Sintoma**: Problemas ao publicar tags ou branches
- **Solução**: @gitflow-specialist orienta sobre remote configuration e permissions
