# 🚀 Configuração Inicial - Sistema Onion

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração do ClickUp MCP](#-configuração-do-clickup-mcp)
- [Configuração do Workspace](#-configuração-do-workspace)
- [Padrões de Nomenclatura](#-padrões-de-nomenclatura)
- [Primeiro Uso](#-primeiro-uso)
- [Verificação de Instalação](#-verificação-de-instalação)
- [Próximos Passos](#-próximos-passos)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Pré-requisitos

### Software Necessário

#### 1. Cursor IDE
- **Versão:** v0.43+ (Cursor v2)
- **Download:** [cursor.sh](https://cursor.sh)
- **Licença:** Pro recomendada para features completas

#### 2. Node.js
- **Versão:** v18+ ou v20+ (LTS recomendado)
- **Download:** [nodejs.org](https://nodejs.org)
- **Verificar:**
```bash
node --version  # v18.x.x ou v20.x.x
npm --version   # 9.x.x ou 10.x.x
```

#### 3. Git
- **Versão:** v2.30+
- **Download:** [git-scm.com](https://git-scm.com)
- **Verificar:**
```bash
git --version  # git version 2.30.x ou superior
```

#### 4. ClickUp Account
- **Plano:** Free, Unlimited, Business ou Enterprise
- **Acesso:** Workspace com permissões de criação de tasks
- **API Key:** Necessária para integração MCP

---

## 🔧 Instalação

### Passo 1: Clonar/Inicializar Projeto

#### Opção A: Projeto Novo
```bash
# Criar diretório do projeto
mkdir meu-projeto
cd meu-projeto

# Inicializar Git
git init

# Inicializar Node.js (se aplicável)
npm init -y
```

#### Opção B: Projeto Existente
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto

# Instalar dependências
npm install
```

---

### Passo 2: Instalar Sistema Onion

#### Opção A: Via Git Submodule (Recomendado)
```bash
# Adicionar Sistema Onion como submodule
git submodule add https://github.com/seu-usuario/sistema-onion.git .cursor

# Inicializar submodule
git submodule update --init --recursive
```

#### Opção B: Copiar Manualmente
```bash
# Baixar Sistema Onion
git clone https://github.com/seu-usuario/sistema-onion.git temp-onion

# Copiar para .cursor/
cp -r temp-onion/.cursor .

# Limpar
rm -rf temp-onion
```

---

### Passo 3: Estrutura de Diretórios

Após instalação, você deve ter:

```
seu-projeto/
├── .cursor/
│   ├── commands/           # 56 comandos
│   ├── agents/             # 37 agentes
│   ├── docs/               # Documentação
│   │   ├── onion/          # Docs do Sistema Onion
│   │   ├── tools/          # Docs de ferramentas
│   │   └── templates/      # Templates v2
│   ├── sessions/           # Sessões de desenvolvimento
│   └── rules/              # Regras do workspace
├── docs/                   # Documentação do projeto
├── src/                    # Código fonte
└── README.md
```

---

## 🔗 Configuração do ClickUp MCP

### Passo 1: Obter API Key

1. Acesse [ClickUp Settings](https://app.clickup.com/settings/apps)
2. Navegue para **Apps** → **API Token**
3. Clique em **Generate** ou **Regenerate**
4. Copie o token (formato: `pk_XXXXXXXX...`)

⚠️ **Importante:** Guarde o token em local seguro!

---

### Passo 2: Configurar MCP no Cursor

#### Arquivo de Configuração
Criar/editar `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["-y", "@clickup/mcp-server"],
      "env": {
        "CLICKUP_API_KEY": "pk_XXXXXXXX..."
      }
    }
  }
}
```

#### Variáveis de Ambiente (Alternativa Segura)
```bash
# .env (não commitar!)
CLICKUP_API_KEY=pk_XXXXXXXX...
CLICKUP_WORKSPACE_ID=90131412
```

---

### Passo 3: Obter Workspace ID

#### Método 1: Via URL
```
https://app.clickup.com/XXXXXXXX/home
                        ^^^^^^^^
                        Workspace ID
```

#### Método 2: Via API
```bash
curl -H "Authorization: pk_XXXXXXXX..." \
     https://api.clickup.com/api/v2/team
```

---

### Passo 4: Obter List ID

1. Acesse seu workspace no ClickUp
2. Navegue para a **List** onde deseja criar tasks
3. Copie o ID da URL:
```
https://app.clickup.com/XXXXXXXX/v/li/YYYYYYYY
                                        ^^^^^^^^
                                        List ID
```

---

### Passo 5: Testar Conexão

```bash
# No Cursor, executar:
# (usar ferramenta de teste do MCP)

# Ou via curl:
curl -H "Authorization: pk_XXXXXXXX..." \
     https://api.clickup.com/api/v2/list/YYYYYYYY
```

**Resposta esperada:**
```json
{
  "id": "YYYYYYYY",
  "name": "Tarefas",
  "status": {...}
}
```

---

## ⚙️ Configuração do Workspace

### Passo 1: Configurar `.cursorrules`

Criar/editar `.cursorrules`:

```markdown
# Regras do Projeto

## Linguagem e Documentação
- Comentários e documentação: Português brasileiro (pt-BR)
- Código, variáveis, funções: Inglês
- Commits: Português brasileiro
- Logs e debugging: Inglês

## Padrões de Nomenclatura
- Sessões: `<feature-slug>` (kebab-case)
- Branches: `feature/<feature-slug>`
- Commits: Conventional Commits (feat:, fix:, docs:, etc)

## Integração ClickUp
- Workspace ID: 90131412
- List ID (Tarefas): 901314121395
- Auto-update: Habilitado
- Formatação: Dual (Markdown + Unicode)
```

---

### Passo 2: Configurar `.cursorignore`

Criar `.cursorignore` para otimizar performance:

```
# Dependencies
node_modules/
.pnpm-store/
.yarn/

# Build outputs
dist/
build/
.next/
.nuxt/

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporários
*.tmp
*.temp
.cache/

# Grandes arquivos
*.mp4
*.mov
*.zip
*.tar.gz
```

---

### Passo 3: Configurar GitFlow

```bash
# Inicializar GitFlow
/git/init

# Ou manualmente:
git flow init -d  # -d para defaults
```

**Configuração padrão:**
- Branch de produção: `main`
- Branch de desenvolvimento: `develop`
- Prefixo de feature: `feature/`
- Prefixo de release: `release/`
- Prefixo de hotfix: `hotfix/`

---

## 📐 Padrões de Nomenclatura

### 🎯 Padrão Único: `<feature-slug>`

O Sistema Onion usa **kebab-case** para todos os nomes de features, branches e sessões.

#### **Formato**
```
<feature-slug>
```

**Características:**
- Minúsculas apenas
- Palavras separadas por hífen (`-`)
- Sem caracteres especiais, espaços ou underscores
- Descritivo e conciso (2-5 palavras)

#### **Exemplos Corretos** ✅
```bash
user-authentication
payment-integration
api-v2-migration
dashboard-filters-advanced
oauth-google-integration
fix-payment-timeout
```

#### **Exemplos Incorretos** ❌
```bash
user_authentication      # ❌ underscore (snake_case)
userAuthentication       # ❌ camelCase
USER-AUTH               # ❌ maiúsculas
user auth               # ❌ espaços
user@auth               # ❌ caracteres especiais
```

### 🔑 Diferença Importante

#### `<feature-slug>` (Slug)
**O que é:** Nome kebab-case da feature  
**Onde usar:**
- Branches Git: `feature/<feature-slug>`
- Sessões: `.cursor/sessions/<feature-slug>/`
- Comandos: `/engineer/start <feature-slug>`

**Exemplo:** `user-authentication`

#### `<task-id>` (ID ClickUp)
**O que é:** ID alfanumérico único do ClickUp  
**Onde usar:**
- API calls do ClickUp MCP
- Arquivo `context.md` (Task ID: xxx)
- Referências diretas a tasks

**Exemplo:** `86acu8pdk`

### 📝 Conversão Automática

O sistema converte automaticamente nomes para kebab-case:

| Input (Nome da Task) | Output (feature-slug) |
|---------------------|----------------------|
| "Implementar Autenticação JWT" | `implementar-autenticacao-jwt` |
| "Adicionar Filtros Avançados" | `adicionar-filtros-avancados` |
| "Fix: Bug no Login" | `fix-bug-no-login` |

### 🌿 Uso em Comandos

```bash
# Criar task estruturada
/product/task "Implementar Autenticação JWT"
# → Gera: feature-slug = implementar-autenticacao-jwt

# Iniciar desenvolvimento
/engineer/start implementar-autenticacao-jwt

# Branch criada automaticamente
# → feature/implementar-autenticacao-jwt

# Sessão criada automaticamente
# → .cursor/sessions/implementar-autenticacao-jwt/
```

### 📚 Documentação Completa

Para mais detalhes:
- [Naming Conventions](.cursor/docs/onion/naming-conventions.md) - Padrões de nomenclatura
- [Maintenance Checklist](.cursor/docs/onion/maintenance-checklist.md) - Guia de manutenção

---

## 🎯 Primeiro Uso

### Tutorial Passo a Passo

#### 1. Criar Primeira Task
```bash
/product/task "Configurar ambiente de desenvolvimento"
```

**Resultado esperado:**
```
✅ TASK CRIADA

📋 ClickUp: https://app.clickup.com/t/86xyz123
🌿 Branch: feature/configurar-ambiente
📁 Sessão: .cursor/sessions/configurar-ambiente/
```

---

#### 2. Iniciar Desenvolvimento
```bash
/engineer/start configurar-ambiente
```

**O que acontece:**
1. Análise da task
2. Questões de clarificação
3. Criação de arquitetura
4. Geração de plano
5. Atualização do ClickUp

---

#### 3. Implementar
```bash
/engineer/work configurar-ambiente
```

**Ciclo:**
1. Lê plano
2. Implementa fase atual
3. Pede validação
4. Atualiza ClickUp
5. Próxima fase

---

#### 4. Criar PR
```bash
/engineer/pr
```

**Resultado:**
- ✅ PR criado
- ✅ ClickUp atualizado
- ✅ Code review solicitado

---

#### 5. Finalizar
```bash
# Após merge
/git/sync
```

**Resultado:**
- ✅ Branches sincronizadas
- ✅ Sessão arquivada
- ✅ ClickUp → "Done"

---

## ✅ Verificação de Instalação

### Checklist de Validação

#### 1. Estrutura de Diretórios
```bash
# Verificar estrutura
ls -la .cursor/

# Deve mostrar:
# commands/
# agents/
# docs/
# sessions/
# rules/
```

#### 2. Comandos Disponíveis
```bash
# Testar comando simples
/docs/help

# Deve mostrar ajuda de comandos de documentação
```

#### 3. Agentes Disponíveis
```bash
# Testar agente
@cursor-specialist "Olá, está funcionando?"

# Deve responder com informações sobre o Cursor
```

#### 4. ClickUp MCP
```bash
# Criar task de teste
/product/task "Task de teste do sistema"

# Deve criar task no ClickUp
```

#### 5. GitFlow
```bash
# Verificar branches
git branch -a

# Deve mostrar:
# * main
#   develop
```

---

### Script de Validação Automática

```bash
#!/bin/bash
# validate-onion.sh

echo "🔍 Validando Sistema Onion..."

# 1. Estrutura
if [ -d ".cursor/commands" ] && [ -d ".cursor/agents" ]; then
  echo "✅ Estrutura de diretórios OK"
else
  echo "❌ Estrutura de diretórios incompleta"
  exit 1
fi

# 2. Comandos
COMMANDS=$(find .cursor/commands -name "*.md" | wc -l)
echo "✅ Comandos encontrados: $COMMANDS"

# 3. Agentes
AGENTS=$(find .cursor/agents -name "*.md" | wc -l)
echo "✅ Agentes encontrados: $AGENTS"

# 4. Git
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "✅ Git inicializado"
else
  echo "❌ Git não inicializado"
  exit 1
fi

# 5. Node.js
if command -v node > /dev/null 2>&1; then
  echo "✅ Node.js $(node --version)"
else
  echo "⚠️  Node.js não encontrado (opcional)"
fi

echo "🎉 Validação completa!"
```

**Executar:**
```bash
chmod +x validate-onion.sh
./validate-onion.sh
```

---

## 🚀 Próximos Passos

### 1. Explorar Documentação
```bash
# Ler guias
cat .cursor/docs/onion/commands-guide.md
cat .cursor/docs/onion/engineering-flows.md
cat .cursor/docs/onion/clickup-integration.md
```

### 2. Experimentar Comandos
```bash
# Comandos básicos
/docs/build-business-docs
/docs/build-tech-docs
/docs/build-index
```

### 3. Criar Primeira Feature Real
```bash
# Workflow completo
/product/task "Sua primeira feature"
/engineer/start sua-primeira-feature
/engineer/work sua-primeira-feature
/engineer/pr
```

### 4. Personalizar Sistema
- Adicionar comandos customizados (`/meta/create-command`)
- Criar agentes especializados (`/meta/create-agent`)
- Ajustar regras no `.cursorrules`

### 5. Integrar com CI/CD
- Configurar GitHub Actions / GitLab CI
- Automatizar testes
- Deploy automático

---

## 🔧 Troubleshooting

### Problema 1: ClickUp MCP não conecta

**Sintomas:**
- Comandos `/product/task` falham
- Erro de autenticação

**Soluções:**
```bash
# 1. Verificar API key
echo $CLICKUP_API_KEY

# 2. Testar manualmente
curl -H "Authorization: $CLICKUP_API_KEY" \
     https://api.clickup.com/api/v2/team

# 3. Regenerar API key no ClickUp
# 4. Atualizar .cursor/mcp.json
```

---

### Problema 2: Comandos não funcionam

**Sintomas:**
- Comandos não são reconhecidos
- Erro "Command not found"

**Soluções:**
```bash
# 1. Verificar estrutura
ls .cursor/commands/

# 2. Recarregar Cursor
# Cmd/Ctrl + Shift + P → "Reload Window"

# 3. Verificar .cursorrules
cat .cursorrules
```

---

### Problema 3: GitFlow não inicializado

**Sintomas:**
- Erro ao criar feature branches
- Branch develop não existe

**Solução:**
```bash
# Inicializar GitFlow
/git/init

# Ou manualmente
git flow init -d
```

---

### Problema 4: Performance lenta

**Sintomas:**
- Cursor lento
- Indexação demora muito

**Soluções:**
```bash
# 1. Otimizar .cursorignore
# Adicionar node_modules/, dist/, etc

# 2. Limpar cache
# Cmd/Ctrl + Shift + P → "Clear Cache"

# 3. Reduzir context window
# Settings → Context → Reduce size
```

---

### Problema 5: Sessões não criadas

**Sintomas:**
- Diretório `.cursor/sessions/` vazio
- Erro ao executar `/engineer/work`

**Solução:**
```bash
# Criar sessão manualmente
mkdir -p .cursor/sessions/<feature-slug>

# Ou executar /engineer/start
/engineer/start <feature-slug>
```

---

## 📞 Suporte e Recursos

### Documentação
- [Guia de Comandos](./commands-guide.md)
- [Fluxos de Engenharia](./engineering-flows.md)
- [Integração ClickUp](./clickup-integration.md)
- [Referência de Agentes](./agents-reference.md)
- [Exemplos Práticos](./practical-examples.md)

### Comunidade
- GitHub Issues: [link]
- Discord: [link]
- Documentação Online: [link]

### Atualizações
```bash
# Atualizar Sistema Onion (se submodule)
git submodule update --remote .cursor

# Ou pull manual
cd .cursor
git pull origin main
```

---

**Última atualização:** 2025-01-27  
**Versão:** 2.0  
**Status:** Pronto para uso! 🎉

