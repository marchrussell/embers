---
name: analyze-complex-problem
description: |
  Análise estruturada de problemas complexos com template oficial.
  Use para análises críticas, migrações, arquitetura ou performance.
model: opus

parameters:
  - name: problem
    description: Descrição do problema ou sistema a analisar
    required: true
  - name: type
    description: Tipo (critical/implementation/migration/architecture/performance/security)
    required: false

category: meta
tags:
  - analysis
  - problem-solving
  - documentation

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /product/spec
  - /docs/build-tech-docs

related_agents:
  - metaspec-gate-keeper
  - c4-architecture-specialist
---

# 🔬 Análise de Problema Complexo

Criação de análises estruturadas usando template oficial.

## 🎯 Objetivo

Facilitar análises abrangentes para problemas complexos.

## ⚡ Fluxo de Execução

### Passo 1: Identificar Contexto

Analisar `{{problem}}` para determinar:

| Tipo | Indicadores |
|------|-------------|
| `critical` | Bug crítico, sistema down |
| `implementation` | Nova feature, integração |
| `migration` | Upgrade, mudança de stack |
| `architecture` | Design, refatoração |
| `performance` | Lentidão, otimização |
| `security` | Vulnerabilidade, audit |

### Passo 2: Coletar Dados

#### Análise de Código

```bash
# Buscar contexto
codebase_search "{{problem}}"

# Estrutura relacionada
list_dir caminho/relevante/
```

#### Análise de Sistema

```bash
# Logs
grep "ERROR\|WARNING" logs/

# Métricas
# [comandos específicos do sistema]
```

#### Análise de Documentação

```bash
# Docs existentes
read_file docs/relacionado.md
read_file README.md
```

### Passo 3: Preencher Template

Criar documento de análise:

```markdown
# Análise: {{problem}}

## 📋 Resumo Executivo
- **Tipo**: [tipo detectado]
- **Severidade**: [alta/média/baixa]
- **Impacto**: [descrição]
- **Prazo**: [urgente/planejado]

## 🔍 Contexto
[Descrição do problema e contexto]

## 📊 Dados Coletados
[Evidências e métricas]

## 🎯 Análise
### Causa Raiz
[Identificação da causa]

### Impacto
[Áreas afetadas]

### Riscos
[Riscos identificados]

## 💡 Recomendações
### Opção 1: [Nome]
- Prós: [lista]
- Contras: [lista]
- Esforço: [estimativa]

### Opção 2: [Nome]
- Prós: [lista]
- Contras: [lista]
- Esforço: [estimativa]

## ✅ Decisão
[Recomendação final]

## 📋 Próximos Passos
1. [Ação 1]
2. [Ação 2]
3. [Ação 3]
```

### Passo 4: Validar

SE análise de arquitetura:
- Consultar @metaspec-gate-keeper
- Validar alinhamento com meta-specs

### Passo 5: Salvar

```bash
# Criar diretório se necessário
mkdir -p docs/analysis/

# Salvar análise
write docs/analysis/[slug]-analysis.md
```

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ANÁLISE CONCLUÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Problema: {{problem}}

📋 Resumo:
∟ Tipo: Architecture
∟ Severidade: Média
∟ Causa: [identificada]
∟ Recomendação: [opção escolhida]

📁 Documento:
∟ docs/analysis/[slug]-analysis.md

🚀 Próximos Passos:
∟ Revisar com stakeholders
∟ Criar tasks no ClickUp
∟ Iniciar implementação
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- Template: `common/templates/analysis-template.md`
- Validação: @metaspec-gate-keeper

## ⚠️ Notas

- Use model `opus` para análises complexas
- Tempo médio: 10-30 minutos
- Sempre validar decisões com stakeholders
