---
name: presentation
description: |
  Criação de apresentações profissionais via Gamma.app.
  Use para gerar apresentações a partir de temas, tasks ou documentos.
model: sonnet

parameters:
  - name: topic
    description: Tema, task_id ou documento para a apresentação
    required: true
  - name: type
    description: Tipo (pitch/product/technical/business/report)
    required: false

category: product
tags:
  - presentation
  - gamma
  - content

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /product/task
  - /docs/build-business-docs

related_agents:
  - presentation-orchestrator
  - storytelling-business-specialist
  - gamma-api-specialist
---

# 🎨 Criação de Apresentações

Wrapper para criação de apresentações via @presentation-orchestrator.

## 🎯 Objetivo

Criar apresentações profissionais no Gamma.app de forma automatizada.

## ⚡ Fluxo de Execução

### Passo 1: Identificar Tipo de Input

Analisar `{{topic}}` para determinar fonte:

| Pattern | Tipo | Ação |
|---------|------|------|
| `86adf...` | Task ID | Buscar dados no ClickUp |
| `docs/...` | Documento | Ler arquivo |
| Texto livre | Tema | Pesquisar codebase |

### Passo 2: Detectar Tipo de Apresentação

SE `{{type}}` fornecido → usar diretamente
SENÃO → inferir do contexto:

| Contexto | Tipo Inferido |
|----------|---------------|
| Investidores, funding | `pitch` |
| Novo recurso, release | `product` |
| Arquitetura, API | `technical` |
| Resultados, métricas | `business` |
| Status, progresso | `report` |

### Passo 3: Coletar Dados

#### Task ClickUp

```
Buscar via mcp_clickup:
- Nome e descrição
- Subtasks e progresso
- Comentários relevantes
- Métricas associadas
```

#### Documento

```
Ler arquivo e extrair:
- Título e resumo
- Pontos principais
- Dados e métricas
- Conclusões
```

#### Tema Geral

```
Pesquisar no codebase:
- Arquivos relacionados
- Documentação existente
- README e specs
```

### Passo 4: Estruturar Narrativa

Delegar para @storytelling-business-specialist:

```
Definir:
- Audiência-alvo
- Objetivo da apresentação
- Arco narrativo
- Pontos-chave (5-10)
```

### Passo 5: Gerar Apresentação

Invocar @presentation-orchestrator com:

```yaml
topic: [tema extraído]
type: [tipo detectado]
audience: [audiência]
key_points: [pontos-chave]
data: [dados coletados]
```

### Passo 6: Entregar Resultado

## 📤 Output Esperado

### Sucesso

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ APRESENTAÇÃO CRIADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 [Título da Apresentação]

📋 Detalhes:
∟ Tipo: Product Launch
∟ Slides: 12
∟ Audiência: Stakeholders
∟ Fonte: Task #86adf8jj6

🎨 Assets:
∟ Gamma: https://gamma.app/docs/xxx
∟ PDF: apresentacao.pdf
∟ Outline: outline.md

🚀 Próximos Passos:
∟ Revisar conteúdo
∟ Ajustar design
∟ Compartilhar com equipe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tipos de Apresentação

| Tipo | Slides | Estrutura |
|------|--------|-----------|
| `pitch` | 10-15 | Problema → Solução → Mercado → Tração → Ask |
| `product` | 8-12 | Contexto → Feature → Demo → Benefícios → CTA |
| `technical` | 12-20 | Arquitetura → Componentes → Fluxos → API |
| `business` | 10-15 | Contexto → Resultados → Análise → Próximos |
| `report` | 5-10 | Status → Progresso → Bloqueios → Timeline |

## 🔗 Referências

- Agente principal: @presentation-orchestrator
- Storytelling: @storytelling-business-specialist  
- API técnica: @gamma-api-specialist

## ⚠️ Notas

- Requer Gamma.app configurado (GAMMA_API_KEY)
- Para config: `/meta/setup-integration gamma`
- Tempo médio: 2-5 minutos por apresentação
