# 🔧 Checklist de Manutenção - Sistema Onion

## 📋 Índice

- [Adicionar Novo Comando](#-adicionar-novo-comando)
- [Adicionar Novo Agente](#-adicionar-novo-agente)
- [Atualizar Documentação](#-atualizar-documentação)
- [Checklist de Qualidade](#-checklist-de-qualidade)
- [Processo de Release](#-processo-de-release)
- [Troubleshooting](#-troubleshooting)

---

## ➕ Adicionar Novo Comando

### **Checklist Completo:**

- [ ] **1. Criar Arquivo do Comando**
  - Criar arquivo `.md` em `.cursor/commands/[categoria]/`
  - Usar nomenclatura kebab-case
  - Seguir template padrão de comando

- [ ] **2. Definir Estrutura do Comando**
  ```markdown
  # Nome do Comando
  
  Descrição clara do propósito do comando.
  
  ## 🎯 Funcionalidades
  - Lista de funcionalidades principais
  
  ## 🚀 Uso do Comando
  ### Sintaxe:
  ```bash
  /categoria/comando "argumentos"
  ```
  
  ### Exemplos:
  ```bash
  /categoria/comando "exemplo-1"
  /categoria/comando "exemplo-2"
  ```
  
  ## ⚙️ Workflow Automático
  Descrição detalhada do workflow
  
  ## 🔗 Integração com Sistema Onion
  Como o comando se integra com outros comandos
  ```

- [ ] **3. Atualizar Documentação**
  - Adicionar ao `commands-guide.md`
  - Atualizar contador no `README.md`
  - Adicionar exemplos em `practical-examples.md`
  - Atualizar `engineering-flows.md` (se aplicável)

- [ ] **4. Testar Comando**
  - Testar sintaxe básica
  - Testar com diferentes argumentos
  - Verificar integração com outros comandos
  - Validar output esperado

- [ ] **5. Commit e Documentação**
  - Commit com mensagem descritiva: `feat: adicionar comando /categoria/comando`
  - Atualizar CHANGELOG (se houver)
  - Criar PR com descrição completa

### **Categorias de Comandos:**
- `engineer/` - Comandos de engenharia
- `product/` - Comandos de produto
- `git/` - Comandos Git
- `docs/` - Comandos de documentação
- `meta/` - Comandos meta (sistema)

---

## 🤖 Adicionar Novo Agente

### **Checklist Completo:**

- [ ] **1. Criar Arquivo do Agente**
  - Criar arquivo `.md` em `.cursor/agents/[categoria]/`
  - Usar nomenclatura kebab-case
  - Seguir template padrão de agente com YAML front matter

- [ ] **2. Definir YAML Front Matter**
  ```yaml
  ---
  name: nome-do-agente
  description: Descrição clara e concisa do agente
  model: sonnet
  tools: read_file, write, search_replace, run_terminal_cmd, codebase_search
  color: lightblue
  priority: alta
  expertise: ["área-1", "área-2", "área-3"]
  related_agents: ["agente-relacionado-1", "agente-relacionado-2"]
  related_commands: ["/comando-1", "/comando-2"]
  autonomy: alta
  updated: "YYYY-MM-DD"
  cursor_version: "v2"
  ---
  ```

- [ ] **3. Definir Conteúdo do Agente**
  ```markdown
  # Você é o [Nome do Agente]
  
  ## 🎯 Missão Principal
  Descrição clara da missão do agente
  
  ## 🔧 Áreas de Especialização
  1. **Área 1**: Descrição
  2. **Área 2**: Descrição
  3. **Área 3**: Descrição
  
  ## 🛠️ Metodologia Técnica
  Como o agente trabalha
  
  ## 🎯 Protocolo de Operação
  Passo a passo de como o agente opera
  
  ## 🔗 Integração com Outros Agentes
  Como o agente se integra com outros
  
  ## 📋 Checklist de Execução
  - [ ] Passo 1
  - [ ] Passo 2
  - [ ] Passo 3
  
  ## 🎯 Casos de Uso
  Exemplos práticos de uso
  ```

- [ ] **4. Atualizar Documentação**
  - Adicionar ao `agents-reference.md`
  - Atualizar contador no `README.md`
  - Documentar casos de uso
  - Adicionar à matriz de decisão (se aplicável)

- [ ] **5. Testar Invocação**
  - Testar invocação com `@nome-do-agente`
  - Verificar comportamento esperado
  - Validar integração com comandos
  - Testar com casos de uso reais

- [ ] **6. Commit e Documentação**
  - Commit com mensagem descritiva: `feat: adicionar agente @nome-do-agente`
  - Atualizar CHANGELOG (se houver)
  - Criar PR com descrição completa

### **Categorias de Agentes:**
- `development/` - Agentes de desenvolvimento
- `product/` - Agentes de produto
- `review/` - Agentes de revisão
- `architecture/` - Agentes de arquitetura
- `compliance/` - Agentes de compliance

---

## 📝 Atualizar Documentação

### **Checklist Completo:**

- [ ] **1. Identificar Mudanças Necessárias**
  - Revisar comandos/agentes modificados
  - Identificar documentação impactada
  - Listar exemplos que precisam atualização

- [ ] **2. Atualizar Documentos Relevantes**
  - `commands-guide.md` - Se comandos mudaram
  - `agents-reference.md` - Se agentes mudaram
  - `engineering-flows.md` - Se fluxos mudaram
  - `practical-examples.md` - Se exemplos mudaram
  - `getting-started.md` - Se setup mudou
  - `clickup-integration.md` - Se integração mudou
  - `naming-conventions.md` - Se nomenclatura mudou

- [ ] **3. Atualizar Exemplos Práticos**
  - Verificar se exemplos ainda funcionam
  - Atualizar sintaxe se necessário
  - Adicionar novos exemplos se aplicável
  - Remover exemplos obsoletos

- [ ] **4. Testar Todos os Links**
  - Links internos entre documentos
  - Links para comandos e agentes
  - Âncoras de seções
  - Links externos (se houver)

- [ ] **5. Verificar Nomenclatura Consistente**
  - Usar `<feature-slug>` (kebab-case)
  - Evitar `task-slug`, `feature_slug`, etc.
  - Manter consistência em exemplos

- [ ] **6. Commit e PR**
  - Commit com mensagem descritiva: `docs: atualizar [documento]`
  - Criar PR com lista de mudanças
  - Solicitar review se necessário

---

## ✅ Checklist de Qualidade

### **Antes de Cada Commit:**

- [ ] **Links Funcionam**
  - Todos os links internos resolvem
  - Âncoras de seções corretas
  - Caminhos de arquivos válidos

- [ ] **Contadores Corretos**
  - Badge de comandos no README
  - Badge de agentes no README
  - Números em documentação

- [ ] **Nomenclatura Consistente**
  - Usar `<feature-slug>` (kebab-case)
  - Evitar variações antigas
  - Manter padrão em exemplos

- [ ] **Exemplos Executáveis**
  - Sintaxe correta
  - Argumentos válidos
  - Resultados esperados documentados

- [ ] **Sem Erros de Markdown**
  - Formatação correta
  - Blocos de código fechados
  - Listas bem formatadas
  - Tabelas válidas

- [ ] **Documentação Atualizada**
  - README reflete mudanças
  - Guias atualizados
  - Exemplos relevantes

### **Comandos Úteis para Validação:**

```bash
# Contar comandos
find .cursor/commands -name "*.md" -type f ! -name "README.md" | wc -l

# Contar agentes
find .cursor/agents -name "*.md" -type f ! -name "README.md" | wc -l

# Buscar nomenclatura antiga
grep -r "task-slug\|task_slug\|feature_slug" .cursor/commands/
grep -r "task-slug\|task_slug\|feature_slug" .cursor/docs/onion/

# Listar arquivos de documentação
ls -la .cursor/docs/onion/*.md

# Verificar links quebrados (manual)
# Abrir cada documento e testar links
```

---

## 🚀 Processo de Release

### **Checklist de Release:**

- [ ] **1. Preparação**
  - Revisar todas as mudanças desde última release
  - Atualizar CHANGELOG com mudanças
  - Verificar que todos os testes passam
  - Validar documentação atualizada

- [ ] **2. Validação Final**
  - Executar checklist de qualidade completo
  - Testar comandos principais
  - Testar agentes principais
  - Verificar integrações

- [ ] **3. Atualização de Versão**
  - Atualizar número de versão (se aplicável)
  - Atualizar data de última atualização
  - Atualizar badges e contadores

- [ ] **4. Documentação de Release**
  - Criar release notes
  - Documentar breaking changes (se houver)
  - Listar novas funcionalidades
  - Listar bugs corrigidos

- [ ] **5. Publicação**
  - Merge para branch principal
  - Tag de versão (se aplicável)
  - Anunciar mudanças (se aplicável)

---

## 🔍 Troubleshooting

### **Problemas Comuns e Soluções:**

#### **1. Links Quebrados**
**Problema:** Links não resolvem ou retornam 404  
**Solução:**
- Verificar caminho relativo correto
- Confirmar que arquivo existe
- Verificar nome do arquivo (case-sensitive)
- Usar `.cursor/docs/onion/` para docs do sistema

#### **2. Contadores Incorretos**
**Problema:** Badges mostram números errados  
**Solução:**
```bash
# Recontar comandos
find .cursor/commands -name "*.md" -type f ! -name "README.md" | wc -l

# Recontar agentes
find .cursor/agents -name "*.md" -type f ! -name "README.md" | wc -l

# Atualizar README.md com números corretos
```

#### **3. Nomenclatura Inconsistente**
**Problema:** Uso de `task-slug`, `feature_slug`, etc.  
**Solução:**
- Buscar todas as ocorrências
- Substituir por `<feature-slug>` (kebab-case)
- Verificar em comandos e documentação
- Atualizar exemplos

#### **4. Agente Não Encontrado**
**Problema:** `@agente-nome` não é reconhecido  
**Solução:**
- Verificar se arquivo existe em `.cursor/agents/`
- Verificar nome correto (kebab-case)
- Verificar YAML front matter
- Reiniciar Cursor se necessário

#### **5. Comando Não Funciona**
**Problema:** Comando não executa como esperado  
**Solução:**
- Verificar sintaxe do comando
- Verificar argumentos obrigatórios
- Revisar workflow do comando
- Testar com exemplos documentados
- Verificar logs de erro

---

## 📚 Referências Rápidas

### **Estrutura de Arquivos:**
```
.cursor/
├── commands/           # Comandos do sistema
│   ├── engineer/      # Comandos de engenharia
│   ├── product/       # Comandos de produto
│   ├── git/          # Comandos Git
│   ├── docs/         # Comandos de documentação
│   └── meta/         # Comandos meta
├── agents/            # Agentes especializados
│   ├── development/  # Agentes de desenvolvimento
│   ├── product/      # Agentes de produto
│   ├── review/       # Agentes de revisão
│   └── architecture/ # Agentes de arquitetura
├── docs/onion/       # Documentação do Sistema Onion
│   ├── commands-guide.md
│   ├── agents-reference.md
│   ├── engineering-flows.md
│   ├── practical-examples.md
│   ├── getting-started.md
│   ├── clickup-integration.md
│   ├── naming-conventions.md
│   └── maintenance-checklist.md (este arquivo)
└── sessions/         # Sessões de trabalho
    └── <feature-slug>/
```

### **Links Úteis:**
- [Guia de Comandos](.cursor/docs/onion/commands-guide.md)
- [Agentes Disponíveis](.cursor/docs/onion/agents-reference.md)
- [Fluxos de Engenharia](.cursor/docs/onion/engineering-flows.md)
- [Exemplos Práticos](.cursor/docs/onion/practical-examples.md)
- [Configuração Inicial](.cursor/docs/onion/getting-started.md)
- [Integração ClickUp](.cursor/docs/onion/clickup-integration.md)
- [Padrões de Nomenclatura](.cursor/docs/onion/naming-conventions.md)

---

**Última atualização:** 2025-10-27  
**Versão:** 2.0 (Cursor v2)  
**Mantido por:** Sistema Onion Team

