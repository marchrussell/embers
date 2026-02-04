# 📅 Padrões Oficiais de Data/Hora - Sistema Onion

## 🚨 **CRÍTICO - PADRÕES OBRIGATÓRIOS**

### **📁 1. Pastas de Sessão Arquivadas**

**✅ FORMATO CORRETO:**
```bash
# Comando para mover sessões
mv .cursor/sessions/nome-sessao .cursor/sessions/archived/$(date +%Y-%m-%d_%H%M)_nome-sessao

# Exemplo de resultado:
2025-09-29_0012_implementar-docs-help/
```

**📋 Padrão**: `YYYY-MM-DD_HHMM_nome-sessao`

---

### **💬 2. Timestamps em Comentários ClickUp**

**✅ FORMATO CORRETO:**
```bash
# Em comandos bash
⏰ Completed: $(date +'%d/%m/%Y %H:%M:%S')

# Em JavaScript (templates)
new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})
```

**📋 Padrão**: `dd/mm/yyyy hh:mm` (formato brasileiro)

---

### **📝 3. Contextos de Sessão e Logs**

**✅ FORMATO CORRETO:**
```bash
**Created**: $(date +'%d/%m/%Y %H:%M:%S')
**Started**: $(date +'%d/%m/%Y %H:%M:%S')
**Emergency Start**: $(date +'%d/%m/%Y %H:%M:%S')
```

**📋 Padrão**: `dd/mm/yyyy hh:mm` (formato brasileiro)

---

### **🕒 4. Headers de Log por Data**

**✅ FORMATO CORRETO:**
```bash
### **$(date +'%d/%m/%Y') - Session Initialization**
```

**📋 Padrão**: `dd/mm/yyyy` (formato brasileiro)

---

## ❌ **FORMATOS PROIBIDOS**

### **🚫 Não Use:**
```bash
# ERRADO - formato americano/ISO em contextos de usuário
$(date +'%Y-%m-%d %H:%M:%S')
$(date +'%Y-%m-%d %H:%M')

# ERRADO - JavaScript genérico
new Date().toLocaleString()  // Varia por região

# ERRADO - formato misto
$(date +'%d-%m-%Y %H:%M')
```

---

## 📋 **Checklist de Validação**

### **✅ Antes de Commitar:**
- [ ] Pastas arquivadas usam `YYYY-MM-DD_HHMM_nome`
- [ ] Comentários ClickUp usam `dd/mm/yyyy hh:mm`
- [ ] Contextos de sessão usam `dd/mm/yyyy hh:mm`
- [ ] JavaScript usa `toLocaleString('pt-BR', options)`
- [ ] Headers de log usam `dd/mm/yyyy`

### **🔍 Comandos de Verificação:**
```bash
# Buscar padrões incorretos
grep -r "Y-%m-%d %H:%M" .cursor/commands/
grep -r "toLocaleString()" .cursor/utils/

# Buscar padrões corretos
grep -r "%d/%m/%Y %H:%M" .cursor/commands/
```

---

## 🛠️ **Ferramentas de Correção**

### **Busca e Substituição Automática:**
```bash
# Corrigir formato de data em contextos
sed -i 's/\$(date +'\''%Y-%m-%d %H:%M:%S'\'')/\$(date +'\''%d\/%m\/%Y %H:%M'\'')/g' arquivo.md

# Corrigir formato de data em timestamps
sed -i 's/\$(date +'\''%Y-%m-%d %H:%M'\'')/\$(date +'\''%d\/%m\/%Y %H:%M'\'')/g' arquivo.md
```

---

## 📚 **Referências**

### **Documentos Corrigidos:**
- ✅ `.cursor/commands/git/feature/start.md`
- ✅ `.cursor/commands/engineer/hotfix.md`
- ✅ `.cursor/commands/git/hotfix/start.md`
- ✅ `.cursor/utils/clickup-comment-formatter.md`
- ✅ `.cursor/docs/clickup/clickup-formatting.md`

### **Documentos Já Corretos:**
- ✅ `.cursor/commands/git/README.md` (linha 464)

---

## 🎯 **Importância**

**📊 Consistência de UX:**
- Usuários brasileiros esperam formato `dd/mm/yyyy`
- Comentários ClickUp devem ser legíveis para stakeholders
- Uniformidade em todo o sistema

**🔧 Manutenibilidade:**
- Padrão único facilita manutenção
- Busca e substituição automática
- Validação automatizada

**🌍 Localização:**
- Adequado para usuários brasileiros
- JavaScript configurado para pt-BR
- Comandos bash com formato brasileiro

---

## ⚠️ **ATENÇÃO ESPECIAL**

### **Contextos que Requerem Cuidado:**
1. **Sessions Archiving** - Nome da pasta vs timestamps internos
2. **ClickUp Integration** - Comentários vs task descriptions  
3. **Git Commands** - Logs vs metadados
4. **JavaScript Templates** - Locale correto vs fallback

### **🚨 ERRO CRÍTICO IDENTIFICADO:**
**NEVER use bash commands in ClickUp comments!**

❌ **INCORRETO**:
```bash
# Em comentários ClickUp - NÃO FUNCIONA
⏰ Setup Complete: $(date +'%d/%m/%Y %H:%M:%S')
```

✅ **CORRETO**:
```bash
# Gerar timestamp ANTES de enviar para ClickUp
TIMESTAMP=$(date +'%d/%m/%Y %H:%M:%S')
# Então usar $TIMESTAMP no comentário ClickUp
⏰ Setup Complete: 29/09/2025 00:18
```

**Razão**: ClickUp não executa comandos bash - exibe literalmente `$(date +...)` no comentário.

### **Validação Obrigatória:**
Todo novo comando ou template que gere data/hora deve ser validado contra este documento antes do merge.

---

**🧅 Padrões mantidos pelo Sistema Onion**  
**📅 Última atualização: 29/09/2025 00:15**
