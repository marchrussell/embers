# 🔍 Detector de Provedor - Task Manager

## 🎯 Propósito

Detecta e valida o provedor de gerenciamento de tarefas configurado, além de identificar a origem de IDs de tasks para garantir compatibilidade.

---

## 📋 Funções Principais

### detectProvider()

```typescript
/**
 * Detecta o provedor configurado via variáveis de ambiente.
 * @returns Configuração do provedor ativo
 */
function detectProvider(): ProviderConfig {
  const provider = (process.env.TASK_MANAGER_PROVIDER || 'none') as TaskManagerProvider;
  
  const configs: Record<TaskManagerProvider, ProviderConfig> = {
    clickup: {
      provider: 'clickup',
      isConfigured: !!process.env.CLICKUP_API_TOKEN,
      requiredEnvVars: ['CLICKUP_API_TOKEN'],
      optionalEnvVars: ['CLICKUP_WORKSPACE_ID', 'CLICKUP_DEFAULT_LIST_ID'],
      errorMessage: !process.env.CLICKUP_API_TOKEN 
        ? '❌ CLICKUP_API_TOKEN não configurado. Execute /meta/setup-integration'
        : undefined
    },
    
    asana: {
      provider: 'asana',
      isConfigured: !!process.env.ASANA_ACCESS_TOKEN,
      requiredEnvVars: ['ASANA_ACCESS_TOKEN'],
      optionalEnvVars: ['ASANA_WORKSPACE_ID', 'ASANA_DEFAULT_PROJECT_ID'],
      errorMessage: !process.env.ASANA_ACCESS_TOKEN
        ? '❌ ASANA_ACCESS_TOKEN não configurado. Execute /meta/setup-integration'
        : undefined
    },
    
    linear: {
      provider: 'linear',
      isConfigured: !!process.env.LINEAR_API_KEY,
      requiredEnvVars: ['LINEAR_API_KEY'],
      optionalEnvVars: ['LINEAR_TEAM_ID'],
      errorMessage: !process.env.LINEAR_API_KEY
        ? '❌ LINEAR_API_KEY não configurado. Execute /meta/setup-integration'
        : undefined
    },
    
    none: {
      provider: 'none',
      isConfigured: true,  // Sempre "configurado" pois é o fallback
      requiredEnvVars: [],
      optionalEnvVars: [],
      errorMessage: undefined
    }
  };
  
  return configs[provider] || configs.none;
}
```

---

### detectProviderFromTaskId()

```typescript
/**
 * Detecta o provedor de origem baseado no formato do ID da task.
 * @param taskId - ID da task a analisar
 * @returns Provedor detectado ou null se formato desconhecido
 */
function detectProviderFromTaskId(taskId: string): TaskManagerProvider | null {
  if (!taskId || typeof taskId !== 'string') {
    return null;
  }
  
  const trimmedId = taskId.trim();
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CLICKUP
  // Formato: alfanumérico, 9 caracteres (ex: 86adfe9eb, abc123def)
  // ═══════════════════════════════════════════════════════════════════════════
  if (/^[a-z0-9]{9}$/i.test(trimmedId)) {
    return 'clickup';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASANA
  // Formato: numérico, 16+ dígitos (ex: 1234567890123456)
  // ═══════════════════════════════════════════════════════════════════════════
  if (/^\d{15,}$/.test(trimmedId)) {
    return 'asana';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LINEAR
  // Formatos:
  //   - Prefixo + número: ABC-123, PROJ-456
  //   - UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // ═══════════════════════════════════════════════════════════════════════════
  if (/^[A-Z]+-\d+$/.test(trimmedId)) {
    return 'linear';
  }
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(trimmedId)) {
    return 'linear';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL (gerado pelo NoProviderAdapter)
  // Formato: local-timestamp (ex: local-1732456789012)
  // ═══════════════════════════════════════════════════════════════════════════
  if (/^local-\d+$/.test(trimmedId)) {
    return 'none';
  }
  
  // Formato desconhecido
  return null;
}
```

---

### validateProviderMatch()

```typescript
/**
 * Valida se um ID de task é compatível com o provedor configurado.
 * @param taskId - ID da task a validar
 * @param currentProvider - Provedor atualmente configurado
 * @returns Resultado da validação com possível warning
 */
function validateProviderMatch(
  taskId: string, 
  currentProvider: TaskManagerProvider
): ValidationResult {
  const detectedProvider = detectProviderFromTaskId(taskId);
  
  // Formato desconhecido - assumir válido
  if (!detectedProvider) {
    return { 
      valid: true, 
      warning: null,
      detectedProvider: null
    };
  }
  
  // Provedor 'none' aceita qualquer ID (modo offline)
  if (currentProvider === 'none') {
    return {
      valid: true,
      warning: `ℹ️ Task ID "${taskId}" detectado como ${detectedProvider}, ` +
               `mas nenhum provedor está configurado. Operando em modo local.`,
      detectedProvider
    };
  }
  
  // Provedores diferentes - incompatibilidade
  if (detectedProvider !== currentProvider) {
    return {
      valid: false,
      warning: `⚠️ INCOMPATIBILIDADE DETECTADA\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
               `Task ID: "${taskId}"\n` +
               `Provedor detectado: ${detectedProvider}\n` +
               `Provedor configurado: ${currentProvider}\n\n` +
               `💡 Ações sugeridas:\n` +
               `   1. Altere TASK_MANAGER_PROVIDER para '${detectedProvider}' no .env\n` +
               `   2. Ou limpe a sessão atual e crie uma nova task\n` +
               `   3. Execute /meta/setup-integration para reconfigurar`,
      detectedProvider
    };
  }
  
  // Tudo OK
  return { 
    valid: true, 
    warning: null,
    detectedProvider 
  };
}
```

---

### checkProviderConfiguration()

```typescript
/**
 * Verifica a configuração completa do provedor.
 * @returns Objeto com status e mensagens
 */
function checkProviderConfiguration(): {
  provider: TaskManagerProvider;
  isConfigured: boolean;
  missingVars: string[];
  optionalVars: { name: string; set: boolean }[];
  message: string;
} {
  const config = detectProvider();
  
  const missingVars = config.requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  const optionalVars = config.optionalEnvVars.map(varName => ({
    name: varName,
    set: !!process.env[varName]
  }));
  
  let message: string;
  
  if (config.provider === 'none') {
    message = `ℹ️ Nenhum gerenciador de tarefas configurado.\n` +
              `Comandos funcionarão em modo offline.\n` +
              `Execute /meta/setup-integration para configurar.`;
  } else if (!config.isConfigured) {
    message = `❌ ${config.provider.toUpperCase()} selecionado mas não configurado.\n` +
              `Variáveis faltando: ${missingVars.join(', ')}\n` +
              `Execute /meta/setup-integration para configurar.`;
  } else {
    const optionalStatus = optionalVars
      .map(v => `   ${v.set ? '✅' : '⚪'} ${v.name}`)
      .join('\n');
    
    message = `✅ ${config.provider.toUpperCase()} configurado corretamente.\n` +
              `Variáveis opcionais:\n${optionalStatus}`;
  }
  
  return {
    provider: config.provider,
    isConfigured: config.isConfigured,
    missingVars,
    optionalVars,
    message
  };
}
```

---

## 📊 Tabela de Formatos de ID

| Provedor | Formato | Regex | Exemplo |
|----------|---------|-------|---------|
| ClickUp | 9 chars alfanuméricos | `^[a-z0-9]{9}$` | `86adfe9eb` |
| Asana | 15+ dígitos | `^\d{15,}$` | `1234567890123456` |
| Linear (ID) | PREFIXO-NUMERO | `^[A-Z]+-\d+$` | `DEV-123` |
| Linear (UUID) | UUID v4 | UUID regex | `a1b2c3d4-...` |
| Local | local-timestamp | `^local-\d+$` | `local-1732456789` |

---

## 🧪 Exemplos de Uso

```typescript
// Detectar provedor configurado
const config = detectProvider();
console.log(`Provedor: ${config.provider}`);
console.log(`Configurado: ${config.isConfigured}`);

// Validar ID de task
const taskId = '86adfe9eb';
const currentProvider = 'asana';
const validation = validateProviderMatch(taskId, currentProvider);

if (!validation.valid) {
  console.warn(validation.warning);
  // Perguntar ao usuário o que fazer
}

// Verificar configuração completa
const status = checkProviderConfiguration();
console.log(status.message);
```

---

## 📚 Referências

- [Types](./types.md) - Definições de tipos
- [Factory](./factory.md) - Criação de adapters

---

**Versão**: 1.0.0
**Criado em**: 2025-11-24

