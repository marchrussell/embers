---
name: test-strategy-create
description: |
  Cria estratégias completas de teste baseadas no Framework de Testes.
  Use para gerar estratégias multi-perspectiva (White-box, Grey-box, Black-box) com cálculo automático de QA Story Points.
model: sonnet

parameters:
  - name: feature-name
    description: Nome da funcionalidade a ser testada
    required: true
  - name: risk-level
    description: Nível de risco (baixo|médio|alto|crítico). Default: médio
    required: false
  - name: complexity
    description: Complexidade (simples|médio|complexo|épico). Default: médio
    required: false
  - name: task-manager
    description: Provedor do task manager (clickup|asana|linear). Usa TASK_MANAGER_PROVIDER se não fornecido
    required: false
  - name: project-id
    description: ID do projeto no task manager
    required: false
  - name: dry-run
    description: Executa sem criar tasks reais
    required: false

category: validate
tags:
  - testing
  - qa
  - strategy
  - test-planning
  - story-points

version: "3.0.0"
updated: "2025-12-03"

related_commands:
  - /product/task
  - /product/estimate
  - /engineer/start

related_agents:
  - test-engineer
  - test-planner
---

# 🧪 Criação de Estratégia de Teste

Cria estratégias completas de teste baseadas no Framework de Testes (`docs/knowbase/frameworks/framework_testes.md`), gerando automaticamente estratégias multi-perspectiva com cálculo de QA Story Points.

## 🎯 Objetivo

Democratizar o uso do framework de testes, automatizando a criação de estratégias completas que incluem:
- Cálculo automático de QA Story Points
- Estratégias multi-perspectiva (White-box, Grey-box, Black-box)
- Integração com task managers para criação de épicos e subtasks estruturadas
- Relatórios detalhados em markdown

## ⚡ Fluxo de Execução

### Passo 1: Carregar Framework de Testes (OBRIGATÓRIO)

**CRÍTICO:** Sempre ler o framework antes de qualquer processamento:

```bash
# Ler framework completo
read_file docs/knowbase/frameworks/framework_testes.md
```

**Extrair e armazenar em memória:**
- Seção "QA Story Points - Sistema de Estimativa" (linhas ~217-330)
- Seção "Diferenças entre White-box vs Black-box vs Grey-box" (linhas ~111-165)
- Seção "Técnicas Específicas por Tipo" (linhas ~464-594)
- Seção "Métricas de Qualidade" (linhas ~598-649)
- Seção "Template Universal de Caso de Teste" (linhas ~171-213)

**Validar leitura:**
```markdown
SE arquivo não encontrado:
  ❌ ERRO: Framework de testes não encontrado em docs/knowbase/frameworks/framework_testes.md
  💡 Verifique se o arquivo existe e tente novamente
```

### Passo 2: Validar e Normalizar Parâmetros

```markdown
**Parâmetros recebidos:**
- feature-name: {{feature-name}} ✅ obrigatório
- risk-level: {{risk-level}} ou "médio" (default)
- complexity: {{complexity}} ou "médio" (default)
- task-manager: {{task-manager}} ou detectar do .env
- project-id: {{project-id}} ou null
- dry-run: {{dry-run}} ou false

**Normalização:**
- risk-level: converter para minúsculas, validar (baixo|médio|alto|crítico)
- complexity: converter para minúsculas, validar (simples|médio|complexo|épico)
- Se valores inválidos: usar defaults e avisar
```

**Validações:**
```markdown
SE risk-level não está em [baixo, médio, alto, crítico]:
  ⚠️ AVISO: Risk level inválido, usando "médio"
  risk-level = "médio"

SE complexity não está em [simples, médio, complexo, épico]:
  ⚠️ AVISO: Complexity inválida, usando "médio"
  complexity = "médio"
```

### Passo 3: Calcular QA Story Points

**Implementar fórmula completa do framework:**

```markdown
**Fórmula:** QA Points = Complexidade Base + Risco + Tipo de Teste

**1. Complexidade Base:**
- simples: 1-2 pontos (usar 1.5)
- médio: 3-5 pontos (usar 4)
- complexo: 5-8 pontos (usar 6.5)
- épico: 8-13 pontos (usar 10.5)

**2. Ajuste por Risco:**
- baixo: +0-1 pontos (usar +0.5)
- médio: +1-2 pontos (usar +1.5)
- alto: +2-3 pontos (usar +2.5)
- crítico: +3-5 pontos (usar +4)

**3. Tipo de Teste (baseado em complexidade):**
- simples: +1 ponto (básico)
- médio: +2-3 pontos (usar +2.5) (padrão)
- complexo: +4-6 pontos (usar +5) (extensivo)
- épico: +4-6 pontos (usar +5) (extensivo)

**Cálculo Final:**
base = [complexidade_base]
risco = [ajuste_risco]
tipo = [tipo_teste]
total = base + risco + tipo

**Arredondar para inteiro mais próximo**
```

**Exemplo de cálculo:**
```markdown
Feature: checkout-flow
Complexity: complexo (6.5)
Risk: alto (+2.5)
Tipo: extensivo (+5)
Total: 6.5 + 2.5 + 5 = 14 → arredondar para 14 pontos
```

### Passo 4: Distribuir QA Points por Perspectiva

**Distribuir total calculado entre as 3 perspectivas:**

```markdown
**Distribuição sugerida (baseada no framework):**

Para features simples/médias:
- White-box: 30% do total
- Grey-box: 30% do total
- Black-box: 40% do total

Para features complexas/épicas:
- White-box: 25% do total
- Grey-box: 35% do total
- Black-box: 40% do total

**Arredondar cada perspectiva para inteiro**
**Garantir que soma = total calculado**
```

**Exemplo:**
```markdown
Total: 14 pontos
Distribuição:
- White-box: 14 * 0.25 = 3.5 → 4 pontos
- Grey-box: 14 * 0.35 = 4.9 → 5 pontos
- Black-box: 14 * 0.40 = 5.6 → 5 pontos
Total verificado: 4 + 5 + 5 = 14 ✅
```

### Passo 5: Gerar Estratégia Multi-Perspectiva

**Para cada perspectiva, gerar estratégia baseada no framework:**

**White-box:** Code Coverage (>80%), Mutation Testing (>70%), TDD/BDD, Jest/PyTest/JUnit  
**Grey-box:** API Contracts (100%), Integration (>95% pass rate), Fuzzing, Postman  
**Black-box:** Equivalence Partitioning, Boundary Analysis, User Journeys (100% coverage), Cypress/Selenium

### Passo 6: Detectar e Configurar Task Manager

**CRÍTICO:** Seguir padrão de `/product/task`:

```bash
# EXECUTAR PRIMEIRO: Ler .env
read_file .env
```

**Extrair do .env:**
- `TASK_MANAGER_PROVIDER` (clickup|asana|linear|none)
- Variáveis de API correspondentes

**Lógica:**
```markdown
SE {{task-manager}} fornecido:
  usar {{task-manager}}
SENÃO:
  usar TASK_MANAGER_PROVIDER do .env
  SE não encontrado: modo offline (dry-run implícito)

SE dry-run = true:
  ⚠️ Modo dry-run: não criar tasks reais
  Gerar apenas estrutura e relatório
```

**Resolver project-id:**
```markdown
SE {{project-id}} fornecido:
  usar diretamente
SENÃO:
  SE clickup: usar CLICKUP_DEFAULT_LIST_ID do .env
  SE asana: usar ASANA_DEFAULT_PROJECT_ID do .env
  SE não encontrado: perguntar ao usuário ou usar padrão
```

### Passo 7: Criar Estrutura de Tasks (SE não dry-run)

**Estrutura hierárquica a criar:**

```markdown
📋 Epic: [Feature Name] - Test Strategy ([X] QA points total)

├── 🔬 White-box Testing ([X] QA points)
│   ├── Unit Tests Setup
│   ├── Coverage Implementation
│   └── Code Review Criteria
│
├── 🔗 Grey-box Testing ([Y] QA points)
│   ├── API Contract Tests
│   ├── Integration Setup
│   └── Cross-team Validation
│
└── 📱 Black-box Testing ([Z] QA points)
    ├── User Journey Tests
    ├── Acceptance Criteria
    └── Exploratory Testing
```

**ClickUp:** Criar Epic com `mcp_ClickUp_clickup_create_task`, depois subtasks por perspectiva com parent=epic.id  
**Asana:** Criar Epic com `mcp_asana_asana_create_task`, estrutura hierárquica via parent  
**None/Dry-run:** Salvar estrutura local em `.cursor/sessions/test-strategies/[feature-name].md`

### Passo 8: Gerar Relatório Detalhado

**Criar arquivo markdown com:**
- Resumo (QA Points, Effort, Risk, Complexity)
- Estratégias detalhadas por perspectiva (White/Grey/Black)
- Técnicas, métricas e ferramentas de cada perspectiva
- Task breakdown (IDs e links se criadas)
- Success metrics e critérios de aceitação
- Referências ao framework

**Salvar:** `reports/test-strategies/test-strategy-[feature-name]-[YYYYMMDD].md`

### Passo 9: Apresentar Resultado Final

## 📤 Output Esperado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ESTRATÉGIA DE TESTE CRIADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Feature: {{feature-name}}
📊 Framework Analysis:
∟ ✓ Framework carregado: framework_testes.md
∟ Risk Level: {{risk-level}} (+X points)
∟ Complexity: {{complexity}} (X-Y base points)

🧮 QA Story Points Calculation:
∟ Base Complexity: [X] points
∟ Risk Adjustment: +[Y] points
∟ Test Coverage: +[Z] points
∟ Total: [TOTAL] QA Story Points

🎭 Multi-Perspective Strategy:
├── 🔬 White-box ([X] points) - Unit testing focus
│   ∟ Coverage: >80%
│   ∟ Mutation Score: >70%
│   ∟ Ferramentas: Jest, PyTest, JUnit
│
├── 🔗 Grey-box ([Y] points) - API integration focus
│   ∟ Integration Pass Rate: >95%
│   ∟ API Contract Coverage: 100%
│   ∟ Ferramentas: Postman, API suites
│
└── 📱 Black-box ([Z] points) - User journey focus
    ∟ User Story Coverage: 100%
    ∟ Bug Detection Rate: >85%
    ∟ Ferramentas: Cypress, Selenium

🔗 Task Manager Integration:
∟ Provedor: [clickup/asana/none]
∟ Epic criado: [ID] - [URL]
∟ Subtasks criadas: [N] tasks
∟ Story points atribuídos automaticamente

📄 Strategy Report:
∟ Arquivo: reports/test-strategies/test-strategy-[feature]-[date].md
∟ Inclui: Estratégia completa + Métricas + Critérios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Próximos Passos:
1. Revisar estratégia gerada
2. Ajustar pontos se necessário
3. Iniciar implementação: /engineer/start [feature-slug]
4. Executar testes conforme estratégia

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📋 Exemplos de Uso

**Checkout Flow:** `/test-strategy/create "checkout-flow" alto complexo --task-manager clickup --project-id 123456`  
→ ~13-14 QA points, Epic no ClickUp

**User Profile (Dry-run):** `/test-strategy/create "user-profile" médio simples --dry-run`  
→ ~5-6 QA points, relatório local apenas

**Payment Integration:** `/test-strategy/create "payment-integration" critico complexo --task-manager asana`  
→ ~15-16 QA points, foco em Black-box

## ⚠️ Validações e Regras

### Validações Obrigatórias

1. **Framework deve existir:**
   ```markdown
   SE framework_testes.md não encontrado:
     ❌ ERRO: Framework não encontrado
     💡 Verifique: docs/knowbase/frameworks/framework_testes.md
   ```

2. **Feature name não vazio:**
   ```markdown
   SE feature-name vazio:
     ❌ ERRO: Nome da funcionalidade é obrigatório
   ```

3. **Cálculo de pontos válido:**
   ```markdown
   SE total_points > 20:
     ⚠️ ALERTA: Estratégia muito grande (>20 pontos)
     💡 Considere quebrar feature em partes menores
   ```

### Regras de Negócio

1. **Sempre citar seções do framework** nas estratégias geradas
2. **Distribuição de pontos** deve somar exatamente o total calculado
3. **Tasks criadas** devem incluir story points como custom field
4. **Relatório** deve ser salvo mesmo em dry-run mode

## 🔗 Referências

- **Framework:** `docs/knowbase/frameworks/framework_testes.md`
- **Task Manager:** `.cursor/utils/task-manager/`
- **Comandos relacionados:** `/product/task`, `/product/estimate`
- **Agentes relacionados:** @test-engineer, @test-planner

## ⚠️ Notas Importantes

- **Framework é obrigatório:** Comando falha se `framework_testes.md` não existir
- **Cálculo preciso:** QA Story Points seguem fórmula exata do framework
- **Multi-perspectiva:** Sempre gera estratégias para todas as 3 perspectivas
- **Dry-run útil:** Use `--dry-run` para validar antes de criar tasks
- **Citações obrigatórias:** Estratégias devem referenciar seções específicas do framework
- **Integração opcional:** Funciona sem task manager (modo offline)

---

**Versão:** 3.0.0  
**Última atualização:** 2025-12-03  
**Mantido por:** Sistema Onion

