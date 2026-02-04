# 🏭 Factory - Task Manager

## 🎯 Propósito

Fornece uma factory para instanciar o adapter correto baseado na configuração do ambiente, abstraindo a criação e permitindo uso simplificado nos comandos.

---

## 📋 Função Principal

### getTaskManager()

```typescript
/**
 * Retorna uma instância do TaskManager configurado.
 * Baseado em TASK_MANAGER_PROVIDER no .env
 * 
 * @param options - Opções de configuração (opcional)
 * @returns Instância do adapter apropriado
 * 
 * @example
 * const tm = getTaskManager();
 * const task = await tm.createTask({ name: 'Nova Task' });
 */
function getTaskManager(options?: FactoryOptions): ITaskManager {
  const config = detectProvider();
  
  // Log de debug (se habilitado)
  if (options?.debug) {
    console.log(`[TaskManager] Provider: ${config.provider}`);
    console.log(`[TaskManager] Configured: ${config.isConfigured}`);
  }
  
  // Se não está configurado, decidir comportamento
  if (!config.isConfigured) {
    if (options?.throwOnMisconfigured) {
      throw new Error(config.errorMessage || 'Provider not configured');
    }
    
    // Aviso e fallback para NoProviderAdapter
    console.warn(`⚠️ ${config.errorMessage}`);
    console.warn(`💡 Continuando em modo offline...`);
    return new NoProviderAdapter();
  }
  
  // Instanciar adapter apropriado
  switch (config.provider) {
    case 'clickup':
      return new ClickUpAdapter({
        apiToken: process.env.CLICKUP_API_TOKEN!,
        workspaceId: process.env.CLICKUP_WORKSPACE_ID,
        defaultListId: process.env.CLICKUP_DEFAULT_LIST_ID
      });
      
    case 'asana':
      return new AsanaAdapter({
        accessToken: process.env.ASANA_ACCESS_TOKEN!,
        workspaceId: process.env.ASANA_WORKSPACE_ID,
        defaultProjectId: process.env.ASANA_DEFAULT_PROJECT_ID
      });
      
    case 'linear':
      return new LinearAdapter({
        apiKey: process.env.LINEAR_API_KEY!,
        teamId: process.env.LINEAR_TEAM_ID
      });
      
    case 'none':
    default:
      return new NoProviderAdapter();
  }
}
```

---

## ⚙️ Tipos da Factory

```typescript
/**
 * Opções para a factory.
 */
interface FactoryOptions {
  /** Habilita logs de debug */
  debug?: boolean;
  
  /** Lança erro se provedor não configurado (ao invés de fallback) */
  throwOnMisconfigured?: boolean;
  
  /** Força um provedor específico (ignora .env) */
  forceProvider?: TaskManagerProvider;
}

/**
 * Configuração para ClickUp Adapter.
 */
interface ClickUpAdapterConfig {
  apiToken: string;
  workspaceId?: string;
  defaultListId?: string;
}

/**
 * Configuração para Asana Adapter.
 */
interface AsanaAdapterConfig {
  accessToken: string;
  workspaceId?: string;
  defaultProjectId?: string;
}

/**
 * Configuração para Linear Adapter.
 */
interface LinearAdapterConfig {
  apiKey: string;
  teamId?: string;
}
```

---

## 🔄 Funções Auxiliares

### getTaskManagerOrFail()

```typescript
/**
 * Versão da factory que lança erro se não configurado.
 * Útil para comandos que REQUEREM um provedor.
 * 
 * @throws Error se provedor não configurado
 */
function getTaskManagerOrFail(): ITaskManager {
  return getTaskManager({ throwOnMisconfigured: true });
}
```

### getTaskManagerWithWarning()

```typescript
/**
 * Versão da factory que mostra warning formatado.
 * Útil para comandos que podem funcionar sem provedor.
 * 
 * @returns Adapter + flag indicando se está em modo offline
 */
function getTaskManagerWithWarning(): {
  taskManager: ITaskManager;
  isOffline: boolean;
  warning?: string;
} {
  const config = detectProvider();
  const taskManager = getTaskManager();
  
  if (config.provider === 'none' || !config.isConfigured) {
    return {
      taskManager,
      isOffline: true,
      warning: `⚠️ MODO OFFLINE ATIVADO
━━━━━━━━━━━━━━━━━━━━━━━━
Nenhum gerenciador de tarefas configurado.

Funcionalidades disponíveis:
  ✅ Criar documentos locais
  ✅ Gerar estrutura de sessão
  ❌ Sincronizar com ClickUp/Asana/Linear
  ❌ Atualizar status de tasks

💡 Para habilitar sincronização:
   Execute /meta/setup-integration
━━━━━━━━━━━━━━━━━━━━━━━━`
    };
  }
  
  return {
    taskManager,
    isOffline: false
  };
}
```

---

## 📊 Classe Base NoProviderAdapter

```typescript
/**
 * Adapter de fallback quando nenhum provedor está configurado.
 * Permite operações locais e gera IDs locais.
 */
class NoProviderAdapter implements ITaskManager {
  readonly provider: TaskManagerProvider = 'none';
  readonly isConfigured: boolean = false;
  
  async createTask(input: CreateTaskInput): Promise<TaskOutput> {
    console.warn('⚠️ Criando task LOCAL (não sincronizada)');
    
    const localId = `local-${Date.now()}`;
    
    return {
      id: localId,
      provider: 'none',
      name: input.name,
      description: input.description || '',
      status: 'todo',
      url: '',  // Sem URL pois é local
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignees: [],
      tags: input.tags || [],
      dueDate: input.dueDate,
      priority: input.priority
    };
  }
  
  async getTask(taskId: string): Promise<TaskOutput> {
    console.warn(`⚠️ getTask('${taskId}') - Operando em modo offline`);
    throw new Error('Operação não disponível em modo offline');
  }
  
  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<TaskOutput> {
    console.warn(`⚠️ updateTask('${taskId}') - Operando em modo offline`);
    throw new Error('Operação não disponível em modo offline');
  }
  
  async deleteTask(taskId: string): Promise<boolean> {
    console.warn(`⚠️ deleteTask('${taskId}') - Operando em modo offline`);
    return false;
  }
  
  async createSubtask(parentId: string, input: CreateTaskInput): Promise<TaskOutput> {
    console.warn('⚠️ Criando subtask LOCAL (não sincronizada)');
    
    const localId = `local-${Date.now()}-sub`;
    
    return {
      id: localId,
      provider: 'none',
      name: input.name,
      description: input.description || '',
      status: 'todo',
      url: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignees: [],
      tags: input.tags || [],
      parent: parentId
    };
  }
  
  async getSubtasks(parentId: string): Promise<TaskOutput[]> {
    console.warn(`⚠️ getSubtasks('${parentId}') - Operando em modo offline`);
    return [];
  }
  
  async addComment(taskId: string, comment: string): Promise<CommentOutput> {
    console.warn(`⚠️ addComment('${taskId}') - Operando em modo offline`);
    
    return {
      id: `local-comment-${Date.now()}`,
      text: comment,
      author: { id: 'local', name: 'Local User' },
      createdAt: new Date().toISOString()
    };
  }
  
  async getComments(taskId: string): Promise<CommentOutput[]> {
    return [];
  }
  
  async updateStatus(taskId: string, status: TaskStatus): Promise<TaskOutput> {
    console.warn(`⚠️ updateStatus('${taskId}', '${status}') - Operando em modo offline`);
    throw new Error('Operação não disponível em modo offline');
  }
  
  async searchTasks(query: SearchQuery): Promise<TaskOutput[]> {
    console.warn('⚠️ searchTasks() - Operando em modo offline');
    return [];
  }
  
  async getProjectList(): Promise<ProjectOutput[]> {
    return [];
  }
  
  async getProject(projectId: string): Promise<ProjectOutput> {
    throw new Error('Operação não disponível em modo offline');
  }
  
  validateTaskId(taskId: string): boolean {
    return /^local-\d+(-sub)?$/.test(taskId);
  }
  
  getProviderFromTaskId(taskId: string): TaskManagerProvider | null {
    return detectProviderFromTaskId(taskId);
  }
}
```

---

## 🧪 Exemplos de Uso

### Uso Básico

```typescript
// Obter adapter configurado
const taskManager = getTaskManager();

// Verificar se está online
if (taskManager.isConfigured) {
  const task = await taskManager.createTask({
    name: 'Minha Task',
    description: 'Descrição'
  });
  console.log(`✅ Task criada: ${task.url}`);
} else {
  console.log('⚠️ Modo offline - task não será sincronizada');
}
```

### Uso com Validação

```typescript
// Requer provedor configurado
try {
  const taskManager = getTaskManagerOrFail();
  await taskManager.updateStatus(taskId, 'done');
} catch (error) {
  console.error('❌ Provedor não configurado');
  // Sugerir /meta/setup-integration
}
```

### Uso com Warning

```typescript
// Mostrar warning se offline
const { taskManager, isOffline, warning } = getTaskManagerWithWarning();

if (isOffline) {
  console.log(warning);
}

// Continuar com funcionalidade limitada
const task = await taskManager.createTask({
  name: 'Task pode ser local'
});
```

---

## 📚 Referências

- [Interface ITaskManager](./interface.md)
- [Detector](./detector.md)
- [Adapters](./adapters/)

---

**Versão**: 1.0.0
**Criado em**: 2025-11-24

