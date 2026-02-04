---
name: extract-meeting
description: |
  Extração estruturada de conhecimento de transcrições de reuniões usando Framework EXTRACT.
  Use para transformar arquivos de contexto bruto em artefatos de alto valor para humanos, sistemas e IA.
model: sonnet

parameters:
  - name: source
    description: Caminho do arquivo ou pasta com transcrição(ões)
    required: true
  - name: level
    description: Nível de output (compact, executive, complete, graph)
    required: false
  - name: focus
    description: Foco específico (decisions, tasks, gaps, all)
    required: false

category: product
tags:
  - meeting
  - extraction
  - knowledge-base
  - documentation

version: "3.0.0"
updated: "2025-12-01"

related_commands:
  - /product/task
  - /docs/build-tech-docs
  - /meta/create-knowledge-base

related_agents:
  - extract-meeting-specialist
  - product-agent
  - task-specialist

knowledge_bases:
  - docs/knowbase/concepts/meeting-transcription-to-knowledge-base.md
---

# 📋 Extrair Conhecimento de Reunião

Transformação de transcrições brutas em conhecimento estruturado usando o Framework EXTRACT.

## 🎯 Objetivo

Processar transcrições de reuniões e gerar outputs estruturados consumíveis por humanos, sistemas e IA, seguindo as 7 dimensões do Framework EXTRACT.

## ⚡ Fluxo de Execução

### Passo 1: Validar Input

```bash
# Verificar se source existe
test -e "{{source}}" || echo "❌ Arquivo/pasta não encontrado"

# Identificar tipo (arquivo ou pasta)
if [ -d "{{source}}" ]; then
  echo "📁 Processando pasta com múltiplos arquivos"
  FILES=$(find "{{source}}" -type f \( -name "*.txt" -o -name "*.md" \))
else
  echo "📄 Processando arquivo único"
  FILES="{{source}}"
fi
```

### Passo 2: Ler Conteúdo

```bash
# Ler transcrição(ões)
read_file "{{source}}"
```

### Passo 3: Aplicar Framework EXTRACT

Invocar `@extract-meeting-specialist` com instruções:

```markdown
## Tarefa
Processar a transcrição abaixo aplicando o Framework EXTRACT completo.

## Framework EXTRACT (7 Dimensões)
- **E**ssência: Resumo executivo em 3 linhas
- **X**pectativas: Objetivos da reunião e status (atingido/parcial/não)
- **T**arefas: Ações definidas (quem, o quê, quando)
- **R**esoluções: Decisões tomadas com justificativa
- **A**mbiguidades: Gaps, contradições, pontos não resolvidos
- **C**onexões: Dependências, stakeholders, documentos relacionados
- **T**imeline: Datas e marcos mencionados

## Nível de Output
{{level}} (default: executive)

## Foco
{{focus}} (default: all)

## Regras
1. NUNCA inventar informações — usar [INFERIDO] ou [NÃO ESPECIFICADO]
2. Indicar confidence level em decisões (high/medium/low)
3. Capturar TODOS os gaps — o que NÃO foi decidido é crítico
4. Tasks devem ter owner + deadline sempre que possível
5. Preservar citações importantes entre aspas

## Transcrição
[CONTEÚDO DO ARQUIVO]
```

### Passo 4: Gerar Output

**Nível `compact`:**
```markdown
## Reunião: [Título] | [Data]
**Decisão**: [Principal decisão]
**Ações**: [Nome] faz [quê] até [quando]
**Pendente**: [Principal gap]
```

**Nível `executive`:**
```markdown
## [Título] - [Data]

### Resumo
[3-5 linhas]

### Decisões
- ✅ [Decisão 1]
- ✅ [Decisão 2]

### Ações
| Responsável | Ação | Prazo |
|-------------|------|-------|
| [Nome] | [Descrição] | [Data] |

### Pendências
- ⚠️ [Gap 1]
- ⚠️ [Gap 2]

### Timeline
- 📅 [Data]: [Marco]
```

**Nível `complete`:**
Output YAML completo seguindo schema do knowledge base.

**Nível `graph`:**
JSON com entidades e relacionamentos para sistemas.

### Passo 5: Salvar Resultado

```bash
# Determinar nome do output
OUTPUT_NAME=$(basename "{{source}}" | sed 's/\.[^.]*$//')
OUTPUT_FILE="docs/meetings/${OUTPUT_NAME}-extract.md"

# Criar diretório se não existir
mkdir -p docs/meetings/

# Salvar
write "${OUTPUT_FILE}"
```

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ EXTRAÇÃO CONCLUÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Arquivo: docs/meetings/[nome]-extract.md

📊 Extração EXTRACT:
∟ Essência: ✅
∟ Expectativas: ✅
∟ Tarefas: [N] itens
∟ Resoluções: [N] decisões
∟ Ambiguidades: [N] gaps
∟ Conexões: [N] links
∟ Timeline: [N] datas

📈 Qualidade:
∟ Confidence Score: [0.X]
∟ Tasks com Owner: [X]%
∟ Tasks com Deadline: [X]%
∟ Gaps com Owner Sugerido: [X]%

🚀 Próximos Passos:
1. Revisar gaps críticos
2. Validar decisões com participantes
3. Criar tasks no gerenciador (@task-specialist)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🎯 Exemplos de Uso

```bash
# Extrair reunião específica (nível executivo default)
/product/extract-meeting source=rhilo-reuniao-28-nov.txt

# Nível completo com YAML
/product/extract-meeting source=reuniao.txt level=complete

# Foco apenas em decisões
/product/extract-meeting source=reuniao.txt focus=decisions

# Processar pasta de contexto
/product/extract-meeting source=contextos/projeto-x/

# Gerar grafo para sistemas
/product/extract-meeting source=reuniao.txt level=graph
```

## 🔗 Referências

- **Agente**: `@extract-meeting-specialist`
- **Knowledge Base**: `docs/knowbase/concepts/meeting-transcription-to-knowledge-base.md`
- **Framework**: EXTRACT (7 dimensões)

## ⚠️ Notas

- Processar em até 24h após reunião (contexto fresco)
- Validar decisões críticas com participantes
- Gaps são tão importantes quanto decisões
- Para criar tasks automaticamente, usar `@task-specialist` após extração

