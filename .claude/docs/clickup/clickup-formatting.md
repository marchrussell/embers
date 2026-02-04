# ClickUp MCP - Formatting Utilities

## 🎯 **Dual Formatting Strategy**

### **📋 TEXTO DA TAREFA (Descriptions):**
- **Parameter**: `markdown_description`
- **Formato**: Markdown nativo tradicional
- **Funciona**: `## Headers`, `| Tabelas |`, `- Listas`, `**Bold**`
- **Usado em**: create_task, update_task

### **💬 ATIVIDADES (Comments):**
- **Parameter**: `commentText`
- **Formato**: Formatação visual Unicode
- **Funciona**: `━━━ ∟ ▶ ◆ ✅ 🔧`
- **Usado em**: create_task_comment

---

## 📚 **Templates por Tipo**

### **Para DESCRIPTIONS (Markdown Nativo):**
Use quando criar/atualizar descriptions de tasks via `markdown_description`

### **Para COMMENTS (Visual Unicode):**
Use sempre nos comentários/atividades para garantir formatação consistente:

---

## 📚 **DESCRIPTION Templates (Markdown Nativo)**

### **Task Creation Template:**
```markdown
## 🎯 **Objetivo da Task**

[DESCRIÇÃO_DETALHADA]

---

## 📋 **Escopo de Implementação**

### **✅ Funcionalidades:**
- Feature A - [DESCRIÇÃO]
- Feature B - [DESCRIÇÃO]

### **🔧 Arquitetura Técnica:**
- Componente X modificado
- Integration Y implementada

### **📊 Métricas Esperadas:**

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Performance | [VALOR] | [VALOR] | ✅ |
| Coverage | [VALOR] | [VALOR] | ✅ |

---

## ✅ **Critérios de Aceitação**

- [ ] Funcionalidade A implementada
- [ ] Testes passando > 95%
- [ ] Documentation atualizada
- [ ] Performance dentro do target

**🎯 Success Metric**: [MÉTRICA_PRINCIPAL]
**🕒 Timeline**: [PRAZO_ESTIMADO]
```

---

## 📚 **COMMENT Templates (Visual Unicode)**

### **1. Status Update Template (ClickUp MCP Compatible)**
```
🔄 STATUS UPDATE: [TITLE]

━━━━━━━━━━━━━━━━━━━━━━━━

✅ COMPLETED:
   ∟ [ITEM_1]
   ∟ [ITEM_2]

🔄 IN PROGRESS:
   ▶ [PROGRESS_ITEM_1]
   ▶ [PROGRESS_ITEM_2]

📋 NEXT STEPS:
   ◦ [NEXT_TASK_1]
   ◦ [NEXT_TASK_2]

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Updated: [TIMESTAMP] | 🎯 Status: [CURRENT_STATUS]
```

### **2. PR/Release Template (ClickUp MCP Compatible)**
```
🚀 PULL REQUEST CREATED

━━━━━━━━━━━━━━━━━━━━━━━━

📋 CHANGES IMPLEMENTED:
   ∟ [CHANGE_1]
   ∟ [CHANGE_2]
   ∟ All tests passing ✅

🔗 REVIEW DETAILS:
   ▶ PR: [PR_LINK]
   ▶ Branch: [BRANCH_NAME]
   ▶ Status: Ready for review

✅ CHECKLIST:
   ◆ Code committed and pushed
   ◆ Tests passing
   ◆ Documentation updated
   ◆ Task status updated

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Created: [TIMESTAMP] | 🎯 Next: Code review and approval
```

### **3. Technical Documentation Template**
```markdown
## 📚 **Technical Documentation**

### 🏗️ **Architecture:**
- [COMPONENT_CHANGES]
- [INTEGRATION_DETAILS]

### 🔧 **Implementation:**
```[LANGUAGE]
// Code example if relevant
```

### 📊 **Impact:**
| Aspect | Before | After | Status |
|--------|--------|-------|--------|
| [METRIC_1] | [OLD] | [NEW] | ✅ |
| [METRIC_2] | [OLD] | [NEW] | 🔄 |

---
**📖 Reference**: [DOCUMENTATION_LINK] | **🎯 Impact**: [IMPACT_LEVEL]
```

### **4. Issue/Error Template**
```markdown
## 🚨 **Issue Identified**

### ❌ **Problem:**
[DETAILED_DESCRIPTION]

### 🔍 **Root Cause:**
- **Source**: [ERROR_SOURCE]
- **Files**: [AFFECTED_FILES]
- **Severity**: [HIGH/MEDIUM/LOW]

### 🛠️ **Resolution:**
- [x] Issue investigated
- [ ] Fix implemented
- [ ] Testing completed

### 📊 **Impact Analysis:**
- **Users affected**: [NUMBER/SCOPE]
- **Downtime**: [DURATION]
- **Priority**: [URGENT/HIGH/MEDIUM/LOW]

---
**🔧 Status**: [RESOLVED/IN_PROGRESS/BLOCKED] | **⏰ Reported**: [TIMESTAMP]
```

### **5. Progress Report Template**
```markdown
## 📊 **Development Progress**

### 🎯 **Current Milestone:**
[MILESTONE_NAME] - [PERCENTAGE]% complete

### ✅ **This Week Completed:**
- [ACHIEVEMENT_1]
- [ACHIEVEMENT_2]
- [ACHIEVEMENT_3]

### 🔄 **Currently Working On:**
- [CURRENT_TASK_1]
- [CURRENT_TASK_2]

### 📋 **Next Week Plan:**
- [ ] [PLANNED_TASK_1]
- [ ] [PLANNED_TASK_2]

### 🚧 **Blockers/Issues:**
- [BLOCKER_1] (if any)
- [BLOCKER_2] (if any)

---
**📈 Progress**: [PERCENTAGE]% | **🎯 ETA**: [ESTIMATED_DATE]
```

## 🎨 **Formatting Guidelines**

### **Required Elements:**
1. **Emoji Header**: Every section starts with relevant emoji
2. **Structure**: Use ### for subsections, - for lists
3. **Status Indicators**: ✅ (done), 🔄 (progress), ❌ (blocked), 📋 (todo)
4. **Footer**: Always end with --- separator + timestamp/status
5. **Links**: Format as **Bold**: [LINK] for better visibility

### **Emoji Reference:**
- 🎯 Goals/Objectives
- ✅ Completed/Success
- 🔄 In Progress/Working
- 📋 Lists/Planning
- 🚀 Releases/Launches
- 🛠️ Fixes/Solutions
- 🚨 Issues/Alerts
- 📚 Documentation
- 📊 Data/Metrics
- 🔗 Links/References
- ⏰ Time/Dates
- 🎉 Celebrations/Achievements

### **Table Guidelines:**
Always use tables for:
- Before/After comparisons
- Metrics tracking
- Status matrices
- Feature comparisons

## 🔧 **Implementation for Commands**

### **Engineer Commands:**
```bash
# /engineer/pr
## 🚀 **Pull Request Created**
[USE_PR_TEMPLATE]

# /engineer/start  
## 🔄 **Development Started**
[USE_STATUS_TEMPLATE]
```

### **Product Commands:**
```bash
# /product/task
## 📋 **Task Created**
[USE_TECHNICAL_TEMPLATE]

# /product/collect
## 📊 **Requirements Collected**
[USE_PROGRESS_TEMPLATE]
```

### **Agent Comments:**
```typescript
// Para todos os 16 agentes especializados:
const formatAgentComment = (agentName: string, action: string, details: any) => `
## 🤖 **${agentName} Update**

### 🎯 **Action Performed:**
${action}

### 📋 **Details:**
${details.description}

### ✅ **Results:**
${details.results}

---
**🤖 Agent**: ${agentName} | **⏰ Timestamp**: ${new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})}
`
```

## 📏 **Quality Standards**

### **Readability Checklist:**
- [ ] Clear emoji hierarchy
- [ ] Consistent formatting
- [ ] Logical information flow
- [ ] Actionable next steps
- [ ] Proper timestamp/status

### **Professional Standards:**
- [ ] No spelling/grammar errors
- [ ] Appropriate technical detail level
- [ ] Clear status indicators
- [ ] Useful for stakeholders
- [ ] Consistent with brand voice

---

## 🎯 **Usage Instructions**

1. **Copy template** relevant to your update type
2. **Replace placeholders** with actual information  
3. **Verify formatting** before posting
4. **Include timestamp** and current status
5. **Test rendering** in ClickUp interface

**💡 Pro Tip**: Save commonly used templates as snippets for faster access!
