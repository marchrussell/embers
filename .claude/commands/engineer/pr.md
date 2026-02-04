---
name: pr
description: Criar Pull Request com integração GitFlow e sync automático.
model: sonnet
category: engineer
tags: [pr, gitflow, workflow]
version: "3.0.0"
updated: "2025-11-24"
---

# 🚀 Engineer PR - GitFlow Integrated

Você é um assistente especializado em **criação de Pull Requests** com integração automática ao novo sistema `/git/sync` otimizado do Sistema Onion.

## 🤖 **Nova Integração GitFlow**
Este comando agora inclui **sync automático pós-merge** usando:
- **GitFlow Analysis** via @gitflow-specialist
- **Performance otimizada** (cache + operações paralelas) 
- **Cleanup inteligente** baseado na estratégia de branch
- **Session archiving** automático
- **ClickUp auto-update** para status "Done"

---

Agora é solicitado que você faça um PR. Siga estes passos cuidadosamente para completar a tarefa:

1. Primeiro, garanta que todos os testes estão funcionando para a branch atual. Execute a suíte de testes apropriada para seu projeto e confirme que todos os testes passam. Se algum teste falhar, corrija os problemas antes de prosseguir.

2. **CRÍTICO - Criar Feature Branch PRIMEIRO:**
   a. Crie uma feature branch a partir da branch base (develop/main):
      ```bash
      git checkout -b feature/[descricao-sucinta]
      git push -u origin feature/[descricao-sucinta]
      ```
   b. Faça commit das mudanças que você fez. Use uma mensagem de commit clara e concisa que resuma as alterações.
   c. Push dos commits para a feature branch.

3. Mova a task do ClickUp associada com esta tarefa para o status "in progress" e adicione a tag "under-review".

4. Adicione um comentário na task do ClickUp documentando o PR:

**Chamar abstração MCP para comentário automatizado:**

```typescript
// Ao criar PR, chamar:
await commentPRCreated(taskId, {
  prUrl: "[PR_URL]",
  branch: "[branch-name]",
  changesDescription: "[descrição das mudanças]",
  testsStatus: "passing|review|pending"
});
```

**Referências:**
- **Padrão 3 (PR Criada)**: `.cursor/docs/strategies/clickup-comment-patterns.md`
- **Abstração MCP**: `commentPRCreated()` em `.cursor/utils/clickup-mcp-wrappers.md` (linhas 632-661) 

5. Abra um Pull Request (PR) com os detalhes da implementação:

   Importante: Não mencione nenhum código relacionado a AI ou assistentes de IA no PR.

6. Após abrir o PR, aguarde 3 minutos e então verifique comentários da ferramenta automatizada de code review. Se nenhum comentário aparecer, aguarde mais 3 minutos e verifique novamente.

7. Uma vez que você receba comentários da ferramenta automatizada de code review, analise cada comentário cuidadosamente. Determine quais comentários requerem correções e quais podem ser ignorados com segurança ou explicados. Apresente suas sugestões ao usuário e peça permissão para fazer as mudanças.

8. Para os comentários que requerem correções:
   a. Faça as mudanças necessárias no código
   b. Faça commit dessas mudanças com uma mensagem de commit clara
   c. Faça push do(s) novo(s) commit(s) para a mesma branch

9. Após abordar os comentários e fazer push das atualizações, aguarde a confirmação de merge do PR.

10. **NOVO - Sync Automático Pós-Merge**: Uma vez que o PR for merged, execute automaticamente:
    ```bash
    /git/sync
    ```
    Este comando agora inclui:
    - 🤖 **GitFlow Analysis** com @gitflow-specialist 
    - ⚡ **Performance otimizada** (cache + operações paralelas)
    - 🧹 **Cleanup inteligente** baseado na estratégia GitFlow
    - 📁 **Session management** automático com archiving
    - 🔗 **ClickUp auto-update** para status "Done"
    
    O sync será executado automaticamente com a estratégia otimizada baseada no tipo de branch e workflow detectado.

REGRA DE OURO: Sempre faça commit APENAS dos arquivos que você alterou. SE houver mais arquivos, pergunte ao usuário se eels devem ser incluidos. Não use `git add .` para prevenir commits de arquivos que não deveriam ser commitados, a não ser que o usuario confirme.

Seu output final deve ser uma mensagem para o usuário, formatada da seguinte forma:

<task_completion_message>
Tarefa completada:
- Testes estão passando
- Mudanças commitadas
- Task do ClickUp [INSERT TASK ID] movida para "in progress" com tag "under-review"
- PR aberto: [INSERT PR TITLE]
- Comentários do code review automatizado abordados e correções pushed
- 🤖 GitFlow integration: Auto-sync configurado para pós-merge

O PR está agora pronto para sua revisão final e merge manual.

🚀 APÓS O MERGE: O comando `/git/sync` será executado automaticamente com:
   ∟ GitFlow analysis via @gitflow-specialist
   ∟ Performance otimizada (cache + operações paralelas)
   ∟ Cleanup inteligente baseado na estratégia GitFlow
   ∟ Session archiving automático
   ∟ ClickUp auto-update para status "Done"

[INSERT PR LINK]
</task_completion_message>

