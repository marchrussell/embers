# 🛠️ Ferramentas Core do Cursor

## 📑 Índice
- [Codebase Operations](#codebase-operations)
- [File Operations](#file-operations)
- [Terminal Operations](#terminal-operations)
- [Search Operations](#search-operations)
- [Linting & Validation](#linting--validation)
- [Notebook Operations](#notebook-operations)
- [Task Management](#task-management)
- [Memory Management](#memory-management)

---

## Codebase Operations

### `codebase_search`
```typescript
function codebase_search(params: {
  query: string;              // Pergunta completa sobre o que buscar
  target_directories: string[]; // [] para buscar em todo repo, ou path específico
  explanation: string;
  search_only_prs?: boolean;
}): SearchResults
// Propósito: Busca semântica no codebase por significado, não texto exato
```

**Quando Usar:**
- ✅ Explorar codebase desconhecido
- ✅ Perguntas "como/onde/o que" sobre comportamento
- ✅ Buscar código por significado
- ❌ NÃO para texto exato (use `grep`)
- ❌ NÃO para ler arquivos conhecidos (use `read_file`)
- ❌ NÃO para símbolos simples (use `grep`)

**Exemplos:**
```typescript
// ✅ Bom
codebase_search({
  query: "Where is interface MyInterface implemented in the frontend?",
  target_directories: ["frontend/"],
  explanation: "Finding implementation locations"
})

// ✅ Bom
codebase_search({
  query: "Where do we encrypt user passwords before saving?",
  target_directories: [],
  explanation: "Understanding password encryption flow"
})

// ❌ Ruim - muito vago
codebase_search({
  query: "MyInterface frontend",
  target_directories: [],
  explanation: "..."
})

// ❌ Ruim - use grep
codebase_search({
  query: "AuthService",
  target_directories: [],
  explanation: "..."
})
```

**Estratégia de Busca:**
1. Comece com queries exploratórias amplas
2. Revise resultados
3. Refine com target_directory específico se necessário
4. Quebre perguntas grandes em menores
5. Para arquivos >1K linhas, use `codebase_search` ou `grep`

---

## File Operations

### `read_file`
```typescript
function read_file(params: {
  target_file: string;  // Path relativo ou absoluto
  offset?: number;      // Linha inicial (opcional)
  limit?: number;       // Número de linhas (opcional)
}): FileContents
// Propósito: Lê arquivo do filesystem (texto ou imagem)
```

**Suporte:**
- 📄 Arquivos de texto
- 🖼️ Imagens (jpeg, png, gif, webp)
- 📊 Notebooks (via read_file, edite via edit_notebook)

**Formato de Output:**
```
LINE_NUMBER|LINE_CONTENT
```

**Dica:** Para múltiplos arquivos, use chamadas paralelas!

### `write`
```typescript
function write(params: {
  file_path: string;
  contents: string;
}): void
// Propósito: Cria ou sobrescreve arquivo completamente
```

**⚠️ Avisos:**
- Sobrescreve arquivo existente
- Se existir, DEVE ler com `read_file` primeiro
- SEMPRE prefira editar arquivos existentes
- NUNCA crie docs (*.md) proativamente

### `search_replace`
```typescript
function search_replace(params: {
  file_path: string;
  old_string: string;    // Deve ser único no arquivo
  new_string: string;
  replace_all?: boolean; // Para renomear/substituir todas ocorrências
}): void
// Propósito: Substituições exatas de string em arquivos
```

**Regras Críticas:**
- ✅ Preservar indentação exata (tabs/spaces)
- ✅ SEMPRE prefira editar arquivos existentes
- ✅ Use emojis APENAS se usuário pedir
- ❌ Falha se `old_string` não for único
- ✅ Use `replace_all` para renomear variáveis

### `delete_file`
```typescript
function delete_file(params: {
  target_file: string;
  explanation: string;
}): void
// Propósito: Deleta arquivo do filesystem
```

**Uso:** Cleanup de arquivos temporários, scripts helper, etc.

### `list_dir`
```typescript
function list_dir(params: {
  target_directory: string;
  ignore_globs?: string[]; // Padrões glob para ignorar
}): DirectoryListing
// Propósito: Lista arquivos e diretórios
```

**Nota:** Não mostra dot-files e dot-directories por padrão

### `glob_file_search`
```typescript
function glob_file_search(params: {
  glob_pattern: string;      // Auto-prepend com **/ se necessário
  target_directory?: string;
}): FilePaths[]
// Propósito: Busca arquivos por padrão de nome
```

**Exemplos:**
```typescript
// Encontrar todos .js
glob_file_search({glob_pattern: "*.js"})

// Encontrar node_modules
glob_file_search({glob_pattern: "**/node_modules/**"})

// Encontrar test files
glob_file_search({glob_pattern: "**/test/**/test_*.ts"})
```

---

## Terminal Operations

### `run_terminal_cmd`
```typescript
function run_terminal_cmd(params: {
  command: string;
  is_background: boolean;
  explanation?: string;
}): CommandOutput
// Propósito: Executa comando no terminal
```

**Diretrizes:**
1. ✅ Se shell novo: `cd` para diretório apropriado + setup
2. ✅ Se mesmo shell: Verifique working directory no histórico
3. ✅ Comandos interativos: Use flags não-interativos (--yes)
4. ✅ Long-running: Use `is_background: true`
5. ❌ NUNCA atualize git config
6. ❌ NUNCA force push/hard reset (a menos que explícito)
7. ❌ NUNCA skip hooks (--no-verify) sem pedido explícito
8. ❌ NUNCA force push para main/master
9. ❌ NUNCA commit sem pedido explícito do usuário

**Preferir Ferramentas Especializadas:**
- ❌ NÃO use cat/head/tail para ler arquivos → `read_file`
- ❌ NÃO use sed/awk para editar → `search_replace`
- ❌ NÃO use cat/echo para criar arquivos → `write`
- ✅ Reserve terminal para comandos de sistema reais

**⚠️ NUNCA use echo para comunicar ao usuário!**

---

## Search Operations

### `grep`
```typescript
function grep(params: {
  pattern: string;        // Regex pattern (ripgrep syntax)
  path?: string;          // Arquivo ou diretório
  output_mode?: 'content' | 'files_with_matches' | 'count';
  type?: string;          // js, py, rust, go, java, etc
  glob?: string;          // "*.js", "*.{ts,tsx}"
  multiline?: boolean;    // Para patterns multi-linha
  '-i'?: boolean;         // Case insensitive
  '-A'?: number;          // Linhas após match
  '-B'?: number;          // Linhas antes match
  '-C'?: number;          // Linhas antes e depois
  '-n'?: boolean;         // Números de linha
  head_limit?: number;    // Limitar output
}): GrepResults
// Propósito: Busca poderosa por texto exato/regex (ripgrep)
```

**Quando Usar:**
- ✅ Busca exata de símbolos/strings
- ✅ Regex patterns
- ✅ Mais rápido que terminal grep

**Notas:**
- Respeita .gitignore/.cursorignore
- Suporta regex completo
- Pattern syntax: ripgrep (não grep)
- Braces literais precisam escape: `interface\{\}`
- Multiline: false por padrão
- Output pode ser truncado

**Formato de Output:**
```
'-' para linhas de contexto
':' para linhas de match
Agrupado por arquivo
```

---

## Linting & Validation

### `read_lints`
```typescript
function read_lints(params: {
  paths?: string[]; // Arquivos/diretórios, ou [] para tudo
}): LinterErrors[]
// Propósito: Lê erros de linter do workspace
```

**⚠️ Avisos:**
- Pode retornar erros pré-existentes
- Evite escopo muito amplo
- NUNCA chame em arquivo que não editou
- Pode incluir arquivos unsaved/out-of-workspace

---

## Notebook Operations

### `edit_notebook`
```typescript
function edit_notebook(params: {
  target_notebook: string;
  cell_idx: number;          // 0-based
  is_new_cell: boolean;      // CRÍTICO: true para criar, false para editar
  cell_language: string;     // python, markdown, javascript, etc
  old_string: string;        // Vazio se is_new_cell=true
  new_string: string;        // SEMPRE obrigatório
}): void
// Propósito: Edita ou cria células em Jupyter notebooks
```

**Linguagens Suportadas:**
- `python`, `markdown`, `javascript`, `typescript`
- `r`, `sql`, `shell`, `raw`, `other`

**Regras Críticas:**
1. ✅ Índices são 0-based
2. ✅ Conteúdo SEM sintaxe JSON do notebook
3. ✅ `old_string` DEVE ser único (3-5 linhas contexto)
4. ✅ Uma mudança por vez
5. ✅ Markdown pode ser salvo como "raw" (OK)
6. ❌ NÃO suporta deletar células (use new_string vazio)
7. ✅ Para novo notebook: is_new_cell=true, cell_idx=0
8. ✅ SEMPRE gere argumentos na ordem: target_notebook, cell_idx, is_new_cell, cell_language, old_string, new_string

---

## Task Management

### `todo_write`
```typescript
function todo_write(params: {
  merge: boolean;
  todos: Array<{
    id: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }>;
}): void
// Propósito: Cria e gerencia lista de TODOs estruturada
```

**Quando Usar:**
- ✅ Tarefas complexas (3+ passos)
- ✅ Tarefas não-triviais
- ✅ Usuário pede lista de TODO
- ✅ Múltiplas tarefas do usuário
- ✅ Após novas instruções (merge=false)
- ✅ Após completar tasks (merge=true)
- ✅ Ao iniciar nova task (mark in_progress)

**Quando NÃO Usar:**
- ❌ Tarefas únicas e diretas
- ❌ Tarefas triviais (<3 passos)
- ❌ Requests conversacionais
- ❌ Ações operacionais (linting, testing, searching)

**Estados:**
- `pending` - Não iniciado
- `in_progress` - Trabalhando (APENAS UM por vez)
- `completed` - Finalizado (marcar IMEDIATAMENTE)
- `cancelled` - Não mais necessário

**Gestão:**
- ✅ Atualizar status em tempo real
- ✅ Marcar complete IMEDIATAMENTE após finalizar
- ✅ Apenas UMA task in_progress por vez
- ✅ Completar tasks antes de iniciar novas
- ✅ Criar itens específicos e acionáveis
- ✅ Usar nomes descritivos

**Paralelismo:**
- ✅ Preferir criar primeiro todo como in_progress
- ✅ Iniciar trabalho com tool calls no mesmo batch
- ✅ Agrupar todo updates com outras tool calls

---

## Memory Management

### `update_memory`
```typescript
function update_memory(params: {
  action: 'create' | 'update' | 'delete';
  title?: string;            // Para create/update
  knowledge_to_store?: string; // Para create/update
  existing_knowledge_id?: string; // Para update/delete
}): void
// Propósito: Cria/atualiza/deleta memórias persistentes para IA
```

**Quando Usar:**
- ✅ Usuário pede para lembrar algo
- ✅ Usuário augmenta memória existente (action=update)
- ✅ Usuário contradiz memória (action=delete)
- ❌ NÃO criar memórias de planos de implementação
- ❌ NÃO criar memórias de migrações completadas
- ❌ NÃO criar memórias de tarefas específicas

**Regras:**
- ✅ update_memory COM action se usuário augmenta
- ✅ update_memory COM delete se usuário contradiz
- ❌ Sem ação = default 'create'
- ✅ Se dúvida entre update/delete, prefira delete

**Citação de Memórias:**
```markdown
Formato: [[memory:MEMORY_ID]]
Exemplo: "Vou usar -la flag [[memory:3004810]] para mostrar detalhes"
```

---

## Web & MCP Operations

### `web_search`
```typescript
function web_search(params: {
  search_term: string;
  explanation: string;
}): SearchResults
// Propósito: Busca web para informações em tempo real
```

**Quando Usar:**
- Informações atualizadas não no training data
- Verificar fatos atuais
- Perguntas sobre eventos atuais
- Updates de tecnologia
- Tópicos que requerem informação recente

### `list_mcp_resources` / `fetch_mcp_resource`
```typescript
function list_mcp_resources(params: {
  server?: string; // Filtrar por servidor
}): MCPResources[]

function fetch_mcp_resource(params: {
  server: string;
  uri: string;
  downloadPath?: string; // Salvar em disco
}): ResourceContent
// Propósito: Acessa recursos de servidores MCP configurados
```

---

## 🎯 Melhores Práticas

### Paralelização
```typescript
// ✅ Bom - lê 3 arquivos em paralelo
Promise.all([
  read_file({target_file: "file1.ts"}),
  read_file({target_file: "file2.ts"}),
  read_file({target_file: "file3.ts"})
])

// ❌ Ruim - sequencial desnecessário
read_file({target_file: "file1.ts"})
// espera...
read_file({target_file: "file2.ts"})
// espera...
read_file({target_file: "file3.ts"})
```

### Quando NÃO Paralelizar
```typescript
// ❌ NÃO paralelizar se dependente
const userId = getUserId();        // Precisa completar primeiro
const userData = getUser(userId);  // Depende do userId
```

### Fluxo de Trabalho Típico
```typescript
// 1. Buscar contexto
codebase_search({query: "How does auth work?"})

// 2. Ler arquivos relevantes
read_file({target_file: "auth/service.ts"})

// 3. Editar
search_replace({
  file_path: "auth/service.ts",
  old_string: "old implementation",
  new_string: "new implementation"
})

// 4. Validar
read_lints({paths: ["auth/service.ts"]})

// 5. Testar
run_terminal_cmd({
  command: "npm test auth/service.test.ts",
  is_background: false
})
```

---

## 📊 Resumo de Uso

| Categoria | Ferramenta Principal | Uso |
|-----------|---------------------|-----|
| **Busca Semântica** | `codebase_search` | Explorar/entender código |
| **Busca Exata** | `grep` | Símbolos, regex patterns |
| **Ler Arquivo** | `read_file` | Texto, imagens, notebooks |
| **Editar Arquivo** | `search_replace` | Modificações precisas |
| **Criar Arquivo** | `write` | Novos arquivos |
| **Terminal** | `run_terminal_cmd` | Comandos sistema |
| **Validação** | `read_lints` | Erros de linter |
| **Notebooks** | `edit_notebook` | Células Jupyter |
| **Tasks** | `todo_write` | Gestão de tarefas |
| **Memória** | `update_memory` | Aprendizados persistentes |

---

## 🔗 Recursos Relacionados
- [Ferramentas MCP](./mcps.md)
- [Agentes Especializados](./agents.md)
- [Comandos .cursor/](./commands.md)
- [Regras do Workspace](./rules.md)

