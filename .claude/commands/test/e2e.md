---
name: e2e
description: |
  Gera e executa testes end-to-end automaticamente com detecção de framework.
  Use para criar testes E2E seguindo padrões do projeto e executá-los com gravação.
model: sonnet

parameters:
  - name: feature-name
    description: Nome da feature para testar (ex: "login", "checkout")
    required: true
  - name: --generate
    description: Gera arquivo de teste se não existir
    required: false
  - name: --run
    description: Executa os testes
    required: false
  - name: --headless
    description: Executa sem interface gráfica (default: true)
    required: false
  - name: --record
    description: Grava vídeo/screenshots dos testes
    required: false
  - name: --framework
    description: Framework específico (sobrescreve auto-detecção: cypress|playwright|selenium)
    required: false

category: test
tags:
  - testing
  - e2e-tests
  - test-generation
  - automation
  - cypress
  - playwright
  - recording

version: "3.0.0"
updated: "2025-11-24"

related_commands:
  - /test/unit
  - /test/integration
  - /validate/test-strategy/create
  - /engineer/work

related_agents:
  - test-engineer
  - test-planner
---

# 🎭 Test E2E

Gera e executa testes end-to-end automaticamente com detecção inteligente de framework, geração de cenários baseados em features e integração com gravação de vídeo/screenshots.

## 🎯 Objetivo

Automatizar o ciclo completo de testes E2E:
- **Auto-detecção** de framework E2E (Cypress, Playwright, Selenium)
- **Geração de cenários** baseados no nome da feature (login → valid/invalid credentials, etc.)
- **Selectors inteligentes** usando data-attributes, semantic selectors, text content
- **Execução** com suporte a headless mode e gravação
- **Integração** com pipeline CI/CD existente

## ⚡ Fluxo de Execução

### Passo 1: Validar Feature Name

```bash
# Validar formato
if [[ ! "{{feature-name}}" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "❌ ERRO: Feature name deve ser kebab-case (ex: login, user-registration)"
  exit 1
fi
```

**Validações:**
```markdown
SE feature-name vazio:
  ❌ ERRO: Nome da feature é obrigatório

SE formato inválido:
  ❌ ERRO: Use kebab-case (ex: login, checkout-flow)
```

### Passo 2: Detectar Framework E2E

**Estratégia de Detecção (em ordem de prioridade):**

1. **Verificar configurações:**
   - `cypress.config.{js,ts}` → Cypress detectado
   - `playwright.config.{js,ts}` → Playwright detectado
   - `wdio.conf.{js,ts}` → WebdriverIO/Selenium detectado
   - `package.json` → `cypress`, `@playwright/test`, `selenium-webdriver` em dependencies

2. **Buscar arquivos de teste existentes:**
   - `cypress/e2e/**/*.spec.{js,ts}`
   - `e2e/**/*.spec.{js,ts}` (Playwright)
   - `tests/e2e/**/*.{js,ts}` (Selenium)

3. **Inferir por estrutura:**
   - Diretório `cypress/` → Cypress
   - Diretório `e2e/` com estrutura Playwright → Playwright
   - `selenium` em package.json → Selenium

**Output:**
```markdown
✅ Framework detectado: [cypress|playwright|selenium]
📁 Config: [caminho do arquivo de config]
🌐 Base URL: [URL detectada do config ou .env]
```

**Se `--framework` fornecido:** Sobrescreve detecção automática

### Passo 3: Analisar Estrutura de Testes Existente

**Buscar:** `**/*.e2e.{js,ts}`, `**/e2e/**/*.spec.{js,ts}`, `cypress/**/*.spec.{js,ts}`

**Extrair:** Page objects, nomenclatura, selectors (data-testid/classes/IDs), helpers/fixtures, base URL

**Output:** Page objects (Sim/Não), selectors preferidos, base URL, fixtures/helpers

### Passo 4: Gerar Cenários Baseados na Feature

**Mapeamento de Features → Cenários:**

- **Login:** valid/invalid credentials, empty fields, forgot password, remember me
- **Checkout:** complete flow, invalid payment, empty cart, shipping options, order summary
- **User Registration:** valid data, duplicate email, weak password, terms acceptance
- **Search:** valid query, empty query, special chars, filters, pagination
- **Genérico:** happy path, invalid input, empty state, edge cases

**Output:** Lista de cenários gerados com nomes e descrições

### Passo 5: Verificar Arquivo de Teste Existente

**Padrões:** Cypress: `cypress/e2e/{{feature}}.spec.{js,ts}`, Playwright: `e2e/{{feature}}.spec.{js,ts}`, Selenium: `tests/e2e/{{feature}}.test.{js,ts}`

**Decisão:** Se existe → continua execução (ou pula geração se --generate). Se não existe → gera (se --generate) ou erro

### Passo 6: Gerar Arquivo de Teste (SE --generate)

#### 6.1 Determinar Selectors Inteligentes

**Estratégia (ordem de prioridade):**
1. Data attributes: `[data-testid]`, `[data-cy]`
2. Semantic HTML: `<button>`, `<form>`, `<input type="email">`
3. ARIA: `[aria-label]`, `[role]`
4. Text content: `contains()`, `getByText()`
5. Classes/IDs: último recurso

#### 6.2 Gerar Estrutura de Teste

**Padrão AAA (Arrange, Act, Assert) por framework:**

- **Cypress:** `describe()` + `it()`, `cy.visit()`, `cy.get('[data-testid]')`, `cy.url().should()`
- **Playwright:** `test.describe()` + `test()`, `page.goto()`, `page.getByTestId()`, `expect().toBeVisible()`
- **Selenium:** `describe()` + `it()`, `browser.url()`, `$('[data-testid]')`, `expect().toHaveUrlContaining()`

**Estrutura base:** beforeEach (visit), testes para happy path, error handling, edge cases

#### 6.3 Adicionar Page Objects (se padrão existir)

**Se projeto usa page objects:** Gerar classe com getters para elementos e métodos para ações (visit, submitForm, etc.)

#### 6.4 Criar Arquivo de Teste

```bash
write {{test-file-path}} [conteúdo gerado]
```

**Validação:**
```markdown
✅ Arquivo gerado: {{test-file-path}}
📊 Cenários: [N] testes
∟ Happy path: [N]
∟ Error handling: [N]
∟ Edge cases: [N]
```

### Passo 7: Executar Testes (SE --run)

#### 7.1 Preparar Comando de Execução

**Comandos por framework:**

- **Cypress:** `npx cypress run --spec "cypress/e2e/{{feature}}.spec.ts" [--headless] [--record]` ou `pnpm cypress run`
- **Playwright:** `npx playwright test e2e/{{feature}}.spec.ts [--headed=false] [--video=on]` ou `pnpm playwright test`
- **Selenium:** `npx wdio run wdio.conf.ts --spec tests/e2e/{{feature}}.test.ts [--headless]`

#### 7.2 Construir Comando Final

```markdown
**Comando base:** [comando do framework]

**Flags:**
SE --headless não fornecido OU --headless=true:
  + flag headless (default: true)

SE --headless=false:
  + flag headed (abre browser)

SE --record:
  + flag de gravação (vídeo/screenshots)
```

#### 7.3 Executar Testes

```bash
run_terminal_cmd [comando construído]
```

**Capturar output:**
- Resultado dos testes (pass/fail)
- Screenshots/vídeos (se --record)
- Erros e stack traces
- Tempo de execução
- Artifacts gerados

### Passo 8: Apresentar Resultados

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TESTES E2E - {{feature-name}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Detecção:
∟ Framework: [cypress|playwright|selenium]
∟ Config: [caminho do arquivo de config]
∟ Base URL: [URL]
∟ Headless: [true|false]

📊 Análise de Padrões:
∟ Page objects: [✅ Sim | ❌ Não]
∟ Selectors: [data-testid|semantic|classes]
∟ Estrutura existente: [encontrada|nova]

📝 Arquivo de Teste:
∟ Status: [✅ Existente | ✅ Gerado | ❌ Não encontrado]
∟ Caminho: {{test-file-path}}
∟ Cenários: [N] testes
  ├─ Happy path: [N]
  ├─ Error handling: [N]
  └─ Edge cases: [N]

🧪 Execução:
∟ Comando: [comando executado]
∟ Status: [✅ Passou | ❌ Falhou | ⚠️ Parcial]
∟ Testes executados: [X/Y] passaram
∟ Tempo: [X]s

📹 Gravação (se --record):
∟ Vídeos: [caminho]
∟ Screenshots: [caminho]
∟ Artifacts: [lista]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Próximos Passos:
1. Revisar testes gerados e ajustar selectors
2. Executar novamente: /test/e2e {{feature-name}} --run
3. Integrar no CI/CD: /validate/test-strategy/create
4. Adicionar mais cenários conforme necessário

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📋 Exemplos de Uso

**1. Gerar e executar com gravação:**
```bash
/test/e2e login --generate --run --record
```
→ Detecta framework, gera `login.spec.ts` com cenários de login, executa com vídeo

**2. Executar em modo headed:**
```bash
/test/e2e checkout --run --headless false
```
→ Executa `checkout.spec.ts` com browser visível

**3. Apenas gerar teste:**
```bash
/test/e2e user-registration --generate
```
→ Gera `user-registration.spec.ts` com cenários de registro, não executa

**4. Executar teste existente:**
```bash
/test/e2e search --run --record
```
→ Executa `search.spec.ts` existente com gravação, não gera novo arquivo

## ⚙️ Parâmetros Detalhados

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `feature-name` | string | ✅ | Nome da feature em kebab-case |
| `--generate` | flag | ❌ | Gera arquivo de teste se não existir |
| `--run` | flag | ❌ | Executa os testes |
| `--headless` | boolean | ❌ | Executa sem interface (default: true) |
| `--record` | flag | ❌ | Grava vídeo/screenshots |
| `--framework` | string | ❌ | Framework específico (sobrescreve auto-detecção) |

## 🔗 Comandos Relacionados

- `/test/unit` - Testes unitários (White-box)
- `/test/integration` - Testes de integração (Grey-box)
- `/validate/test-strategy/create` - Criar estratégia completa de testes
- `/engineer/work` - Continuar desenvolvimento

## ⚠️ Validações e Regras

### Validações Obrigatórias

1. **Feature name deve ser válido:**
   ```markdown
   SE feature-name vazio:
     ❌ ERRO: Nome da feature é obrigatório
   
   SE formato inválido:
     ❌ ERRO: Use kebab-case (ex: login, checkout-flow)
   ```

2. **Framework deve ser detectável ou fornecido:**
   ```markdown
   SE nenhum framework detectado E --framework não fornecido:
     ❌ ERRO: Não foi possível detectar framework E2E
     💡 Instale Cypress/Playwright ou use --framework [nome]
   ```

3. **Arquivo de teste deve existir para execução:**
   ```markdown
   SE --run fornecido E arquivo não existe E --generate não fornecido:
     ❌ ERRO: Arquivo de teste não encontrado
     💡 Use --generate para criar automaticamente
   ```

### Regras de Negócio

1. **Auto-detecção tem prioridade** sobre --framework, exceto se fornecido
2. **Geração segue padrões** do projeto (analisa testes existentes)
3. **Selectors inteligentes** priorizam data-attributes e semantic HTML
4. **Headless é default** (true) para CI/CD, use `--headless false` para debug
5. **Gravação** sempre captura em falhas, `--record` habilita em sucessos também

## 🔧 Suporte por Framework

| Framework | Headless | Gravação | Page Objects | CI/CD |
|-----------|----------|----------|--------------|-------|
| Cypress | ✅ | ✅ | ✅ | ✅ |
| Playwright | ✅ | ✅ | ✅ | ✅ |
| Selenium | ✅ | ⚠️ | ✅ | ✅ |

## 📚 Referências

- **Agente de Testes:** @test-engineer
- **Framework de Testes:** `docs/knowbase/frameworks/framework_testes.md`
- **Cypress Docs:** https://docs.cypress.io
- **Playwright Docs:** https://playwright.dev

## ⚠️ Notas Importantes

- **Auto-detecção inteligente:** Analisa configurações e estrutura do projeto
- **Geração conservadora:** Cria testes básicos, desenvolvedor deve expandir
- **Selectors robustos:** Prioriza data-attributes para estabilidade
- **CI/CD ready:** Headless por padrão, gravação opcional
- **Page objects:** Detecta e segue padrão se existir no projeto

---

**Versão:** 3.0.0  
**Última atualização:** 2025-12-03  
**Mantido por:** Sistema Onion

