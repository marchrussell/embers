---
name: create-abstraction
description: |
  Geração de camada de abstração seguindo o padrão SDAAL.
  Use para criar abstrações agnósticas de provedor (Task Manager, Notification, Storage).
model: sonnet

parameters:
  - name: abstraction_name
    description: Nome da abstração em kebab-case (ex: notification-manager)
    required: true
  - name: interface_name
    description: Nome da interface TypeScript (ex: INotificationManager)
    required: false
  - name: providers
    description: Lista de provedores separados por vírgula (ex: slack,discord,email)
    required: false
  - name: description
    description: Descrição breve do propósito da abstração
    required: false

category: meta
tags:
  - abstraction
  - sdaal
  - architecture
  - adapter-pattern

version: "1.0.0"
updated: "2025-11-25"

related_commands:
  - /meta/create-command
  - /meta/create-agent

related_agents:
  - onion

knowledge_base:
  - docs/knowbase/concepts/specification-driven-ai-abstraction-layer.md
  - docs/knowbase/concepts/task-manager-abstraction.md
---

# 🏗️ Criar Abstraction Layer (SDAAL)

Gerador de camadas de abstração seguindo o padrão **Specification-Driven AI Abstraction Layer**.

## 🎯 Objetivo

Criar estrutura completa de abstração agnóstica de provedor, permitindo trocar implementações sem modificar comandos ou agentes.

## 📐 Padrão SDAAL

O padrão gera a seguinte estrutura:

```
.cursor/utils/{{abstraction_name}}/
├── README.md           # Visão geral e uso rápido
├── interface.md        # Interface/Contrato principal
├── types.md            # Tipos de entrada e saída
├── factory.md          # Criação de instâncias
├── detector.md         # Detecção de contexto/provedor
└── adapters/
    ├── provider-a.md   # Adapter Provider A
    ├── provider-b.md   # Adapter Provider B
    └── none.md         # Fallback (Null Object Pattern)
```

## ⚡ Fluxo de Execução

### Passo 1: Validação de Entrada

```bash
# Verificar se abstração já existe
if [ -d ".cursor/utils/{{abstraction_name}}" ]; then
  echo "❌ ERRO: Abstração '{{abstraction_name}}' já existe!"
  ls -la .cursor/utils/{{abstraction_name}}/
  exit 1
fi

# Validar formato kebab-case
if [[ ! "{{abstraction_name}}" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
  echo "❌ ERRO: Nome deve ser kebab-case (ex: notification-manager)"
  exit 1
fi
```

**Checklist de Validação:**
- [ ] Nome único (não existe em `.cursor/utils/`)
- [ ] Nome em kebab-case válido
- [ ] Pelo menos 1 provedor definido (ou usar fallback only)

### Passo 2: Determinar Valores

**Derivação Automática:**

| Input | Derivação |
|-------|-----------|
| `{{abstraction_name}}` | `notification-manager` |
| `{{interface_name}}` | `INotificationManager` (auto: I + PascalCase) |
| `{{providers}}` | `slack,discord,email` ou `none` se vazio |
| `{{env_prefix}}` | `NOTIFICATION_MANAGER` (auto: UPPER_SNAKE) |

```typescript
// Derivar interface_name se não fornecido
const interfaceName = "{{interface_name}}" || 
  "I" + "{{abstraction_name}}"
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

// Derivar env_prefix
const envPrefix = "{{abstraction_name}}"
  .toUpperCase()
  .replace(/-/g, '_');
```

### Passo 3: Criar Estrutura de Diretórios

```bash
mkdir -p .cursor/utils/{{abstraction_name}}/adapters
```

### Passo 4: Gerar README.md

```markdown
# 🔌 {{interface_name}} - Abstraction Layer

## 🎯 Propósito

Camada de abstração que permite trocar o provedor de {{description}} sem modificar os comandos do Sistema Onion.

## 📁 Estrutura

\`\`\`
{{abstraction_name}}/
├── README.md          # Este arquivo
├── interface.md       # Interface {{interface_name}}
├── types.md           # Tipos compartilhados
├── detector.md        # Detecção de provedor
├── factory.md         # Factory para adapters
└── adapters/
{{#each providers}}
    ├── {{this}}.md    # Adapter {{this}}
{{/each}}
    └── none.md        # Adapter Fallback
\`\`\`

## ⚡ Uso Rápido

### 1. Configurar Provedor

No \`.env\`:
\`\`\`bash
{{env_prefix}}_PROVIDER={{providers[0]}}  # {{providers.join(' | ')}} | none
\`\`\`

### 2. Usar nos Comandos

\`\`\`typescript
// Importar factory
import { get{{interface_name.slice(1)}} } from '.cursor/utils/{{abstraction_name}}/factory';

// Obter adapter configurado
const manager = get{{interface_name.slice(1)}}();

// Usar interface comum
await manager.send({ ... });
\`\`\`

## 🔧 Provedores Suportados

| Provedor | Status | Notas |
|----------|--------|-------|
{{#each providers}}
| {{this}} | 📝 Stub | Implementação necessária |
{{/each}}
| None | ✅ Funcional | Modo offline |

## 📚 Documentação Relacionada

- [SDAAL Pattern](../../docs/knowbase/concepts/specification-driven-ai-abstraction-layer.md)
- [Interface](./interface.md)
- [Factory](./factory.md)

---

**Versão**: 1.0.0
**Criado em**: {{data_atual}}
```

### Passo 5: Gerar interface.md

```markdown
# 📐 Interface {{interface_name}}

## 🎯 Propósito

Define o contrato que todos os adapters devem implementar, garantindo consistência e permitindo troca transparente de provedores.

---

## 📋 Interface Completa

\`\`\`typescript
/**
 * Interface abstrata para {{description}}.
 * Todos os adapters devem implementar esta interface.
 */
interface {{interface_name}} {
  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTIFICAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Nome do provedor: '{{providers.join("' | '")}}' | 'none'
   */
  readonly provider: {{interface_name.slice(1)}}Provider;
  
  /**
   * Indica se o provedor está configurado corretamente
   */
  readonly isConfigured: boolean;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OPERAÇÕES PRINCIPAIS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // TODO: Adicionar métodos específicos da abstração
  // Exemplo:
  // send(input: SendInput): Promise<SendOutput>;
  // get(id: string): Promise<ItemOutput>;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Valida configuração do provedor.
   * @returns true se configuração está válida
   */
  validateConfiguration(): boolean;
}
\`\`\`

---

## 📊 Métodos por Categoria

| Categoria | Métodos | Descrição |
|-----------|---------|-----------|
| **Identificação** | \`provider\`, \`isConfigured\` | Informações do adapter |
| **Principais** | TODO | Operações de negócio |
| **Validação** | \`validateConfiguration\` | Verificação de setup |

---

## 🔄 Implementação Necessária

Para completar a interface:

1. Definir métodos específicos em [types.md](./types.md)
2. Implementar em cada adapter em [adapters/](./adapters/)
3. Atualizar mapeamentos de campos

---

## 📚 Referências

- [Tipos Compartilhados](./types.md)
- [Factory](./factory.md)
- [Adapters](./adapters/)

---

**Versão**: 1.0.0
**Criado em**: {{data_atual}}
```

### Passo 6: Gerar types.md

```markdown
# 📦 Tipos Compartilhados - {{interface_name}}

## 🎯 Propósito

Define os tipos TypeScript compartilhados entre todos os adapters, garantindo consistência nas operações de entrada e saída.

---

## 🔧 Enums e Constantes

\`\`\`typescript
/**
 * Provedores suportados.
 */
type {{interface_name.slice(1)}}Provider = '{{providers.join("' | '")}}' | 'none';
\`\`\`

---

## 📥 Tipos de Entrada (Input)

\`\`\`typescript
/**
 * TODO: Definir tipos de entrada.
 * Exemplo:
 */
interface BaseInput {
  /** Campo obrigatório */
  requiredField: string;
  
  /** Campo opcional */
  optionalField?: string;
}
\`\`\`

---

## 📤 Tipos de Saída (Output)

\`\`\`typescript
/**
 * TODO: Definir tipos de saída.
 * Exemplo:
 */
interface BaseOutput {
  /** ID único */
  id: string;
  
  /** Provedor de origem */
  provider: {{interface_name.slice(1)}}Provider;
  
  /** Timestamp de criação */
  createdAt: string;
}
\`\`\`

---

## ⚙️ Tipos de Configuração

\`\`\`typescript
/**
 * Configuração de um provedor.
 */
interface ProviderConfig {
  /** Nome do provedor */
  provider: {{interface_name.slice(1)}}Provider;
  
  /** Se está configurado corretamente */
  isConfigured: boolean;
  
  /** Variáveis de ambiente obrigatórias */
  requiredEnvVars: string[];
  
  /** Variáveis de ambiente opcionais */
  optionalEnvVars: string[];
  
  /** Mensagem de erro se não configurado */
  errorMessage?: string;
}
\`\`\`

---

## 📚 Referências

- [Interface](./interface.md)
- [Detector de Provedor](./detector.md)

---

**Versão**: 1.0.0
**Criado em**: {{data_atual}}
```

### Passo 7: Gerar detector.md

```markdown
# 🔍 Detector de Provedor - {{interface_name}}

## 🎯 Propósito

Detecta e valida o provedor configurado via variáveis de ambiente.

---

## 📋 Funções Principais

### detectProvider()

\`\`\`typescript
/**
 * Detecta o provedor configurado via variáveis de ambiente.
 * @returns Configuração do provedor ativo
 */
function detectProvider(): ProviderConfig {
  const provider = (process.env.{{env_prefix}}_PROVIDER || 'none') as {{interface_name.slice(1)}}Provider;
  
  const configs: Record<{{interface_name.slice(1)}}Provider, ProviderConfig> = {
{{#each providers}}
    '{{this}}': {
      provider: '{{this}}',
      isConfigured: !!process.env.{{../env_prefix}}_{{this.toUpperCase()}}_TOKEN,
      requiredEnvVars: ['{{../env_prefix}}_{{this.toUpperCase()}}_TOKEN'],
      optionalEnvVars: ['{{../env_prefix}}_{{this.toUpperCase()}}_WORKSPACE'],
      errorMessage: !process.env.{{../env_prefix}}_{{this.toUpperCase()}}_TOKEN 
        ? '❌ {{../env_prefix}}_{{this.toUpperCase()}}_TOKEN não configurado'
        : undefined
    },
{{/each}}
    
    'none': {
      provider: 'none',
      isConfigured: true,
      requiredEnvVars: [],
      optionalEnvVars: [],
      errorMessage: undefined
    }
  };
  
  return configs[provider] || configs.none;
}
\`\`\`

---

### checkProviderConfiguration()

\`\`\`typescript
/**
 * Verifica a configuração completa do provedor.
 * @returns Objeto com status e mensagens
 */
function checkProviderConfiguration(): {
  provider: {{interface_name.slice(1)}}Provider;
  isConfigured: boolean;
  missingVars: string[];
  message: string;
} {
  const config = detectProvider();
  
  const missingVars = config.requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  let message: string;
  
  if (config.provider === 'none') {
    message = 'ℹ️ Nenhum provedor configurado. Operando em modo offline.';
  } else if (!config.isConfigured) {
    message = \`❌ \${config.provider.toUpperCase()} não configurado. Faltando: \${missingVars.join(', ')}\`;
  } else {
    message = \`✅ \${config.provider.toUpperCase()} configurado corretamente.\`;
  }
  
  return {
    provider: config.provider,
    isConfigured: config.isConfigured,
    missingVars,
    message
  };
}
\`\`\`

---

## 📊 Variáveis de Ambiente

| Provedor | Variável Obrigatória | Variáveis Opcionais |
|----------|---------------------|---------------------|
{{#each providers}}
| {{this}} | \`{{../env_prefix}}_{{this.toUpperCase()}}_TOKEN\` | \`{{../env_prefix}}_{{this.toUpperCase()}}_WORKSPACE\` |
{{/each}}
| none | - | - |

---

## 📚 Referências

- [Types](./types.md)
- [Factory](./factory.md)

---

**Versão**: 1.0.0
**Criado em**: {{data_atual}}
```

### Passo 8: Gerar factory.md

```markdown
# 🏭 Factory - {{interface_name}}

## 🎯 Propósito

Fornece factory para instanciar o adapter correto baseado na configuração do ambiente.

---

## 📋 Função Principal

### get{{interface_name.slice(1)}}()

\`\`\`typescript
/**
 * Retorna uma instância do manager configurado.
 * Baseado em {{env_prefix}}_PROVIDER no .env
 * 
 * @param options - Opções de configuração (opcional)
 * @returns Instância do adapter apropriado
 */
function get{{interface_name.slice(1)}}(options?: FactoryOptions): {{interface_name}} {
  const config = detectProvider();
  
  if (options?.debug) {
    console.log(\`[{{interface_name}}] Provider: \${config.provider}\`);
    console.log(\`[{{interface_name}}] Configured: \${config.isConfigured}\`);
  }
  
  if (!config.isConfigured) {
    if (options?.throwOnMisconfigured) {
      throw new Error(config.errorMessage || 'Provider not configured');
    }
    
    console.warn(\`⚠️ \${config.errorMessage}\`);
    console.warn(\`💡 Continuando em modo offline...\`);
    return new NoProviderAdapter();
  }
  
  switch (config.provider) {
{{#each providers}}
    case '{{this}}':
      return new {{this.charAt(0).toUpperCase() + this.slice(1)}}Adapter({
        token: process.env.{{../env_prefix}}_{{this.toUpperCase()}}_TOKEN!,
        workspace: process.env.{{../env_prefix}}_{{this.toUpperCase()}}_WORKSPACE
      });
{{/each}}
      
    case 'none':
    default:
      return new NoProviderAdapter();
  }
}
\`\`\`

---

## ⚙️ Tipos da Factory

\`\`\`typescript
/**
 * Opções para a factory.
 */
interface FactoryOptions {
  /** Habilita logs de debug */
  debug?: boolean;
  
  /** Lança erro se provedor não configurado */
  throwOnMisconfigured?: boolean;
  
  /** Força um provedor específico */
  forceProvider?: {{interface_name.slice(1)}}Provider;
}
\`\`\`

---

## 📊 NoProviderAdapter (Fallback)

\`\`\`typescript
/**
 * Adapter de fallback quando nenhum provedor está configurado.
 */
class NoProviderAdapter implements {{interface_name}} {
  readonly provider: {{interface_name.slice(1)}}Provider = 'none';
  readonly isConfigured: boolean = false;
  
  // TODO: Implementar métodos com comportamento offline
  // Retornar valores sensatos ou warnings
  
  validateConfiguration(): boolean {
    return false;
  }
}
\`\`\`

---

## 🧪 Exemplos de Uso

\`\`\`typescript
// Uso básico
const manager = get{{interface_name.slice(1)}}();

if (manager.isConfigured) {
  // Operações online
} else {
  console.log('⚠️ Modo offline');
}

// Com validação obrigatória
try {
  const manager = get{{interface_name.slice(1)}}({ throwOnMisconfigured: true });
} catch (error) {
  console.error('❌ Provedor não configurado');
}
\`\`\`

---

## 📚 Referências

- [Interface](./interface.md)
- [Detector](./detector.md)
- [Adapters](./adapters/)

---

**Versão**: 1.0.0
**Criado em**: {{data_atual}}
```

### Passo 9: Gerar Adapters

Para cada provedor em `{{providers}}`, criar:

```markdown
# 🔵 {{provider}} Adapter

## 🎯 Propósito

Implementação do {{interface_name}} para {{provider}}.

---

## 📋 Configuração

### Variáveis de Ambiente

\`\`\`bash
# Obrigatória
{{env_prefix}}_{{provider.toUpperCase()}}_TOKEN=xxx

# Opcionais
{{env_prefix}}_{{provider.toUpperCase()}}_WORKSPACE=xxx
\`\`\`

---

## 🔧 Implementação

\`\`\`typescript
/**
 * Adapter {{provider}} implementando {{interface_name}}.
 */
class {{provider.charAt(0).toUpperCase() + provider.slice(1)}}Adapter implements {{interface_name}} {
  readonly provider: {{interface_name.slice(1)}}Provider = '{{provider}}';
  readonly isConfigured: boolean;
  
  private token: string;
  private workspace?: string;
  
  constructor(config: {{provider.charAt(0).toUpperCase() + provider.slice(1)}}AdapterConfig) {
    this.token = config.token;
    this.workspace = config.workspace;
    this.isConfigured = !!this.token;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TODO: IMPLEMENTAR MÉTODOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  validateConfiguration(): boolean {
    return this.isConfigured;
  }
  
  // Adicionar métodos específicos...
}
\`\`\`

---

## 📊 Mapeamento de Campos

| Interface | {{provider}} API | Notas |
|-----------|-----------------|-------|
| TODO | TODO | Mapear campos |

---

## 🧪 Exemplos de Uso

\`\`\`typescript
// Via Factory (recomendado)
const manager = get{{interface_name.slice(1)}}();

// Direto (para testes)
const adapter = new {{provider.charAt(0).toUpperCase() + provider.slice(1)}}Adapter({
  token: 'xxx',
  workspace: 'xxx'
});
\`\`\`

---

## 📚 Referências

- [Interface](../interface.md)
- [Types](../types.md)

---

**Versão**: 1.0.0
**Criado em**: {{data_atual}}
```

### Passo 10: Gerar none.md (Fallback)

```markdown
# ⚪ NoProvider Adapter (Fallback)

## 🎯 Propósito

Adapter de fallback que permite operação offline quando nenhum provedor está configurado.

---

## 📋 Comportamento

O NoProviderAdapter:

- ✅ Permite que comandos executem sem falhar
- ⚠️ Exibe warnings quando operações são tentadas
- 📝 Pode gerar IDs locais para rastreamento
- ❌ Não persiste dados em serviços externos

---

## 🔧 Implementação

\`\`\`typescript
/**
 * Adapter de fallback - modo offline.
 */
class NoProviderAdapter implements {{interface_name}} {
  readonly provider: {{interface_name.slice(1)}}Provider = 'none';
  readonly isConfigured: boolean = false;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OPERAÇÕES (warnings + fallback)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // TODO: Implementar cada método com:
  // 1. console.warn('⚠️ Operação X - modo offline');
  // 2. Retornar valor sensato ou throw com mensagem clara
  
  validateConfiguration(): boolean {
    console.warn('⚠️ Nenhum provedor configurado');
    return false;
  }
}
\`\`\`

---

## 📊 Comportamento por Operação

| Operação | Comportamento Offline |
|----------|----------------------|
| Leitura | Retorna array vazio ou null |
| Escrita | Warning + ID local |
| Atualização | Warning + throw/false |
| Deleção | Warning + false |

---

## 📚 Referências

- [Factory](../factory.md)
- [Interface](../interface.md)

---

**Versão**: 1.0.0
**Criado em**: {{data_atual}}
```

### Passo 11: Atualizar .env.example

Adicionar ao `.env.example`:

```bash
# ═══════════════════════════════════════════════════════════════════════════
# {{interface_name.slice(1)}} Configuration
# ═══════════════════════════════════════════════════════════════════════════
{{env_prefix}}_PROVIDER=none  # {{providers.join(' | ')}} | none

{{#each providers}}
# {{this}}
{{../env_prefix}}_{{this.toUpperCase()}}_TOKEN=
{{../env_prefix}}_{{this.toUpperCase()}}_WORKSPACE=

{{/each}}
```

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ABSTRACTION LAYER CRIADA (SDAAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Estrutura:
.cursor/utils/{{abstraction_name}}/
├── README.md           ✅
├── interface.md        ✅
├── types.md            ✅
├── factory.md          ✅
├── detector.md         ✅
└── adapters/
{{#each providers}}
    ├── {{this}}.md     📝 (stub)
{{/each}}
    └── none.md         ✅

📋 Detalhes:
∟ Interface: {{interface_name}}
∟ Provedores: {{providers.join(', ')}}
∟ Env Prefix: {{env_prefix}}_PROVIDER

🔧 Próximos Passos:
1. Definir métodos em interface.md
2. Adicionar tipos em types.md  
3. Implementar adapters em adapters/
4. Configurar .env com {{env_prefix}}_PROVIDER

📚 Documentação:
∟ Pattern: docs/knowbase/concepts/specification-driven-ai-abstraction-layer.md
∟ Exemplo: .cursor/utils/task-manager/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔗 Referências

- [SDAAL Pattern](../../docs/knowbase/concepts/specification-driven-ai-abstraction-layer.md)
- [Task Manager (Referência)](../../.cursor/utils/task-manager/)
- Agente: @onion

## ⚠️ Notas

- Cada arquivo deve ter < 400 linhas
- Interface deve ser extensível (Open/Closed)
- Sempre incluir NoProviderAdapter (fallback)
- Documentar variáveis de ambiente necessárias
- Usar emojis e separadores ASCII para facilitar parsing por IA

