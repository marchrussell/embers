---
name: sync-sessions
description: Sincronizar e organizar sessões de trabalho do Sistema Onion.
model: sonnet
category: docs
tags: [sessions, sync, organization]
version: "3.0.0"
updated: "2025-11-24"
---

# 🔄 Sync Sessions - Sincronização de Sessões Onion

Sincroniza e organiza todas as sessões de trabalho do Sistema Onion, garantindo que o contexto de desenvolvimento esteja preservado e acessível para referência futura.

## 🎯 Objetivo

Este comando analisa o trabalho realizado na sessão atual, organiza a documentação gerada e sincroniza com a estrutura `.cursor/sessions/`, mantendo um histórico organizado de todas as atividades de desenvolvimento.

## 🎯 Funcionalidades

### Organização de Sessões
- Detecta o trabalho realizado na sessão atual
- Cria estrutura organizada por data e tópico
- Preserva contexto e decisões tomadas
- Gera índice navegável de sessões

### Sincronização Automática
- Identifica arquivos criados/modificados
- Captura comandos Onion executados
- Preserva interações e decisões
- Mantém histórico de mudanças

### Validação e Integridade
- Verifica completude da documentação da sessão
- Valida estrutura de diretórios
- Identifica sessões incompletas
- Sugere melhorias na organização

## 🚀 Como Usar

```bash
# Sincronizar sessão atual
/docs/sync-sessions

# Sincronizar com nome customizado
/docs/sync-sessions "implementacao-feature-x"

# Sincronizar e arquivar sessão
/docs/sync-sessions --archive

# Apenas validar sem sincronizar
/docs/sync-sessions --validate-only
```

## 📋 Processo Executado

### 1. **Análise da Sessão Atual**
- Identifica data/hora de início
- Lista arquivos criados/modificados
- Captura comandos executados
- Extrai decisões e contexto

### 2. **Estruturação**
```
.cursor/sessions/
└── YYYY-MM-DD_HHMM_topic-name/
    ├── README.md              # Resumo da sessão
    ├── context.md             # Contexto inicial
    ├── decisions.md           # Decisões tomadas
    ├── changes.md             # Mudanças realizadas
    ├── notes.md               # Notas e observações
    ├── files-changed.txt      # Lista de arquivos
    └── commands-executed.txt  # Comandos usados
```

### 3. **Geração de Documentação**
- **README.md**: Resumo executivo da sessão
- **context.md**: Contexto e motivação
- **decisions.md**: Decisões arquiteturais e técnicas
- **changes.md**: Log detalhado de mudanças
- **notes.md**: Anotações e insights

### 4. **Sincronização**
- Move/copia arquivos para estrutura correta
- Atualiza índice de sessões
- Gera links de navegação
- Valida integridade

## 📁 Estrutura de Sessão

### README.md
```markdown
# [Topic Name] - [Date]

## 🎯 Objetivo
[Descrição do objetivo da sessão]

## 📊 Resultados
- [Lista de entregas]
- [Arquivos criados/modificados]

## 🔗 Links Relacionados
- [Documentação relacionada]
- [Issues/PRs relacionados]

## ⏱️ Tempo Investido
[Duração aproximada]
```

### context.md
```markdown
# Contexto - [Topic]

## Situação Inicial
[Estado do projeto antes da sessão]

## Motivação
[Por que este trabalho foi necessário]

## Restrições
[Limitações técnicas, tempo, recursos]

## Referências
[Links, documentos, discussões relevantes]
```

### decisions.md
```markdown
# Decisões Tomadas - [Topic]

## Decisão 1: [Título]
- **Contexto**: [Por que esta decisão foi necessária]
- **Opções Consideradas**:
  - Opção A: [Prós/Contras]
  - Opção B: [Prós/Contras]
- **Decisão**: [Opção escolhida]
- **Justificativa**: [Razões]
- **Impacto**: [Consequências]

## Decisão 2: [Título]
[...]
```

### changes.md
```markdown
# Mudanças Realizadas - [Topic]

## Arquivos Criados
- `path/to/file1.ts` - [Descrição]
- `path/to/file2.md` - [Descrição]

## Arquivos Modificados
- `path/to/existing.ts`
  - [Descrição da mudança]
  - [Linhas afetadas]

## Comandos Executados
1. `/docs/build-tech-docs` - [Resultado]
2. `/git/create-branch` - [Branch criada]

## Testes Adicionados
- [Lista de testes criados]
```

## 🤖 Integração com Agentes

Este comando convoca automaticamente:
- **@branch-documentation-writer**: Gera documentação estruturada
- **@metaspec-gate-keeper**: Valida conformidade com padrões
- **@gitflow-specialist**: Auxilia em questões Git se necessário

## ⚙️ Opções Avançadas

### Flags Disponíveis
```bash
--archive          # Move sessão para archived/
--validate-only    # Apenas valida sem sincronizar
--force           # Força sincronização mesmo com erros
--skip-git        # Não inclui informações Git
--detailed        # Gera relatório detalhado
```

### Exemplos Avançados
```bash
# Sincronizar e arquivar sessão antiga
/docs/sync-sessions "refactoring-api" --archive

# Validar integridade sem modificar
/docs/sync-sessions --validate-only

# Sincronização forçada com relatório detalhado
/docs/sync-sessions --force --detailed
```

## 📊 Métricas Capturadas

O comando captura automaticamente:
- **Arquivos**: Criados, modificados, deletados
- **Linhas de Código**: Adicionadas, removidas
- **Comandos**: Onion executados
- **Tempo**: Duração aproximada da sessão
- **Agentes**: AI agents convocados
- **Commits**: Git commits relacionados (se aplicável)

## ⚠️ Resolução de Problemas

### **Problema 1: Sessão já existe**
- **Sintoma**: Erro "Session directory already exists"
- **Solução**: Use flag `--force` ou renomeie a sessão

### **Problema 2: Arquivos não detectados**
- **Sintoma**: Lista de arquivos incompleta
- **Causa**: Arquivos fora do workspace ou gitignored
- **Fix**: Verifique `.gitignore` e workspace boundaries

### **Problema 3: Contexto insuficiente**
- **Sintoma**: README.md com pouca informação
- **Solução**: Execute comandos Onion com mais contexto antes de sincronizar

## 🔍 Validações Realizadas

O comando valida:
- ✅ Estrutura de diretórios correta
- ✅ Todos os arquivos markdown obrigatórios presentes
- ✅ README.md com seções mínimas
- ✅ Links internos funcionando
- ✅ Sem duplicação de sessões
- ✅ Índice de sessões atualizado

## 📈 Output Esperado

```bash
🔄 Sincronizando Sessão Onion...

📊 Análise da Sessão:
  • Tópico: implementação-dashboard-operacoes
  • Data: 2025-10-03 10:30
  • Arquivos Criados: 15
  • Arquivos Modificados: 8
  • Comandos Executados: 5
  • Agentes Convocados: 3

📁 Estrutura Criada:
  ✅ .cursor/sessions/2025-10-03_1030_dashboard-operacoes/
     ✅ README.md
     ✅ context.md
     ✅ decisions.md
     ✅ changes.md
     ✅ notes.md
     ✅ files-changed.txt
     ✅ commands-executed.txt

🔗 Índice Atualizado:
  ✅ .cursor/sessions/INDEX.md

✅ Sessão sincronizada com sucesso!

📚 Para revisar: 
   cat .cursor/sessions/2025-10-03_1030_dashboard-operacoes/README.md
```

## 🎯 Casos de Uso

### Caso 1: Fim de Sessão de Desenvolvimento
```bash
# Ao terminar trabalho do dia
/docs/sync-sessions "refactoring-contracts-module"
```

### Caso 2: Antes de Trocar de Branch
```bash
# Preservar contexto antes de mudar de tarefa
/docs/sync-sessions --detailed
git checkout other-branch
```

### Caso 3: Auditoria de Trabalho Realizado
```bash
# Gerar relatório completo da sessão
/docs/sync-sessions --validate-only --detailed
```

### Caso 4: Arquivar Trabalho Concluído
```bash
# Mover sessão para archived após merge
/docs/sync-sessions "feature-x-completed" --archive
```

## 🔗 Comandos Relacionados

- `/docs/build-index` - Reconstrói índice de documentação
- `/docs/docs-health` - Verifica saúde da documentação
- `/docs/validate-docs` - Valida completude
- `/git/help` - Ajuda com Git workflows

## 📝 Notas Importantes

1. **Frequência**: Execute ao final de cada sessão significativa de trabalho
2. **Contexto**: Quanto mais contexto fornecer, melhor a documentação gerada
3. **Consistência**: Manter padrão de nomenclatura ajuda na navegação
4. **Limpeza**: Arquive sessões antigas periodicamente para manter organização

## 🎓 Best Practices

1. **Nomeie Sessions Descritivamente**: Use nomes que descrevam claramente o trabalho
2. **Documente Decisões**: Capture o "porquê" das decisões, não apenas o "o quê"
3. **Preserve Contexto**: Inclua links para issues, PRs, discussões relevantes
4. **Seja Consistente**: Use padrões consistentes de nomenclatura
5. **Arquive Regularmente**: Mova sessões antigas para `archived/` periodicamente

---

**Agente Responsável**: @branch-documentation-writer  
**Validador**: @metaspec-gate-keeper  
**Categoria**: Documentação / Organização  
**Prioridade**: Média  
**Última Atualização**: Outubro 2025

