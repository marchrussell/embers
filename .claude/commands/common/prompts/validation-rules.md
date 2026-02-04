# Regras de Validação

## ✅ Validação de Inputs

### Parâmetros Obrigatórios

```markdown
SE parâmetro NÃO fornecido:
  → Perguntar ao usuário
  → NÃO assumir valores
  → NÃO prosseguir sem confirmação
```

### Formato de Parâmetros

| Tipo | Formato | Exemplo |
|------|---------|---------|
| feature-slug | kebab-case | `user-authentication` |
| task-id | alfanumérico | `86adf8jj6` |
| branch-name | kebab-case | `feature/user-auth` |
| version | semver | `1.2.3` |
| date | ISO | `2025-11-24` |

### Validação de Paths

```markdown
✅ Válido: /home/user/project/file.md
✅ Válido: ./relative/path/file.md
❌ Inválido: file.md (sem contexto)
❌ Inválido: ~/path (expandir primeiro)
```

---

## 🔍 Validação de Estado

### Pré-condições Comuns

```markdown
### Verificar Antes de Executar

1. **Workspace válido**
   - [ ] .cursor/ existe
   - [ ] É projeto Onion

2. **Git limpo** (se necessário)
   - [ ] Sem alterações não commitadas
   - [ ] Branch correta

3. **Dependências** (se necessário)
   - [ ] Node modules instalados
   - [ ] Ambiente configurado
```

### Verificação de Arquivos

```bash
# Arquivo existe
test -f "$FILE" && echo "✅ Existe" || echo "❌ Não existe"

# Diretório existe
test -d "$DIR" && echo "✅ Existe" || echo "❌ Não existe"

# Arquivo não vazio
test -s "$FILE" && echo "✅ Tem conteúdo" || echo "⚠️ Vazio"
```

---

## 🚫 Tratamento de Erros

### Níveis de Erro

| Nível | Ação | Exemplo |
|-------|------|---------|
| **Fatal** | Abortar | Arquivo crítico ausente |
| **Erro** | Perguntar | Parâmetro inválido |
| **Aviso** | Informar | Valor não otimal |
| **Info** | Logar | Status informativo |

### Formato de Erro

```markdown
❌ **Erro**: [Descrição clara]

**Causa**: [O que causou]
**Solução**: [Como resolver]

Exemplo:
❌ **Erro**: Arquivo de sessão não encontrado

**Causa**: Sessão 'my-feature' não existe em .cursor/sessions/
**Solução**: Execute `/engineer/start my-feature` primeiro
```

### Fallback Strategy

```markdown
SE erro recuperável:
  1. Tentar recuperação automática
  2. SE falhar → Perguntar ao usuário
  3. SE usuário não disponível → Abortar com instruções

SE erro fatal:
  1. Logar erro detalhado
  2. Abortar imediatamente
  3. Sugerir correção
```

---

## 📋 Validação de Outputs

### Checklist de Output

```markdown
- [ ] Output corresponde ao esperado
- [ ] Formato consistente
- [ ] Sem dados sensíveis expostos
- [ ] Acionável pelo usuário
```

### Formato de Sucesso

```markdown
✅ **Sucesso**: [Descrição]

📁 Arquivos criados/modificados:
∟ path/to/file1.md
∟ path/to/file2.md

🚀 Próximos passos:
∟ Ação 1
∟ Ação 2
```

---

## 🔐 Validação de Segurança

### Nunca Expor

- [ ] API keys/tokens
- [ ] Senhas
- [ ] Dados pessoais
- [ ] Paths absolutos sensíveis

### Sanitização

```markdown
# Antes de logar/exibir:
- Mascarar tokens: pk_xxx...xxx
- Remover credenciais de URLs
- Anonimizar dados pessoais
```

---

## ⚡ Validação Rápida

### One-liners

```bash
# Validar YAML
head -1 file.md | grep -q "^---$" && echo "✅ YAML"

# Validar kebab-case
echo "$VAR" | grep -qE "^[a-z0-9]+(-[a-z0-9]+)*$" && echo "✅"

# Validar semver
echo "$VERSION" | grep -qE "^[0-9]+\.[0-9]+\.[0-9]+$" && echo "✅"
```

