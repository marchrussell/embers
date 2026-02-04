# 🏗️ Template: Abstraction Layer (SDAAL)

Este template define a estrutura padrão para camadas de abstração seguindo o padrão **Specification-Driven AI Abstraction Layer**.

---

## 📁 Estrutura de Arquivos

```
.cursor/utils/{{abstraction_name}}/
├── README.md           # Visão geral + uso rápido
├── interface.md        # Contrato principal
├── types.md            # Tipos de entrada/saída
├── factory.md          # Criação de instâncias
├── detector.md         # Detecção de provedor
└── adapters/
    ├── {{provider}}.md # Um por provedor
    └── none.md         # Fallback obrigatório
```

---

## 📝 README.md Template

```markdown
# 🔌 {{InterfaceName}} - Abstraction Layer

## 🎯 Propósito

[Descrição do que a abstração faz]

## 📁 Estrutura

\`\`\`
{{abstraction_name}}/
├── README.md
├── interface.md
├── types.md
├── detector.md
├── factory.md
└── adapters/
    ├── [providers].md
    └── none.md
\`\`\`

## ⚡ Uso Rápido

### 1. Configurar Provedor

\`\`\`bash
{{ENV_PREFIX}}_PROVIDER=[provider]
\`\`\`

### 2. Usar nos Comandos

\`\`\`typescript
const manager = get{{ManagerName}}();
await manager.operation({ ... });
\`\`\`

## 🔧 Provedores Suportados

| Provedor | Status | Notas |
|----------|--------|-------|
| [provider] | ✅/📝 | [notas] |
| None | ✅ | Modo offline |

---

**Versão**: 1.0.0
**Criado em**: YYYY-MM-DD
```

---

## 📝 interface.md Template

```markdown
# 📐 Interface {{InterfaceName}}

## 🎯 Propósito

[O que esta interface define]

---

## 📋 Interface Completa

\`\`\`typescript
interface {{InterfaceName}} {
  // ═══════════════════════════════════════════════════
  // IDENTIFICAÇÃO
  // ═══════════════════════════════════════════════════
  
  readonly provider: {{ManagerName}}Provider;
  readonly isConfigured: boolean;
  
  // ═══════════════════════════════════════════════════
  // OPERAÇÕES PRINCIPAIS
  // ═══════════════════════════════════════════════════
  
  operation(input: OperationInput): Promise<OperationOutput>;
  
  // ═══════════════════════════════════════════════════
  // VALIDAÇÃO
  // ═══════════════════════════════════════════════════
  
  validateConfiguration(): boolean;
}
\`\`\`

---

## 📊 Métodos por Categoria

| Categoria | Métodos | Descrição |
|-----------|---------|-----------|
| Identificação | provider, isConfigured | Info do adapter |
| Principais | [lista] | Operações core |
| Validação | validateConfiguration | Verificação |

---

**Versão**: 1.0.0
```

---

## 📝 types.md Template

```markdown
# 📦 Tipos Compartilhados

## 🔧 Enums e Constantes

\`\`\`typescript
type {{ManagerName}}Provider = '[providers]' | 'none';
\`\`\`

---

## 📥 Tipos de Entrada

\`\`\`typescript
interface OperationInput {
  field: Type;
}
\`\`\`

---

## 📤 Tipos de Saída

\`\`\`typescript
interface OperationOutput {
  id: string;
  provider: {{ManagerName}}Provider;
  createdAt: string;
}
\`\`\`

---

## ⚙️ Configuração

\`\`\`typescript
interface ProviderConfig {
  provider: {{ManagerName}}Provider;
  isConfigured: boolean;
  requiredEnvVars: string[];
  optionalEnvVars: string[];
  errorMessage?: string;
}
\`\`\`

---

**Versão**: 1.0.0
```

---

## 📝 detector.md Template

```markdown
# 🔍 Detector de Provedor

## 📋 detectProvider()

\`\`\`typescript
function detectProvider(): ProviderConfig {
  const provider = process.env.{{ENV_PREFIX}}_PROVIDER || 'none';
  
  const configs = {
    '[provider]': {
      provider: '[provider]',
      isConfigured: !!process.env.{{ENV_PREFIX}}_[PROVIDER]_TOKEN,
      requiredEnvVars: ['{{ENV_PREFIX}}_[PROVIDER]_TOKEN'],
      optionalEnvVars: ['{{ENV_PREFIX}}_[PROVIDER]_WORKSPACE'],
    },
    'none': {
      provider: 'none',
      isConfigured: true,
      requiredEnvVars: [],
      optionalEnvVars: [],
    }
  };
  
  return configs[provider] || configs.none;
}
\`\`\`

---

## 📊 Variáveis de Ambiente

| Provedor | Obrigatória | Opcionais |
|----------|-------------|-----------|
| [provider] | TOKEN | WORKSPACE |

---

**Versão**: 1.0.0
```

---

## 📝 factory.md Template

```markdown
# 🏭 Factory

## 📋 get{{ManagerName}}()

\`\`\`typescript
function get{{ManagerName}}(options?: FactoryOptions): {{InterfaceName}} {
  const config = detectProvider();
  
  if (!config.isConfigured && options?.throwOnMisconfigured) {
    throw new Error(config.errorMessage);
  }
  
  switch (config.provider) {
    case '[provider]':
      return new [Provider]Adapter({ ... });
    default:
      return new NoProviderAdapter();
  }
}
\`\`\`

---

## ⚙️ FactoryOptions

\`\`\`typescript
interface FactoryOptions {
  debug?: boolean;
  throwOnMisconfigured?: boolean;
  forceProvider?: {{ManagerName}}Provider;
}
\`\`\`

---

## 📊 NoProviderAdapter

\`\`\`typescript
class NoProviderAdapter implements {{InterfaceName}} {
  readonly provider = 'none';
  readonly isConfigured = false;
  
  // Implementar com warnings + fallbacks
}
\`\`\`

---

**Versão**: 1.0.0
```

---

## 📝 adapters/[provider].md Template

```markdown
# 🔵 [Provider] Adapter

## 📋 Configuração

\`\`\`bash
{{ENV_PREFIX}}_[PROVIDER]_TOKEN=xxx
{{ENV_PREFIX}}_[PROVIDER]_WORKSPACE=xxx
\`\`\`

---

## 🔧 Implementação

\`\`\`typescript
class [Provider]Adapter implements {{InterfaceName}} {
  readonly provider = '[provider]';
  readonly isConfigured: boolean;
  
  constructor(config) {
    this.isConfigured = !!config.token;
  }
  
  async operation(input): Promise<Output> {
    // Chamar API/MCP específico
    // Normalizar resposta
  }
}
\`\`\`

---

## 📊 Mapeamento

| Interface | [Provider] API | Notas |
|-----------|---------------|-------|
| field | api_field | [mapeamento] |

---

**Versão**: 1.0.0
```

---

## 📝 adapters/none.md Template

```markdown
# ⚪ NoProvider Adapter

## 🎯 Propósito

Fallback para modo offline.

---

## 🔧 Implementação

\`\`\`typescript
class NoProviderAdapter implements {{InterfaceName}} {
  readonly provider = 'none';
  readonly isConfigured = false;
  
  async operation(input) {
    console.warn('⚠️ Modo offline');
    return {
      id: \`local-\${Date.now()}\`,
      provider: 'none',
      ...input
    };
  }
}
\`\`\`

---

## 📊 Comportamento

| Operação | Offline |
|----------|---------|
| Leitura | [] ou null |
| Escrita | Warning + ID local |
| Update | Warning + throw |
| Delete | Warning + false |

---

**Versão**: 1.0.0
```

---

## 🔄 Variáveis de Substituição

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `{{abstraction_name}}` | `notification-manager` | Nome em kebab-case |
| `{{InterfaceName}}` | `INotificationManager` | Interface (I + PascalCase) |
| `{{ManagerName}}` | `NotificationManager` | Sem I (PascalCase) |
| `{{ENV_PREFIX}}` | `NOTIFICATION_MANAGER` | Prefixo de env (UPPER_SNAKE) |
| `{{providers}}` | `slack,discord` | Lista de provedores |

---

## 📚 Referências

- [SDAAL Pattern](../../../docs/knowbase/concepts/specification-driven-ai-abstraction-layer.md)
- [Task Manager (Exemplo)](../../../.cursor/utils/task-manager/)
- [Comando create-abstraction](../meta/create-abstraction.md)

---

**Versão**: 1.0.0
**Criado em**: 2025-11-25

