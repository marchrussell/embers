---
name: create-knowledge-base
description: |
  Criação de bases de conhecimento estruturadas via pesquisa.
  Use para gerar KBs sobre tecnologias, ferramentas ou conceitos.
model: sonnet

parameters:
  - name: topic
    description: Tema da knowledge base
    required: true
  - name: category
    description: Categoria (technologies/tools/concepts/frameworks)
    required: false

category: meta
tags:
  - knowledge-base
  - research
  - documentation

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /docs/build-tech-docs

related_agents:
  - research-agent
---

# 📚 Criar Knowledge Base

Geração de bases de conhecimento via pesquisa estruturada.

## 🎯 Objetivo

Criar KBs densas e estruturadas sobre temas específicos.

## ⚡ Fluxo de Execução

### Passo 1: Análise do Tema

1. **Interpretar requisitos**: Extrair tema de `{{topic}}`
2. **Determinar categoria**:
   - `technologies/` - React, Python, etc.
   - `tools/` - Docker, VSCode, etc.
   - `concepts/` - Metodologias, padrões
   - `frameworks/` - NestJS, FastAPI, etc.
   - `platforms/` - AWS, Azure, etc.

### Passo 2: Validar Estrutura

```bash
# Verificar docs/knowbase/
test -d docs/knowbase/ || mkdir -p docs/knowbase/{technologies,tools,concepts,frameworks,platforms}

# Verificar duplicação
ls docs/knowbase/**/*{{topic}}*.md 2>/dev/null
```

### Passo 3: Pesquisar

Via @research-agent ou web_search:

1. **Documentação oficial**
2. **Best practices**
3. **Exemplos de uso**
4. **Limitações conhecidas**
5. **Comparações relevantes**

### Passo 4: Estruturar Conteúdo

```markdown
# {{topic}} - Knowledge Base

## 📋 Visão Geral
[O que é, para que serve]

## 🎯 Casos de Uso
- Caso 1
- Caso 2

## ⚡ Quick Start
[Como começar rapidamente]

## 🔧 Configuração
[Setup e configurações]

## 💡 Best Practices
[Melhores práticas]

## ⚠️ Limitações
[Pontos de atenção]

## 🔗 Referências
- [Link oficial](url)
- [Docs](url)

---
**Última atualização**: [data]
**Fonte principal**: [fonte]
```

### Passo 5: Salvar

```bash
write docs/knowbase/{{category}}/{{topic}}.md
```

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ KNOWLEDGE BASE CRIADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Arquivo: docs/knowbase/{{category}}/{{topic}}.md

📊 Conteúdo:
∟ Seções: 7
∟ Linhas: ~200
∟ Referências: 5

📚 Fontes Consultadas:
∟ Documentação oficial
∟ GitHub
∟ Stack Overflow

🚀 Para acessar: docs/knowbase/{{category}}/{{topic}}.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- Agente: @research-agent
- Estrutura: `docs/knowbase/`

## ⚠️ Notas

- Sempre incluir data de atualização
- Citar fontes principais
- Manter < 400 linhas (dividir se maior)
