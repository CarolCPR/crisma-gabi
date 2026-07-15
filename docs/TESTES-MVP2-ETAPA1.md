# TESTES-MVP2-ETAPA1 — Cenários de validação manual

> **Etapa 1 — Modularização e armazenamento v2**
> Branch: `feature/storage-v2`

---

## Como executar

1. Hospede os arquivos em um servidor HTTP local (ex.: `npx serve .` ou `python3 -m http.server`) **ou** publique no GitHub Pages.
2. Abra o `index.html` via HTTP (não via `file://`, pois ES modules requerem contexto de servidor).
3. Abra o DevTools do navegador (F12) → aba **Console** e **Application → Storage → localStorage**.
4. Siga cada cenário na sequência descrita.

---

## Cenário 1 — Usuário novo (sem dados anteriores)

**Pré-condição:** localStorage vazio (nenhuma das chaves `crismaWeekPlanData` ou `crismaAppData` presente).

**Passos:**
1. Abrir a página pela primeira vez.
2. Verificar que todos os campos estão vazios.
3. Digitar um nome, datas, intenção, selecionar uma virtude e marcar alguns checkboxes.
4. Recarregar a página (`F5`).

**Resultado esperado:**
- Todos os campos preenchidos são restaurados após o reload.
- No DevTools, `crismaAppData` contém `version: 2`, `weeks` com 1 semana e `activeWeekId` preenchido.
- `crismaWeekPlanData` não existe (usuário novo nunca gerou dado legado).
- Nenhuma mensagem de aviso é exibida na tela.

---

## Cenário 2 — Migração de dados do MVP1 (JSON legado válido)

**Pré-condição:** Inserir manualmente no localStorage (DevTools → Application → Local Storage) a chave `crismaWeekPlanData` com o valor:
```json
{"name":"Maria","weekStart":"07/07","weekEnd":"13/07","intention":"Ofereço pela saúde da minha avó","selectedVirtue":"Paciência","customVirtue":"","checkboxes":{"routine-0-0":true,"routine-1-3":true,"exam-2":true}}
```

**Passos:**
1. Garantir que `crismaAppData` **não** existe.
2. Abrir (ou recarregar) a página.

**Resultado esperado:**
- Os campos Nome, Semana de/até, Intenção e Virtude são preenchidos com os dados migrados.
- O chip "Paciência" aparece selecionado.
- Os checkboxes `routine-0-0`, `routine-1-3` e `exam-2` aparecem marcados.
- No DevTools: `crismaAppData` criado com `version: 2`, `meta.migratedFrom: "mvp1"`, `meta.migratedAt` preenchido.
- A chave legada `crismaWeekPlanData` **ainda existe** (não foi apagada).
- Recarregar a página novamente **não duplica** a semana (idempotência).
- Console exibe: `[storage] Migração MVP1 → MVP2 concluída com sucesso. Chave legada preservada.`

---

## Cenário 3 — Virtude predefinida

**Pré-condição:** Página aberta com localStorage vazio.

**Passos:**
1. Clicar no chip "Justiça".
2. Recarregar a página.

**Resultado esperado:**
- Chip "Justiça" continua selecionado após reload.
- Em `crismaAppData`, a semana ativa contém: `virtue: { mode: "predefined", value: "Justiça" }`.
- O campo "outra..." está vazio.

---

## Cenário 4 — Virtude personalizada

**Pré-condição:** Página aberta com localStorage vazio.

**Passos:**
1. Digitar "Humildade" no campo "outra...".
2. Recarregar a página.

**Resultado esperado:**
- O campo "outra..." exibe "Humildade" após reload.
- Nenhum chip predefinido está selecionado.
- Em `crismaAppData`, a semana ativa contém: `virtue: { mode: "custom", value: "Humildade" }`.

**Variante (custom tem precedência):**
1. Selecionar chip "Caridade" e depois digitar "Humildade" no campo "outra...".
2. Recarregar.
3. Apenas "Humildade" é restaurado; o chip "Caridade" não está mais selecionado.

---

## Cenário 5 — Checkboxes (desktop e mobile)

**Pré-condição:** Página aberta com localStorage vazio.

**Passos (desktop, tela > 700px):**
1. Marcar "Oração da manhã — Seg" (primeira célula da tabela).
2. Recarregar.
3. Verificar que o checkbox continua marcado.

**Passos (mobile, tela ≤ 700px ou DevTools em modo responsivo):**
1. Marcar o mesmo item no card correspondente ao dia "Seg".
2. Recarregar.
3. Verificar que o checkbox continua marcado.

**Resultado esperado:**
- Sincronização: marcar na tabela desktop reflete no card mobile (e vice-versa) sem reload.
- Após reload, o estado é restaurado corretamente em ambas as visualizações.
- Em `crismaAppData`, a semana ativa contém `checkboxes: { "routine-0-0": true }`.

---

## Cenário 6 — JSON legado inválido

**Pré-condição:** Inserir no localStorage a chave `crismaWeekPlanData` com valor inválido:
```
{invalid json
```

**Passos:**
1. Garantir que `crismaAppData` **não** existe.
2. Abrir (ou recarregar) a página.

**Resultado esperado:**
- A página carrega normalmente com campos vazios.
- Uma mensagem de aviso amigável é exibida na região de status (ex.: "O plano anterior estava com um formato inválido...").
- A chave `crismaWeekPlanData` **não foi apagada** (verificar no DevTools).
- O console exibe um aviso técnico.

---

## Cenário 7 — JSON v2 inválido em crismaAppData

**Pré-condição:** Inserir no localStorage a chave `crismaAppData` com valor:
```json
{"version":99,"weeks":"corrupted"}
```

**Passos:**
1. Abrir (ou recarregar) a página.

**Resultado esperado:**
- A página carrega com campos vazios (estado inicial seguro).
- Mensagem de aviso é exibida: "Os dados salvos são de uma versão incompatível..."
- A chave `crismaAppData` **não foi apagada** (verificar no DevTools).
- O console exibe um aviso técnico.

---

## Cenário 8 — Armazenamento indisponível

**Pré-condição:** Simular bloqueio do localStorage. Duas opções:
- **Opção A (Firefox):** Navegar em modo privativo em alguns contextos restritos.
- **Opção B (DevTools):** Interceptar `localStorage.setItem` via console:
  ```js
  Object.defineProperty(window, 'localStorage', {
    get: () => { throw new DOMException('SecurityError'); }
  });
  ```
  Em seguida, recarregar.

**Resultado esperado:**
- A página carrega e é utilizável (campos editáveis funcionam).
- Mensagem de erro visível: "O armazenamento local não está disponível..."
- Os dados **não causam crash** nem tela em branco.
- Alterações nos campos não geram exceção não tratada.

---

## Cenário 9 — Limpar plano (apenas semana ativa)

**Pré-condição:** Página com dados preenchidos (nome, intenção, virtude, checkboxes).

**Passos:**
1. Clicar em "Limpar plano".
2. Cancelar no diálogo de confirmação.
3. Verificar que os dados continuam presentes.
4. Clicar em "Limpar plano" novamente.
5. Confirmar no diálogo.

**Resultado esperado:**
- Após cancelar: nenhuma alteração.
- Após confirmar:
  - Os campos de intenção, virtude e checkboxes são limpos **sem reload da página**.
  - O campo Nome é **preservado** (pertence ao perfil raiz).
  - A chave `crismaAppData` ainda existe com `version: 2` e `profile.name` preenchido.
  - A chave `crismaWeekPlanData` (se existente) **não foi apagada**.
  - A semana ativa tem seus campos zerados mas o `id` e `createdAt` são mantidos (ou uma nova semana é criada).

---

## Cenário 10 — GitHub Pages (caminhos relativos e ausência de 404)

**Pré-condição:** Site publicado em GitHub Pages com repositório em subdiretório
(ex.: `https://<usuario>.github.io/crisma-gabi/`).

**Passos:**
1. Acessar a URL do GitHub Pages.
2. Abrir DevTools → aba **Network**.
3. Verificar que todos os recursos são carregados com status 200.

**Recursos a verificar:**
- `css/styles.css` → 200
- `js/app.js` → 200
- `js/constants.js` → 200
- `js/storage.js` → 200
- `js/weeks.js` → 200
- `js/ui.js` → 200
- Fontes do Google Fonts → 200 (ou carregadas do cache)

**Resultado esperado:**
- Nenhum recurso com erro 404.
- A página renderiza corretamente com layout e identidade visual do MVP1.
- Todos os cenários anteriores funcionam na URL do GitHub Pages.
- A impressão via "Imprimir meu plano" gera saída correta (oculta botões, preserva tabela).
