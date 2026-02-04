---
name: docs-health
description: |
  Health check completo da documentação do projeto.
  Use para diagnóstico de qualidade, gaps e recomendações.
model: sonnet

parameters:
  - name: path
    description: Caminho para analisar (default: docs/)
    required: false
    default: docs/

category: docs
tags:
  - health-check
  - documentation
  - quality

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /docs/validate-docs
  - /docs/build-tech-docs

related_agents:
  - system-documentation-orchestrator
---

# 🏥 Docs Health Check

Verificação abrangente de saúde da documentação.

## 🎯 Objetivo

Fornecer diagnóstico completo com score, gaps e recomendações.

## ⚡ Fluxo de Execução

### Passo 1: Coletar Métricas

```bash
# Contar arquivos de docs
TOTAL=$(find {{path}} -name "*.md" | wc -l)

# Verificar estrutura
ls -la {{path}}/

# Arquivos grandes (>500 linhas)
find {{path}} -name "*.md" -exec wc -l {} \; | sort -rn | head -10
```

### Passo 2: Analisar Estrutura

#### Checklist de Estrutura
- [ ] README.md existe
- [ ] Índice/navegação presente
- [ ] Pastas organizadas por categoria
- [ ] Naming consistente (kebab-case)

### Passo 3: Avaliar Qualidade

#### Critérios de Qualidade

| Critério | Peso | Verificação |
|----------|------|-------------|
| Completude | 25% | Seções obrigatórias |
| Consistência | 20% | Formatação uniforme |
| Atualidade | 20% | Datas de update |
| Links | 15% | Links funcionais |
| Exemplos | 10% | Código de exemplo |
| TOC | 10% | Table of contents |

### Passo 4: Identificar Gaps

```bash
# Arquivos sem update recente (>90 dias)
find {{path}} -name "*.md" -mtime +90

# Arquivos pequenos (<50 linhas)
find {{path}} -name "*.md" -exec wc -l {} \; | awk '$1<50'
```

### Passo 5: Calcular Score

```
Score = (Estrutura × 0.25) + (Qualidade × 0.25) + 
        (Cobertura × 0.25) + (Atualidade × 0.25)
```

| Score | Status |
|-------|--------|
| 90-100 | 🟢 Excelente |
| 70-89 | 🟡 Bom |
| 50-69 | 🟠 Regular |
| <50 | 🔴 Crítico |

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 DOCS HEALTH REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Score Geral: 78/100 🟡

📈 Métricas:
∟ Arquivos: 45
∟ Linhas: 12,450
∟ Cobertura: 72%

✅ Pontos Fortes:
∟ Estrutura organizada
∟ README completo
∟ Exemplos presentes

⚠️ Gaps Identificados:
∟ 5 arquivos sem atualização >90d
∟ API docs incompleta
∟ Falta troubleshooting

💡 Recomendações:
1. Atualizar docs de API
2. Adicionar seção troubleshooting
3. Revisar arquivos antigos

🎯 Meta: 85/100 (próximo quarter)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- Validação: /docs/validate-docs
- Agente: @system-documentation-orchestrator

## ⚠️ Notas

- Executar mensalmente para tracking
- Score histórico salvo em `.cursor/metrics/`
