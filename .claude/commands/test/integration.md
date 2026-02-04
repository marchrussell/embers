---
name: integration
description: |
  Gera e executa testes de integração automaticamente com detecção de framework.
  Use para criar testes de integração (Grey-box) seguindo padrões do projeto, incluindo API contract testing, boundary testing e fuzzing.
model: sonnet

parameters:
  - name: api-endpoint
    description: Endpoint da API ou serviço para testar (ex: "/api/users", "UserService")
    required: true
  - name: --generate
    description: Gera arquivo de teste se não existir
    required: false
  - name: --run
    description: Executa os testes após gerar/validar
    required: false
  - name: --contract
    description: Foca em contract testing (valida schemas e contratos)
    required: false
  - name: --boundary
    description: Foca em boundary testing (timeouts, erros, limites)
    required: false
  - name: --fuzz
    description: Inclui fuzzing de API (testes com dados malformados)
    required: false
  - name: --framework
    description: Framework específico (sobrescreve auto-detecção: supertest|pact|postman|wiremock|jest|vitest)
    required: false
  - name: --mock-external
    description: Mocka serviços externos (default: true para testes isolados)
    required: false

category: test
tags:
  - testing
  - integration-tests
  - grey-box-testing
  - api-testing
  - contract-testing
  - test-generation
  - automation

version: "3.0.0"
updated: "2025-12-03"

related_commands:
  - /test/unit
  - /test/e2e
  - /validate/test-strategy/create
  - /engineer/work

related_agents:
  - test-engineer
  - test-planner
  - test-agent
---

# 🔗 Test Integration

Gera e executa testes de integração automaticamente com detecção inteligente de framework, foco em Grey-box testing (API contract testing, boundary testing, fuzzing) seguindo o Framework de Testes.

## 🎯 Objetivo

Automatizar o ciclo completo de testes de integração (Grey-box perspective):
- **Auto-detecção** de framework de integração (Supertest, Pact, Postman, Wiremock)
- **Análise de API/service** para identificar endpoints e contratos
- **Geração automática** de testes de integração seguindo padrões do projeto
- **Suporte a contract testing** (validação de schemas e contratos)
- **Suporte a boundary testing** (timeouts, erros, limites)
- **Suporte a fuzzing** (dados malformados e edge cases)
- **Execução inteligente** com mocks de serviços externos

## ⚡ Fluxo de Execução

### Passo 1: Validar Endpoint/Service

```bash
# Validar formato
if [[ -z "{{api-endpoint}}" ]]; then
  echo "❌ ERRO: Endpoint ou serviço é obrigatório"
  exit 1
fi
```

**Validações:**
```markdown
SE api-endpoint vazio:
  ❌ ERRO: Endpoint ou serviço é obrigatório
  💡 Exemplos: "/api/users", "UserService", "payment-gateway"

SE formato inválido:
  ⚠️ AVISO: Endpoint deve ser caminho de API ou nome de serviço
```

### Passo 2: Detectar Framework de Integração

**Estratégia de Detecção (em ordem de prioridade):**

1. **Verificar configurações:**
   - `pact.config.{js,ts}` → Pact detectado
   - `postman.json` ou `postman/` → Postman detectado
   - `wiremock/` ou `mocks/` → Wiremock detectado
   - `package.json` → `supertest`, `@pact-foundation/pact`, `postman`, `wiremock` em dependencies
   - `jest.config.{js,ts}` ou `vitest.config.{js,ts}` → Jest/Vitest com Supertest

2. **Buscar arquivos de teste existentes:**
   - `**/*.integration.{js,ts}`
   - `**/integration/**/*.spec.{js,ts}`
   - `**/tests/integration/**/*.{js,ts}`
   - `**/contracts/**/*.{js,ts}` (Pact)
   - `**/pacts/**/*.json` (Pact)

3. **Inferir por estrutura:**
   - Diretório `contracts/` ou `pacts/` → Pact
   - Diretório `mocks/` ou `wiremock/` → Wiremock
   - Arquivos `*.postman_collection.json` → Postman
   - Uso de `supertest` em testes → Supertest

**Output:**
```markdown
✅ Framework detectado: [supertest|pact|postman|wiremock|jest|vitest]
📁 Config: [caminho do arquivo de config]
🔧 Test runner: [jest|vitest|mocha]
🌐 Mock strategy: [wiremock|nock|msw]
```

**Se `--framework` fornecido:** Sobrescreve detecção automática

### Passo 3: Analisar API/Service

**Objetivo:** Identificar endpoints, contratos e dependências externas.

#### 3.1 Detectar Tipo de Endpoint

**Buscar no código:**
- Rotas de API: `app.get()`, `router.post()`, `@Get()`, `@Post()`
- Serviços: Classes com métodos públicos, interfaces
- GraphQL: `schema.graphql`, resolvers

#### 3.2 Extrair Contratos

**Buscar schemas e contratos:**
- OpenAPI/Swagger: `openapi.yaml`, `swagger.json`
- JSON Schema: `schema.json`, `*.schema.json`
- Pact contracts: `pacts/*.json`
- TypeScript types/interfaces
- GraphQL schema

#### 3.3 Identificar Dependências Externas

- APIs externas (HTTP calls)
- Serviços de terceiros
- Bancos de dados
- Message queues
- Cache services

**Output da Análise:**
```markdown
📊 Análise de API/Service:
∟ Tipo: [REST API|GraphQL|Service|Microservice]
∟ Endpoints encontrados: [N]
∟ Contratos encontrados: [Sim/Não]
∟ Dependências externas: [lista]
∟ Mock strategy: [wiremock|nock|msw|manual]
```

### Passo 4: Verificar Arquivo de Teste Existente

**Padrões de nomenclatura:**
- **Supertest:** `{{endpoint}}.integration.test.{js,ts}`
- **Pact:** `{{consumer}}-{{provider}}.spec.{js,ts}` ou `contracts/{{name}}.spec.{js,ts}`
- **Postman:** `{{collection}}.postman_collection.json`
- **Jest/Vitest:** `{{endpoint}}.integration.{js,ts}` ou `integration/{{endpoint}}.spec.{js,ts}`

**Decisão:**
```markdown
SE arquivo existe:
  ✅ Encontrado: [caminho]
  SE --generate: ⚠️ Pula geração, continua execução
  SENÃO: Continua execução

SE não existe:
  SE --generate: → Gerar (Passo 5)
  SENÃO: ❌ ERRO: Use --generate para criar
```

### Passo 5: Gerar Arquivo de Teste (SE --generate)

**Estratégia:**
1. **Ler padrões existentes:** Buscar `**/*.integration.{js,ts}`, `**/contracts/**/*.{js,ts}` para extrair estrutura
2. **Gerar testes base:** Padrão AAA (Arrange, Act, Assert) para cada endpoint:
   - **Contract tests:** Validação de schema, tipos, estruturas
   - **Boundary tests:** Timeouts, erros, limites, edge cases
   - **Fuzzing tests:** Dados malformados, tipos incorretos, valores extremos
3. **Configurar mocks:** Para dependências externas (Wiremock, Nock, MSW)
4. **Criar arquivo:** `write {{test-file-path}}`

**Exemplo estrutura (Supertest + Jest):**
```typescript
import request from 'supertest';
import app from '../src/app';

describe('API Integration: {{api-endpoint}}', () => {
  beforeEach(() => {
    // Setup mocks para serviços externos
  });

  describe('Contract Testing', () => {
    test('should return valid schema for GET /api/users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body).toMatchSchema({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            email: expect.any(String)
          })
        ])
      });
    });
  });

  describe('Boundary Testing', () => {
    test('should handle timeout from external service', async () => {
      // Mock timeout
      mockExternalService.timeout();
      
      const response = await request(app)
        .get('/api/users')
        .expect(500);
      
      expect(response.body.error).toBe('Service timeout');
    });

    test('should handle invalid response from external service', async () => {
      mockExternalService.returnsInvalidData();
      
      const response = await request(app)
        .get('/api/users')
        .expect(500);
    });
  });

  describe('Fuzzing Tests', () => {
    test('should handle malformed JSON gracefully', async () => {
      const malformedInputs = [
        '{"name": incomplete',
        '{"name": null, "email": ""}',
        '{"name": "' + 'x'.repeat(10000) + '"}',
      ];
      
      for (const input of malformedInputs) {
        const response = await request(app)
          .post('/api/users')
          .send(input)
          .expect(400);
        
        expect(response.body.error).toBeDefined();
      }
    });
  });
});
```

**Exemplo estrutura (Pact):**
```typescript
import { Pact } from '@pact-foundation/pact';

describe('Pact Contract: UserService', () => {
  const provider = new Pact({
    consumer: 'Frontend',
    provider: 'UserService',
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test('should return user list', async () => {
    await provider.addInteraction({
      state: 'users exist',
      uponReceiving: 'a request for users',
      withRequest: {
        method: 'GET',
        path: '/api/users',
      },
      willRespondWith: {
        status: 200,
        body: {
          users: Matchers.arrayContaining([
            Matchers.like({
              id: Matchers.string('123'),
              name: Matchers.string('John'),
            }),
          ]),
        },
      },
    });

    // Execute test
    const response = await fetch('/api/users');
    expect(response.status).toBe(200);
  });
});
```

**Validação:** ✅ Arquivo gerado: {{test-file-path}}, [N] testes (contract: X, boundary: Y, fuzzing: Z)

### Passo 6: Executar Testes (SE --run)

**Comandos por framework:**

- **Supertest + Jest:** `npx jest {{test-file}} [--coverage]` ou `pnpm jest`
- **Supertest + Vitest:** `npx vitest [run] {{test-file}}` ou `pnpm vitest`
- **Pact:** `npx pact-provider-verifier` ou `pnpm pact:verify`
- **Postman:** `npx newman run {{collection}}.json` ou `pnpm postman:test`
- **Wiremock:** `java -jar wiremock.jar --port 8080` (setup) + testes

**Construir comando:** Base + flags específicas + execução

**Executar:** `run_terminal_cmd [comando]` e capturar: resultados (pass/fail), contratos validados, erros, tempo

### Passo 7: Apresentar Resultados

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TESTES DE INTEGRAÇÃO - {{api-endpoint}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Detecção:
∟ Framework: [supertest|pact|postman|wiremock|jest|vitest]
∟ Config: [caminho do arquivo de config]
∟ Test runner: [jest|vitest|mocha]
∟ Mock strategy: [wiremock|nock|msw|manual]

📊 Análise de API/Service:
∟ Endpoint/Service: {{api-endpoint}}
∟ Tipo: [REST API|GraphQL|Service|Microservice]
∟ Endpoints encontrados: [N]
∟ Contratos encontrados: [Sim/Não]
∟ Dependências externas: [lista]
∟ Mock strategy recomendada: [wiremock|nock|msw]

📝 Arquivo de Teste:
∟ Status: [✅ Existente | ✅ Gerado | ❌ Não encontrado]
∟ Caminho: {{test-file-path}}
∟ Testes: [N] casos de teste
  ├─ Contract tests: [N]
  ├─ Boundary tests: [N]
  └─ Fuzzing tests: [N]

🧪 Execução:
∟ Comando: [comando executado]
∟ Status: [✅ Passou | ❌ Falhou | ⚠️ Parcial]
∟ Testes executados: [X/Y] passaram
∟ Contratos validados: [X/Y]
∟ Tempo: [X]s

📊 Resultados Detalhados:
∟ Contract Tests: [X/Y] ✅
  └─ Schemas validados: [lista]
  └─ Contratos verificados: [lista]
∟ Boundary Tests: [X/Y] ✅
  └─ Timeouts testados: [N]
  └─ Erros tratados: [N]
∟ Fuzzing Tests: [X/Y] ✅
  └─ Inputs malformados: [N]
  └─ Edge cases: [N]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Próximos Passos:
1. Revisar testes gerados e adicionar casos específicos
2. Executar novamente: /test/integration {{api-endpoint}} --run
3. Adicionar contract tests: /test/integration {{api-endpoint}} --contract
4. Integrar no pipeline: /validate/test-strategy/create

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📋 Exemplos de Uso

**1. Gerar e executar com contract testing:**
```bash
/test/integration /api/users --generate --run --contract
```
→ Detecta framework, analisa API, gera `users.integration.test.js` com contract tests, executa

**2. Apenas gerar testes de boundary:**
```bash
/test/integration payment-service --generate --boundary --framework supertest
```
→ Força Supertest, gera testes de boundary (timeouts, erros), não executa

**3. Executar com fuzzing:**
```bash
/test/integration /api/orders --run --fuzz
```
→ Executa `orders.integration.test.js` existente com fuzzing habilitado

**4. Gerar testes completos (contract + boundary + fuzzing):**
```bash
/test/integration user-service --generate --contract --boundary --fuzz
```
→ Gera suite completa de testes de integração

**5. Executar teste existente sem mockar externos:**
```bash
/test/integration /api/products --run --mock-external false
```
→ Executa contra serviços reais (útil para staging)

## ⚙️ Parâmetros Detalhados

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `api-endpoint` | string | ✅ | Endpoint da API ou nome do serviço |
| `--generate` | flag | ❌ | Gera arquivo de teste se não existir |
| `--run` | flag | ❌ | Executa os testes após gerar/validar |
| `--contract` | flag | ❌ | Foca em contract testing (schemas) |
| `--boundary` | flag | ❌ | Foca em boundary testing (timeouts, erros) |
| `--fuzz` | flag | ❌ | Inclui fuzzing de API (dados malformados) |
| `--framework` | string | ❌ | Framework específico (sobrescreve auto-detecção) |
| `--mock-external` | boolean | ❌ | Mocka serviços externos (default: true) |

## 🔗 Comandos Relacionados

- `/test/unit` - Testes unitários (White-box)
- `/test/e2e` - Testes end-to-end (Black-box)
- `/validate/test-strategy/create` - Criar estratégia completa de testes
- `/engineer/work` - Continuar desenvolvimento com testes

## ⚠️ Validações e Regras

### Validações Obrigatórias

1. **Endpoint/Service deve ser fornecido:**
   ```markdown
   SE api-endpoint vazio:
     ❌ ERRO: Endpoint ou serviço é obrigatório
   ```

2. **Framework deve ser detectável ou fornecido:**
   ```markdown
   SE nenhum framework detectado E --framework não fornecido:
     ❌ ERRO: Não foi possível detectar framework de integração
     💡 Instale um framework ou use --framework [nome]
   ```

3. **Arquivo de teste deve existir para execução:**
   ```markdown
   SE --run fornecido E arquivo de teste não existe E --generate não fornecido:
     ❌ ERRO: Arquivo de teste não encontrado
     💡 Use --generate para criar automaticamente
   ```

### Regras de Negócio

1. **Auto-detecção tem prioridade** sobre --framework, exceto se --framework fornecido
2. **Geração segue padrões** do projeto (analisa testes existentes)
3. **Contract testing** valida schemas, tipos e estruturas de resposta
4. **Boundary testing** foca em timeouts, erros e limites de integração
5. **Fuzzing** testa robustez com dados malformados e edge cases
6. **Mock externo é default** (true) para isolamento, use `--mock-external false` para testes reais
7. **Testes gerados** seguem perspectiva Grey-box (dev testando outro dev)

## 🔧 Suporte por Framework

| Framework | Contract | Boundary | Fuzzing | Mock Strategy |
|-----------|----------|----------|---------|---------------|
| Supertest | ✅ | ✅ | ✅ | Nock, MSW |
| Pact | ✅ | ⚠️ | ❌ | Pact Mock Service |
| Postman | ✅ | ✅ | ⚠️ | Postman Mock Server |
| Wiremock | ⚠️ | ✅ | ⚠️ | Wiremock |
| Jest/Vitest | ✅ | ✅ | ✅ | Jest/Vitest mocks |

## 📚 Referências

- **Agente de Testes:** @test-engineer, @test-agent
- **Framework de Testes:** `docs/knowbase/frameworks/framework_testes.md`
- **Grey-box Testing:** Seção "Padrões Grey-box" do framework
- **API Contract Testing:** Seção "Teste de Contrato de API"
- **Supertest Docs:** https://github.com/visionmedia/supertest
- **Pact Docs:** https://docs.pact.io
- **Wiremock Docs:** https://wiremock.org

## ⚠️ Notas Importantes

- **Auto-detecção inteligente:** Analisa configurações e padrões do projeto
- **Geração conservadora:** Cria testes básicos, desenvolvedor deve expandir
- **Perspectiva Grey-box:** Foco em integração entre componentes (dev testando outro dev)
- **Contract testing:** Valida contratos entre serviços (100% coverage conforme framework)
- **Boundary testing:** Testa fronteiras de integração (timeouts, erros, limites)
- **Fuzzing opcional:** Use `--fuzz` para testes de robustez
- **Mock por padrão:** Isola testes de serviços externos, use `--mock-external false` para testes reais
- **Integração com pipeline:** Testes gerados seguem padrões do projeto

---

**Versão:** 3.0.0  
**Última atualização:** 2025-12-03  
**Mantido por:** Sistema Onion

