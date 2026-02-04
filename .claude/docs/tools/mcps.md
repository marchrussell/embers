# 🔌 Ferramentas MCP (Model Context Protocol)

## 📑 Índice
- [ClickUp MCP](#clickup-mcp)
- [Postman MCP](#postman-mcp)
- [Nx MCP](#nx-mcp)

---

## ClickUp MCP

### 🔍 Busca e Consulta

#### `mcp_ClickUp_clickup_search`
```typescript
function clickup_search(params: {
  keywords: string;
  workspace_id?: string;
  filters?: {
    asset_types?: Array<'task' | 'doc' | 'whiteboard' | 'dashboard' | 'attachment' | 'chat'>;
    assignees?: Array<string | number>;
    creators?: Array<string | number>;
    task_statuses?: Array<'unstarted' | 'active' | 'done' | 'closed' | 'archived'>;
    location?: {
      projects?: Array<string | number>;
      categories?: Array<string | number>;
      subcategories?: Array<string | number>;
    };
  };
  sort?: Array<{field: 'created_at' | 'updated_at'; direction: 'asc' | 'desc'}>;
  count?: number;
  cursor?: string;
}): SearchResults
// Propósito: Busca universal no workspace ClickUp (tasks, docs, dashboards, etc)
```

#### `mcp_ClickUp_clickup_get_workspace_hierarchy`
```typescript
function clickup_get_workspace_hierarchy(params: {
  workspace_id?: string;
  cursor?: string;
  limit?: number; // default: 10, max: 50
  max_depth?: 0 | 1 | 2; // 0=spaces, 1=spaces+folders, 2=spaces+folders+lists
  space_ids?: string[];
}): WorkspaceHierarchy
// Propósito: Obtém estrutura hierárquica do workspace (spaces, folders, lists)
```

### ✅ Gestão de Tasks

#### `mcp_ClickUp_clickup_create_task`
```typescript
function clickup_create_task(params: {
  name: string;
  list_id: string;
  workspace_id?: string;
  description?: string;
  markdown_description?: string;
  assignees?: string[]; // IDs, emails, usernames, ou "me"
  due_date?: string; // timestamp ou linguagem natural
  start_date?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low' | '1' | '2' | '3' | '4';
  status?: string;
  tags?: string[];
  custom_fields?: Array<{id: string; value: any}>;
  parent?: string; // ID da task pai
  check_required_custom_fields?: boolean;
}): Task
// Propósito: Cria uma task em uma lista específica
```

#### `mcp_ClickUp_clickup_create_bulk_tasks`
```typescript
function clickup_create_bulk_tasks(params: {
  list_id: string;
  tasks: Array<{
    name: string;
    description?: string;
    markdown_description?: string;
    assignees?: string[];
    due_date?: string;
    priority?: 'urgent' | 'high' | 'normal' | 'low' | '1' | '2' | '3' | '4' | null;
    status?: string;
    tags?: string[];
    custom_fields?: Array<{id: string; value: any}>;
    parent?: string;
  }>;
  workspace_id?: string;
  options?: {
    batchSize?: number; // default: 10
    concurrency?: number; // default: 3
    continueOnError?: boolean;
    retryCount?: number;
  };
}): BulkTaskResults
// Propósito: Cria múltiplas tasks eficientemente em lote
```

#### `mcp_ClickUp_clickup_get_task`
```typescript
function clickup_get_task(params: {
  task_id: string;
  workspace_id?: string;
  subtasks?: boolean;
  detail_level?: 'summary' | 'detailed'; // auto-switch se >50k tokens
}): Task
// Propósito: Obtém detalhes completos de uma task (suporta custom IDs)
```

#### `mcp_ClickUp_clickup_update_task`
```typescript
function clickup_update_task(params: {
  task_id: string;
  workspace_id?: string;
  name?: string;
  description?: string;
  markdown_description?: string;
  status?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low' | '1' | '2' | '3' | '4' | null;
  due_date?: string;
  start_date?: string;
  time_estimate?: string;
  assignees?: string[];
  custom_fields?: Array<{id: string; value: any}>;
}): Task
// Propósito: Atualiza propriedades de uma task existente
```

#### `mcp_ClickUp_clickup_update_bulk_tasks`
```typescript
function clickup_update_bulk_tasks(params: {
  tasks: Array<{
    task_id: string;
    name?: string;
    description?: string;
    markdown_description?: string;
    status?: string;
    priority?: 'urgent' | 'high' | 'normal' | 'low' | '1' | '2' | '3' | '4' | null;
    due_date?: string;
    start_date?: string;
    time_estimate?: string | number;
    assignees?: string[];
    custom_fields?: Array<{id: string; value: any}>;
  }>;
  workspace_id?: string;
  options?: {
    batchSize?: number;
    concurrency?: number;
    continueOnError?: boolean;
    retryCount?: number;
  };
}): BulkUpdateResults
// Propósito: Atualiza múltiplas tasks eficientemente
```

### 💬 Comentários

#### `mcp_ClickUp_clickup_get_task_comments`
```typescript
function clickup_get_task_comments(params: {
  task_id: string;
  workspace_id?: string;
  start?: number; // timestamp em milissegundos
  start_id?: string;
}): Comments
// Propósito: Obtém comentários de uma task (com paginação)
```

#### `mcp_ClickUp_clickup_create_task_comment`
```typescript
function clickup_create_task_comment(params: {
  task_id: string;
  comment_text: string;
  workspace_id?: string;
  notify_all?: boolean;
  assignee?: number;
}): Comment
// Propósito: Cria comentário em uma task
```

#### `mcp_ClickUp_clickup_attach_task_file`
```typescript
function clickup_attach_task_file(params: {
  task_id: string;
  workspace_id?: string;
  file_data?: string; // base64 sem prefix
  file_name?: string; // obrigatório com file_data
  file_url?: string; // http:// ou https://
  auth_header?: string;
}): Attachment
// Propósito: Anexa arquivo a uma task (base64 ou URL)
```

### ⏱️ Time Tracking

#### `mcp_ClickUp_clickup_get_task_time_entries`
```typescript
function clickup_get_task_time_entries(params: {
  task_id: string;
  workspace_id?: string;
  start_date?: string;
  end_date?: string;
}): TimeEntries
// Propósito: Obtém todas as entradas de tempo de uma task
```

#### `mcp_ClickUp_clickup_start_time_tracking`
```typescript
function clickup_start_time_tracking(params: {
  task_id: string;
  workspace_id?: string;
  description?: string;
  billable?: boolean;
  tags?: string[];
}): TimeEntry
// Propósito: Inicia rastreamento de tempo em uma task (apenas um timer ativo por vez)
```

#### `mcp_ClickUp_clickup_stop_time_tracking`
```typescript
function clickup_stop_time_tracking(params: {
  workspace_id?: string;
  description?: string;
  tags?: string[];
}): TimeEntry
// Propósito: Para o timer de tempo atualmente ativo
```

#### `mcp_ClickUp_clickup_add_time_entry`
```typescript
function clickup_add_time_entry(params: {
  task_id: string;
  start: string;
  workspace_id?: string;
  duration?: string; // 'Xh Ym' ou minutos
  end_time?: string; // requer duration OU end_time
  description?: string;
  billable?: boolean;
  tags?: string[];
}): TimeEntry
// Propósito: Adiciona entrada de tempo manual (passado)
```

#### `mcp_ClickUp_clickup_get_current_time_entry`
```typescript
function clickup_get_current_time_entry(params: {
  workspace_id?: string;
}): TimeEntry | null
// Propósito: Obtém o timer de tempo atualmente ativo
```

### 📋 Listas e Folders

#### `mcp_ClickUp_clickup_create_list`
```typescript
function clickup_create_list(params: {
  name: string;
  space_name?: string;
  space_id?: string; // usar space_name OU space_id
  workspace_id?: string;
  content?: string;
  due_date?: string;
  priority?: 1 | 2 | 3 | 4;
  assignee?: number;
  status?: string;
}): List
// Propósito: Cria lista em um space (resolve nome automaticamente)
```

#### `mcp_ClickUp_clickup_create_list_in_folder`
```typescript
function clickup_create_list_in_folder(params: {
  name: string;
  folder_id: string;
  workspace_id?: string;
  content?: string;
  status?: string;
}): List
// Propósito: Cria lista dentro de um folder
```

#### `mcp_ClickUp_clickup_get_list`
```typescript
function clickup_get_list(params: {
  list_id?: string;
  list_name?: string;
  workspace_id?: string;
}): List
// Propósito: Obtém detalhes de uma lista (por ID ou nome)
```

#### `mcp_ClickUp_clickup_update_list`
```typescript
function clickup_update_list(params: {
  list_id: string;
  workspace_id?: string;
  name?: string;
  content?: string;
  status?: string;
}): List
// Propósito: Atualiza propriedades de uma lista
```

#### `mcp_ClickUp_clickup_create_folder`
```typescript
function clickup_create_folder(params: {
  name: string;
  space_id?: string;
  space_name?: string;
  workspace_id?: string;
  override_statuses?: boolean;
}): Folder
// Propósito: Cria folder em um space
```

#### `mcp_ClickUp_clickup_get_folder`
```typescript
function clickup_get_folder(params: {
  folder_id?: string;
  folder_name?: string;
  space_id?: string;
  space_name?: string;
  workspace_id?: string;
}): Folder
// Propósito: Obtém detalhes de um folder (por ID ou nome)
```

#### `mcp_ClickUp_clickup_update_folder`
```typescript
function clickup_update_folder(params: {
  folder_id: string;
  workspace_id?: string;
  name?: string;
  override_statuses?: boolean;
}): Folder
// Propósito: Atualiza propriedades de um folder
```

### 🏷️ Tags

#### `mcp_ClickUp_clickup_add_tag_to_task`
```typescript
function clickup_add_tag_to_task(params: {
  task_id: string;
  tag_name: string;
  workspace_id?: string;
}): void
// Propósito: Adiciona tag existente a uma task
```

#### `mcp_ClickUp_clickup_remove_tag_from_task`
```typescript
function clickup_remove_tag_from_task(params: {
  task_id: string;
  tag_name: string;
  workspace_id?: string;
}): void
// Propósito: Remove tag de uma task
```

### 👥 Membros

#### `mcp_ClickUp_clickup_get_workspace_members`
```typescript
function clickup_get_workspace_members(params: {
  workspace_id?: string;
}): Members[]
// Propósito: Lista todos os membros do workspace
```

#### `mcp_ClickUp_clickup_find_member_by_name`
```typescript
function clickup_find_member_by_name(params: {
  name_or_email: string;
  workspace_id?: string;
}): Member | null
// Propósito: Busca membro por nome ou email
```

#### `mcp_ClickUp_clickup_resolve_assignees`
```typescript
function clickup_resolve_assignees(params: {
  assignees: string[];
  workspace_id?: string;
}): Array<string | null>
// Propósito: Converte nomes/emails em IDs de usuário
```

### 💬 Chat

#### `mcp_ClickUp_clickup_get_chat_channels`
```typescript
function clickup_get_chat_channels(params: {
  workspace_id?: string;
  cursor?: string;
}): ChatChannels
// Propósito: Lista canais de chat do workspace
```

#### `mcp_ClickUp_clickup_send_chat_message`
```typescript
function clickup_send_chat_message(params: {
  channel_id: string;
  content: string;
  workspace_id?: string;
  content_format?: 'text/md' | 'text/plain';
  type?: 'message' | 'post';
  post_title?: string;
  post_subtype_id?: string;
  assignee?: string;
  group_assignee?: string;
  followers?: string[];
}): ChatMessage
// Propósito: Envia mensagem em canal de chat
```

### 📄 Documentos

#### `mcp_ClickUp_clickup_create_document`
```typescript
function clickup_create_document(params: {
  name: string;
  parent: {
    id: string;
    type: '4' | '5' | '6' | '7' | '12'; // space, folder, list, everything, workspace
  };
  visibility: 'PUBLIC' | 'PRIVATE';
  create_page: boolean;
  workspace_id?: string;
}): Document
// Propósito: Cria documento no ClickUp
```

#### `mcp_ClickUp_clickup_list_document_pages`
```typescript
function clickup_list_document_pages(params: {
  document_id: string;
  workspace_id?: string;
  max_page_depth?: number; // -1 para ilimitado
}): DocumentPages
// Propósito: Lista páginas de um documento
```

#### `mcp_ClickUp_clickup_get_document_pages`
```typescript
function clickup_get_document_pages(params: {
  document_id: string;
  page_ids: string[];
  workspace_id?: string;
  content_format?: 'text/md' | 'text/html';
}): PageContents
// Propósito: Obtém conteúdo de páginas específicas
```

#### `mcp_ClickUp_clickup_create_document_page`
```typescript
function clickup_create_document_page(params: {
  document_id: string;
  name: string;
  content: string;
  workspace_id?: string;
  content_format?: 'text/md' | 'text/plain';
  sub_title?: string;
  parent_page_id?: string;
}): DocumentPage
// Propósito: Cria página em um documento
```

#### `mcp_ClickUp_clickup_update_document_page`
```typescript
function clickup_update_document_page(params: {
  document_id: string;
  page_id: string;
  workspace_id?: string;
  name?: string;
  sub_title?: string;
  content?: string;
  content_format?: 'text/md' | 'text/plain';
  content_edit_mode?: 'replace' | 'append' | 'prepend';
}): DocumentPage
// Propósito: Atualiza página de documento (com modos de edição)
```

### 📊 Recursos MCP Gerais

#### `list_mcp_resources`
```typescript
function list_mcp_resources(params: {
  server?: string; // Filtrar por servidor específico
}): MCPResources[]
// Propósito: Lista recursos disponíveis de servidores MCP configurados
```

#### `fetch_mcp_resource`
```typescript
function fetch_mcp_resource(params: {
  server: string;
  uri: string;
  downloadPath?: string; // Caminho relativo para salvar recurso
}): ResourceContent
// Propósito: Busca recurso específico de servidor MCP
```

---

## Postman MCP

### 📦 Collections

#### `mcp_Postman_createCollection`
```typescript
function createCollection(params: {
  workspace: string;
  collection: {
    info: {
      name: string;
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';
      description?: string;
    };
    item: Array<any>; // requests/folders
    auth?: AuthConfig;
    event?: EventScript[];
    variable?: Variable[];
  };
}): Collection
// Propósito: Cria collection no Postman (formato v2.1.0)
```

#### `mcp_Postman_getCollection`
```typescript
function getCollection(params: {
  collectionId: string; // formato: OWNER_ID-UUID
  access_key?: string;
  model?: 'minimal';
}): Collection
// Propósito: Obtém informações de uma collection
```

#### `mcp_Postman_getCollections`
```typescript
function getCollections(params: {
  workspace: string; // OBRIGATÓRIO
  name?: string;
  limit?: number;
  offset?: number;
}): Collections[]
// Propósito: Lista collections de um workspace
```

#### `mcp_Postman_deleteCollection`
```typescript
function deleteCollection(params: {
  collectionId: string;
}): void
// Propósito: Deleta uma collection
```

#### `mcp_Postman_duplicateCollection`
```typescript
function duplicateCollection(params: {
  collectionId: string;
  workspace: string;
  suffix?: string;
}): DuplicationTask
// Propósito: Duplica collection para outro workspace
```

### 📁 Folders & Requests

#### `mcp_Postman_createCollectionFolder`
```typescript
function createCollectionFolder(params: {
  collectionId: string;
  folder?: string; // ID do folder pai
  name?: string;
}): Folder
// Propósito: Cria folder em uma collection
```

#### `mcp_Postman_createCollectionRequest`
```typescript
function createCollectionRequest(params: {
  collectionId: string;
  folderId?: string;
  name?: string;
}): Request
// Propósito: Cria request em uma collection/folder
```

#### `mcp_Postman_createCollectionResponse`
```typescript
function createCollectionResponse(params: {
  collectionId: string;
  requestId: string;
  name?: string;
}): Response
// Propósito: Cria resposta para um request
```

### 💬 Comentários

#### `mcp_Postman_createCollectionComment`
```typescript
function createCollectionComment(params: {
  collectionId: string;
  body: string; // max 10k caracteres
  tags?: {[userName: string]: {type: 'user'; id: string}};
  threadId?: number;
}): Comment
// Propósito: Cria comentário em collection
```

### 🌍 Environments

#### `mcp_Postman_createEnvironment`
```typescript
function createEnvironment(params: {
  workspace: string;
  environment: {
    name: string;
    values?: Array<{
      key?: string;
      value?: string;
      type?: 'secret' | 'default';
      enabled?: boolean;
      description?: string;
    }>;
  };
}): Environment
// Propósito: Cria environment (max 30MB)
```

#### `mcp_Postman_getEnvironment`
```typescript
function getEnvironment(params: {
  environmentId: string;
}): Environment
// Propósito: Obtém detalhes de um environment
```

#### `mcp_Postman_getEnvironments`
```typescript
function getEnvironments(params: {
  workspace?: string;
}): Environments[]
// Propósito: Lista todos os environments
```

### 🔨 Mocks & Monitors

#### `mcp_Postman_createMock`
```typescript
function createMock(params: {
  workspace: string;
  mock: {
    collection: string; // UID: ownerId-collectionId
    name?: string;
    environment?: string;
    private?: boolean;
  };
}): Mock
// Propósito: Cria mock server (requer collection UID)
```

#### `mcp_Postman_getMock`
```typescript
function getMock(params: {
  mockId: string;
}): Mock
// Propósito: Obtém detalhes de um mock server
```

#### `mcp_Postman_getMocks`
```typescript
function getMocks(params: {
  workspace?: string;
  teamId?: string;
}): Mocks[]
// Propósito: Lista mock servers (preferir workspace)
```

#### `mcp_Postman_createMonitor`
```typescript
function createMonitor(params: {
  workspace: string;
  monitor: {
    name: string;
    collection: string;
    schedule: {
      cron: string;
      timezone?: string;
    };
    environment?: string;
    distribution?: Array<{region: string}>;
  };
}): Monitor
// Propósito: Cria monitor de collection
```

### 📋 Specs

#### `mcp_Postman_createSpec`
```typescript
function createSpec(params: {
  workspaceId: string;
  name: string;
  type: 'OPENAPI:3.0' | 'ASYNCAPI:2.0';
  files: Array<{
    path: string;
    content: string;
    type?: 'ROOT' | 'DEFAULT';
  }>;
}): Spec
// Propósito: Cria spec no Spec Hub (single/multi-file, max 10MB)
```

#### `mcp_Postman_generateCollection`
```typescript
function generateCollection(params: {
  specId: string;
  elementType: 'collection';
  name: string;
  options?: {
    folderStrategy?: 'Paths' | 'Tags';
    enableOptionalParameters?: boolean;
    // ... mais opções de conversão
  };
}): GenerationTask
// Propósito: Gera collection de uma spec (retorna polling link)
```

### 👤 User

#### `mcp_Postman_getAuthenticatedUser`
```typescript
function getAuthenticatedUser(): User
// Propósito: Obtém informações do usuário autenticado (ID, username, teamId)
```

---

## Nx MCP

### 📊 Workspace

#### `nx_workspace`
```typescript
function nx_workspace(): WorkspaceInfo
// Propósito: Obtém visão geral do workspace Nx (projetos, erros, configuração)
```

#### `nx_project_details`
```typescript
function nx_project_details(params: {
  projectName: string;
}): ProjectDetails
// Propósito: Obtém detalhes específicos de um projeto Nx
```

### 🎨 Generators

#### `nx_generators`
```typescript
function nx_generators(params: {
  pluginName?: string;
}): Generator[]
// Propósito: Lista generators disponíveis (opcionalmente filtrado por plugin)
```

#### `nx_generator_schema`
```typescript
function nx_generator_schema(params: {
  generatorName: string;
}): GeneratorSchema
// Propósito: Obtém schema de um generator específico
```

#### `nx_open_generate_ui`
```typescript
function nx_open_generate_ui(params: {
  generatorName: string;
  options?: Record<string, any>;
}): void
// Propósito: Abre UI do generator no Nx Console
```

#### `nx_read_generator_log`
```typescript
function nx_read_generator_log(): GeneratorLog
// Propósito: Lê log do último generator executado
```

### 🔌 Plugins

#### `nx_available_plugins`
```typescript
function nx_available_plugins(): Plugin[]
// Propósito: Lista plugins Nx disponíveis para instalação
```

### 📈 Visualização

#### `nx_visualize_graph`
```typescript
function nx_visualize_graph(params: {
  target?: string;
  depth?: number;
}): void
// Propósito: Visualiza grafo de dependências do projeto
```

### 📚 Documentação

#### `nx_docs`
```typescript
function nx_docs(params: {
  query: string;
}): DocsResults
// Propósito: Busca documentação Nx relevante
```

### ☁️ Nx Cloud

#### `nx_cloud_cipe_details`
```typescript
function nx_cloud_cipe_details(): CIPEDetails[]
// Propósito: Lista execuções de CI Pipeline (CIPEs) atuais
```

#### `nx_cloud_fix_cipe_failure`
```typescript
function nx_cloud_fix_cipe_failure(params: {
  taskId: string;
}): TaskLogs
// Propósito: Obtém logs de falha de task no CI para debugging
```

---

## 📊 Resumo

| Categoria | Ferramentas | Uso Principal |
|-----------|-------------|---------------|
| **ClickUp** | 50+ funções | Gestão de projeto, tasks, time tracking |
| **Postman** | 30+ funções | APIs, collections, mocks, monitoring |
| **Nx** | 10+ funções | Monorepo, generators, CI/CD |

### 🎯 Dicas de Uso

1. **ClickUp**: Sempre use `workspace_id` automático, suporta linguagem natural em datas
2. **Postman**: Requires collection UID (ownerId-collectionId) para alguns endpoints
3. **Nx**: Use `nx_docs` quando incerto sobre configurações

### 🔗 Recursos Relacionados
- [Agentes Especializados](./agents.md)
- [Comandos .cursor/](./commands.md)
- [Regras do Workspace](./rules.md)

