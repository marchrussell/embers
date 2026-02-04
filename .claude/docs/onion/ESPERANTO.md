## 🚀 **WORKFLOW ESPERANTO PARA PROJETO NOVO (Do Zero)**

> **ℹ️ Sobre o Cursor v2**  
> O Cursor é um IDE com IA integrada baseado no VS Code. Os comandos customizados (`.cursor/commands/`) e agentes (`.cursor/agents/`) são extensões do Sistema Onion e não recursos nativos do Cursor. Use `@Docs`, `@Web` e `@Files` como símbolos nativos do Cursor para contexto adicional.

### **🎯 ANÁLISE DE CONTEXTO**
**Situação**: Repositório vazio + Documentação inicial  
**Objetivo**: Setup completo do sistema Esperanto para projeto novo  
**Estratégia**: Research-First → Documentation-First → Architecture-First

---

## **⚡ SEQUÊNCIA RECOMENDADA PARA PROJETO NOVO**

### **📋 FASE 1: Descoberta e Requisitos (15-30 min)**

```bash
# 1. Preparação inicial do contexto
/warm-up "início do projeto - configuração de novo repositório"

# 2. Coleta estruturada de requisitos  
/collect "requisitos de negócio, restrições técnicas, necessidades dos stakeholders"

# 3. Verificação contra padrões e boas práticas
/check "validar requisitos contra padrões da indústria e restrições do projeto"

# 4. Refinamento dos requisitos coletados
/refine "especificações funcionais e técnicas detalhadas"
```

**🤖 Agentes Customizados (Sistema Onion)**: @research-agent → @metaspec-gate-keeper → @business-analyst  
**📦 Símbolos Nativos do Cursor**: Use `@Docs` para documentação oficial, `@Web` para busca online, `@Files` para contexto de arquivos

---

### **📚 FASE 2: Documentação Base (20-40 min)**

```bash
# 5. Documentação de contexto de negócio
/build-business-docs "visão do projeto, stakeholders, modelo de negócio"

# 6. Documentação de arquitetura técnica
/build-tech-docs "stack tecnológico, decisões de arquitetura, restrições"

# 7. Criação de Documento de Requisitos do Produto
/spec "PRD abrangente com especificações técnicas e de negócio"

# 8. Construção de índices de documentação
/build-index "organizar e estruturar toda a documentação"
```

**📁 Local de Saída**: `docs/business-context/`, `docs/technical-context/`, `docs/meta-specs/`  
**🤖 Agentes Customizados (Sistema Onion)**: @research-agent → @branch-documentation-writer  
**💡 Dica Cursor**: Use `@Docs React` ou `@Docs TypeScript` para acessar documentação oficial durante a escrita

---

### **🏗️ FASE 3: Base Técnica (30-60 min)**

```bash
# 9. Planejamento arquitetural detalhado
/light-arch "arquitetura do sistema, decisões tecnológicas, estratégia de implementação"

# 10. Criação de tarefas de desenvolvimento  
/task "divisão de fases de desenvolvimento e tarefas de implementação"

# 11. Início do setup técnico
/start "configuração da base técnica e estrutura inicial do projeto"
```

**🤖 Agentes Customizados (Sistema Onion)**: Baseado no stack escolhido  
**💡 Dica Cursor**: Use Cmd+K (Mac) ou Ctrl+K (Win/Linux) para gerar código inline durante o setup

---

### **⚙️ FASE 4: Validação e Verificação de Integridade (10-15 min)**

```bash
# 12. Verificação completa do sistema
/docs-health "verificação abrangente de integridade e consistência do sistema"

# 13. Validação de toda documentação
/validate-docs "validar toda documentação para completude e consistência"

# 14. Sincronização de sessões criadas
/sync-sessions "garantir que todo trabalho da sessão esteja devidamente organizado"
```

**🤖 Agentes Customizados (Sistema Onion)**: @metaspec-gate-keeper → @branch-documentation-writer  
**💡 Dica Cursor**: Use o Chat para validar arquitetura: "Analyze project structure and identify potential issues"

---

## **🎯 COMANDOS CRÍTICOS POR ORDEM DE PRIORIDADE**

### **🥇 ALTA PRIORIDADE (Obrigatório)**
1. **`/collect`** - Base de todo projeto, descoberta de requisitos
2. **`/build-business-docs`** - Contexto de negócio fundamental  
3. **`/build-tech-docs`** - Decisões arquiteturais essenciais
4. **`/spec`** - PRD como fonte de verdade do projeto

### **🥈 MÉDIA PRIORIDADE (Recomendado)**  
5. **`/check`** - Validação contra padrões e restrições
6. **`/refine`** - Especificações detalhadas e precisas
7. **`/start`** - Configuração técnica inicial estruturada

### **🥉 BAIXA PRIORIDADE (Opcional)**
8. **`/warm-up`** - Preparação de contexto (pode ser implícito)
9. **`/light-arch`** - Análise arquitetural (pode vir depois)
10. **`/task`** - Divisão de tarefas (pode vir durante desenvolvimento)

---

## **🏃‍♂️ TRILHA RÁPIDA (Projeto Pequeno/Rápido)**

```bash
# Configuração rápida em 30-45 minutos
/collect "coleta rápida de requisitos"
/build-business-docs "contexto de negócio essencial"  
/spec "PRD mínimo viável"
/start "configuração técnica básica"
/docs-health "validação final"
```

## **🎯 TRILHA ABRANGENTE (Projeto Complexo/Corporativo)**

```bash
# Configuração completa em 2-3 horas  
/warm-up → /collect → /check → /refine → 
/build-business-docs → /build-tech-docs → /spec → /build-index →
/light-arch → /task → /start → 
/docs-health → /validate-docs → /sync-sessions
```

---

## **📁 ESTRUTURA ESPERADA APÓS WORKFLOW**

```
projeto-novo/
├── docs/
│   ├── business-context/           # saída do /build-business-docs
│   │   ├── vision.md
│   │   ├── stakeholders.md  
│   │   └── business-model.md
│   ├── technical-context/          # saída do /build-tech-docs
│   │   ├── architecture.md
│   │   ├── technology-stack.md
│   │   └── constraints.md
│   ├── meta-specs/                 # saída do /spec  
│   │   ├── project-prd.md
│   │   └── requirements.md
│   └── index.md                    # saída do /build-index
├── .cursor/
│   ├── sessions/                   # trabalho específico de sessão
│   │   └── [session-name]/         # nome da sessão (ex: feat-user-auth)
│   │       ├── temp/               # arquivos temporários da sessão
│   │       ├── context/            # contexto preservado
│   │       └── artifacts/          # artefatos gerados
│   ├── agents/                     # agentes especializados  
│   └── commands/                   # comandos Esperanto
└── README.md                       # visão geral do projeto
```

### **📂 GERENCIAMENTO DE ARQUIVOS TEMPORÁRIOS**

**⚠️ REGRA CRÍTICA**: Agentes e comandos que precisam criar arquivos temporários DEVEM:

1. **Localização**: Gravar em `.cursor/sessions/[session-name]/temp/`
2. **Nomenclatura**: Usar nome da sessão atual (mesma estratégia do comando `/task`)
3. **Organização**: Manter estrutura clara dentro da sessão
4. **Limpeza**: Remover temporários ao finalizar a task

**Exemplo de Estrutura de Sessão:**
```
.cursor/sessions/feat-user-auth/
├── temp/                          # arquivos temporários
│   ├── migration-script.sql      # scripts de trabalho
│   ├── test-data.json            # dados de teste
│   └── debug-output.log          # logs de depuração
├── context/                       # contexto preservado
│   ├── requirements.md           # requisitos capturados
│   └── decisions.md              # decisões tomadas
└── artifacts/                     # artefatos finais
    ├── implementation-plan.md    # plano de implementação
    └── test-results.md           # resultados de testes
```

**Benefícios:**
- ✅ Isolamento por feature/sessão
- ✅ Contexto preservado entre sessões
- ✅ Fácil limpeza ao finalizar
- ✅ Rastreabilidade de trabalho
- ✅ Não polui o repositório principal

**Integração com Comandos:**
- `/task` cria automaticamente a estrutura de sessão
- Todos os comandos e agentes devem respeitar essa hierarquia
- Use `@Files .cursor/sessions/[session-name]/` para contexto de sessão no Cursor

---

## **🤖 ORQUESTRAÇÃO E RECURSOS DO CURSOR**

### **Agentes Customizados (Sistema Onion):**
Os agentes mencionados (`@research-agent`, `@metaspec-gate-keeper`, etc.) são **extensões customizadas** do Sistema Onion, não recursos nativos do Cursor. Eles são invocados manualmente conforme a necessidade do projeto.

### **Símbolos Nativos do Cursor v2:**
- **`@Docs [framework]`**: Acessa documentação oficial (React, TypeScript, Python, etc.)
- **`@Web [query]`**: Busca informações atualizadas na internet
- **`@Files`**: Adiciona contexto de arquivos específicos ao chat
- **`@Folders`**: Adiciona contexto de pastas inteiras
- **`@Code`**: Referencia símbolos e definições no código
- **`@Git`**: Contexto de mudanças e histórico Git

### **Recursos Nativos do Cursor:**
- **Tab (Autocompletar)**: Sugestões de código contextuais em tempo real
- **Cmd+K / Ctrl+K**: Gerar ou editar código inline com linguagem natural
- **Chat**: Assistente integrado para dúvidas e sugestões
- **Composer**: Edição multi-arquivo com contexto ampliado
- **Modo Max**: Janela de contexto expandida para projetos complexos

### **Modelos de IA Suportados:**
- OpenAI GPT-4.1 (janela de contexto ampliada)
- Anthropic Claude 2 (compreensão avançada)
- Google Gemini 2.5 (processamento de grandes volumes)
- xAI e outros modelos compatíveis

### **Integração com Documentação:**
- **MCP (Model Context Protocol)**: Integre documentação interna da organização
- **Privacidade**: Modo de privacidade onde código nunca é armazenado remotamente
- **Segurança**: Certificação SOC 2 para conformidade corporativa

---

## **⏱️ ESTIMATIVAS DE TEMPO**

- **Trilha Rápida**: 30-45 minutos
- **Trilha Padrão**: 1-2 horas  
- **Trilha Abrangente**: 2-3 horas
- **Trilha Corporativa**: 4-6 horas (múltiplas iterações)

---

## **🎉 RESULTADO FINAL**

Após este workflow você terá:

✅ **Documentação completa** do projeto (negócio + técnica)  
✅ **Meta-especificações** como fonte de verdade  
✅ **Estrutura organizacional** seguindo convenções Esperanto  
✅ **Base técnica** pronta para desenvolvimento  
✅ **Sistema de qualidade** ativo com hooks automáticos  
✅ **Sessões organizadas** para trabalho futuro  

**🚀 PRÓXIMO PASSO APÓS CONFIGURAÇÃO**: `/work "implementação da primeira funcionalidade"`

---

## **📚 RECURSOS ADICIONAIS DO CURSOR V2**

### **Documentação Oficial**
- [Cursor Documentation](https://docs.cursor.com/pt-BR) - Guia completo em português
- [Working with Documentation](https://docs.cursor.com/pt-BR/guides/advanced/working-with-documentation) - Integração de docs
- [Models Guide](https://docs.cursor.com/pt-BR/models) - Modelos de IA disponíveis

### **Melhores Práticas**
- Use `@Docs` sempre que trabalhar com frameworks conhecidos
- Use `@Web` para buscar soluções e tutoriais recentes
- Configure MCP para documentação interna da empresa
- Ative Modo Max para projetos grandes (janela de contexto expandida)
- Use Privacy Mode para código sensível/proprietário

### **Atalhos Essenciais**
- **Cmd/Ctrl + K**: Geração de código inline
- **Cmd/Ctrl + L**: Abrir Chat
- **Tab**: Aceitar sugestão de autocompletar
- **Cmd/Ctrl + Shift + P**: Command Palette (comandos VS Code + Cursor)