# TESTES-MVP2-ETAPA6 — Validação final e publicação

> **Etapa 6 — Testes e publicação do MVP2**
> Branch: `feature/storage-v2`

---

## Como executar

1. Hospede os arquivos em um servidor HTTP local (ex.: `npx serve .` ou `python3 -m http.server`) **ou** acesse o GitHub Pages.
2. Abra o `index.html` via HTTP (não via `file://`, pois ES modules requerem contexto de servidor).
3. Abra o DevTools do navegador (F12) → aba **Console** e **Application → Storage → localStorage**.
4. Siga cada cenário na sequência descrita.
5. Repita os cenários críticos nos navegadores: Chrome, Edge, Firefox, Safari.

---

## Cenário 1 — Iniciar nova semana

**Pré-condição:** Página com uma semana preenchida (nome, intenção, virtude e checkboxes).

**Passos:**
1. Clicar em **"Nova semana"**.
2. Cancelar o diálogo de conclusão quando perguntado se deseja concluir a semana atual.
3. Verificar que o formulário exibe uma nova semana vazia (datas adiantadas em 7 dias).
4. Clicar em **"Nova semana"** novamente e confirmar a conclusão da semana anterior.

**Resultado esperado:**
- Após cancelar o diálogo: nova semana criada com status `in_progress`; semana anterior preservada no histórico com status `in_progress`.
- Após confirmar: nova semana criada; semana anterior aparece no histórico com status `Concluída`.
- O campo **Nome** é preservado nas duas situações.
- Os campos intenção, virtude e checkboxes estão em branco na nova semana.
- As datas da nova semana são preenchidas automaticamente (segunda-feira seguinte à última semana).
- `crismaAppData` contém duas entradas em `weeks`.

---

## Cenário 2 — Criação de três semanas e persistência após reload

**Pré-condição:** localStorage limpo.

**Passos:**
1. Preencher Nome, Intenção e marcar alguns checkboxes.
2. Clicar em **"Nova semana"** → confirmar.
3. Preencher uma intenção diferente.
4. Clicar em **"Nova semana"** → confirmar.
5. Preencher uma intenção diferente.
6. Recarregar a página (F5).

**Resultado esperado:**
- Três semanas existem em `crismaAppData.weeks`.
- A semana mais recente está ativa após o reload.
- As outras duas aparecem no histórico.
- As intenções específicas de cada semana estão preservadas.
- O critério de aceite da Etapa 2 está satisfeito.

---

## Cenário 3 — Área "Minha caminhada" e ordenação

**Pré-condição:** Três ou mais semanas criadas conforme Cenário 2.

**Passos:**
1. Observar a seção **"Minha caminhada"**.

**Resultado esperado:**
- Os cartões são exibidos da semana mais recente para a mais antiga.
- Cada cartão mostra: intervalo da semana, virtude, quantidade de momentos e status.
- A semana ativa exibe o botão desabilitado **"Semana aberta"** no lugar de **"Visualizar"**.

---

## Cenário 4 — Visualizar e retornar à semana atual

**Pré-condição:** Duas ou mais semanas criadas.

**Passos:**
1. Clicar em **"Visualizar"** em uma semana anterior do histórico.
2. Observar o banner exibido acima do formulário.
3. Clicar em **"Voltar para esta semana"**.

**Resultado esperado:**
- Ao abrir uma semana anterior, o banner exibe: "Você está visualizando a semana de DD/MM a DD/MM."
- Após clicar em **"Voltar para esta semana"**, o banner desaparece e a semana atual é exibida.
- O plano atual não sofreu nenhuma alteração.

---

## Cenário 5 — Editar semana anterior

**Pré-condição:** Duas ou mais semanas criadas.

**Passos:**
1. Clicar em **"Visualizar"** em uma semana anterior.
2. Alterar a intenção.
3. Recarregar a página.

**Resultado esperado:**
- A alteração é salva automaticamente (auto-save ao digitar).
- Após reload, a semana anterior mantém a intenção modificada.

---

## Cenário 6 — Excluir semana do histórico

**Pré-condição:** Duas ou mais semanas criadas.

**Passos:**
1. Clicar em **"Excluir"** em uma semana do histórico.
2. Cancelar o diálogo de confirmação.
3. Clicar em **"Excluir"** novamente e confirmar.

**Resultado esperado:**
- Após cancelar: nenhuma alteração.
- Após confirmar: a semana é removida do histórico e de `crismaAppData.weeks`.
- Se a semana excluída era a ativa, a próxima semana disponível torna-se ativa.
- Se era a última semana, uma nova semana é criada automaticamente.

---

## Cenário 7 — Imprimir semana anterior

**Pré-condição:** Duas ou mais semanas criadas.

**Passos:**
1. Clicar em **"Visualizar"** em uma semana anterior.
2. Clicar em **"Imprimir"** no cartão daquela semana.

**Resultado esperado:**
- A semana selecionada é aberta no formulário antes da impressão.
- O diálogo de impressão do navegador é acionado.
- A versão impressa mostra o plano da semana correta.

---

## Cenário 8 — Exportar backup

**Pré-condição:** Duas ou mais semanas criadas.

**Passos:**
1. Clicar em **"Exportar meus dados"**.
2. Confirmar o download do arquivo.
3. Abrir o arquivo JSON em um editor de texto.

**Resultado esperado:**
- O arquivo é baixado com o nome `plano-crisma-backup-AAAA-MM-DD.json`.
- O conteúdo contém: `version`, `exportedAt` e `data` com `weeks` e perfil.
- O arquivo não contém código executável.
- Uma mensagem de sucesso é exibida na tela.

---

## Cenário 9 — Importar backup (substituir)

**Pré-condição:** Arquivo de backup exportado no Cenário 8. Abrir o site em outro navegador ou limpar o localStorage atual.

**Passos:**
1. Clicar em **"Importar backup"**.
2. Selecionar o arquivo exportado.
3. Quando perguntado, digitar `1` (substituir) e confirmar.

**Resultado esperado:**
- Todas as semanas do backup são restauradas.
- O perfil (nome) é recuperado.
- As estatísticas refletem os dados importados.
- O critério de aceite da Etapa 4 está satisfeito: backup exportado em um navegador pode ser recuperado em outro.

---

## Cenário 10 — Importar backup (mesclar)

**Pré-condição:** Backup exportado de uma sessão anterior. Criar uma semana nova no navegador atual (diferente das do backup).

**Passos:**
1. Clicar em **"Importar backup"**.
2. Selecionar o arquivo.
3. Quando perguntado, digitar `2` (mesclar).

**Resultado esperado:**
- Semanas do backup que não existiam localmente são adicionadas.
- Semanas existentes em ambos com o mesmo `id` mantêm a versão com `updatedAt` mais recente.
- Nenhuma semana é duplicada.

---

## Cenário 11 — Importar backup inválido

**Pré-condição:** Criar um arquivo JSON qualquer sem a estrutura esperada (ex.: `{"foo":"bar"}`).

**Passos:**
1. Clicar em **"Importar backup"**.
2. Selecionar o arquivo inválido.

**Resultado esperado:**
- O sistema rejeita o arquivo.
- Uma mensagem de erro clara é exibida (ex.: "Estrutura de dados inválida no backup." ou "Versão do backup incompatível.").
- Os dados atuais não são modificados.

---

## Cenário 12 — Importar arquivo corrompido (JSON inválido)

**Pré-condição:** Criar um arquivo com texto inválido (ex.: `{invalid json`).

**Passos:**
1. Clicar em **"Importar backup"**.
2. Selecionar o arquivo.

**Resultado esperado:**
- O sistema exibe uma mensagem de erro amigável.
- Os dados locais não são alterados.

---

## Cenário 13 — Cancelar importação

**Passos:**
1. Clicar em **"Importar backup"**.
2. Selecionar um arquivo válido.
3. Quando perguntado, digitar `0` (cancelar) ou fechar o diálogo.

**Resultado esperado:**
- Nenhuma alteração nos dados atuais.

---

## Cenário 14 — Estatísticas pessoais

**Pré-condição:** Três ou mais semanas com intenções e checkboxes variados; pelo menos uma semana concluída.

**Passos:**
1. Observar a seção **"Estatísticas pessoais"**.

**Resultado esperado:**
- Exibe o número correto de semanas registradas.
- Exibe a soma total de momentos marcados em todos os checkboxes de todas as semanas.
- Exibe a virtude mais escolhida dentre todas as semanas.
- Exibe o número de semanas concluídas.
- As frases são acolhedoras (sem linguagem de cobrança ou ranking).
- Ao excluir ou editar uma semana, os valores são recalculados automaticamente.

---

## Cenário 15 — Semana única (histórico vazio relativo)

**Pré-condição:** Apenas uma semana no histórico (a ativa).

**Resultado esperado:**
- A seção "Minha caminhada" exibe o cartão dessa semana com o botão **"Semana aberta"** desabilitado.
- O banner "Você está visualizando..." não é exibido.
- O botão **"Voltar para esta semana"** não causa erros.

---

## Cenário 16 — Histórico vazio

**Pré-condição:** Excluir todas as semanas ou limpar o localStorage e recarregar.

**Resultado esperado:**
- A seção "Minha caminhada" exibe: "Você ainda não possui semanas no histórico."
- A seção de estatísticas mostra valores zerados sem erro.

---

## Cenário 17 — Dados corrompidos em `crismaAppData`

**Pré-condição:** Inserir manualmente no localStorage (DevTools):
```
crismaAppData = {"version":99,"weeks":"corrompido"}
```

**Passos:**
1. Recarregar a página.

**Resultado esperado:**
- A página carrega com campos vazios.
- Mensagem de aviso: "Os dados salvos são de uma versão incompatível..."
- A chave `crismaAppData` não foi apagada.

---

## Cenário 18 — Armazenamento indisponível

**Pré-condição:** Bloquear o localStorage via DevTools antes do reload:
```js
Object.defineProperty(window, 'localStorage', {
  get: () => { throw new DOMException('SecurityError'); }
});
```

**Resultado esperado:**
- A página carrega e os campos funcionam.
- Mensagem de erro: "O armazenamento local não está disponível..."
- Sem crash nem tela em branco.

---

## Cenário 19 — Sincronização desktop ↔ mobile

**Pré-condição:** Abrir o site em viewport de 700px ou menos (DevTools → modo responsivo).

**Passos:**
1. Marcar "Oração da manhã — Seg" no card mobile.
2. Ampliar a viewport para > 700px.
3. Verificar se o mesmo checkbox está marcado na tabela desktop.
4. Recarregar.

**Resultado esperado:**
- Marcação na visão mobile reflete instantaneamente na tabela desktop (e vice-versa).
- Após reload, o estado é restaurado corretamente.

---

## Cenário 20 — Impressão da semana atual

**Passos:**
1. Preencher o plano.
2. Clicar em **"Imprimir meu plano"**.

**Resultado esperado:**
- O diálogo de impressão é aberto.
- Na prévia, os botões de ação são ocultados.
- O conteúdo do plano (intenção, virtude, tabela, exame) está visível e bem formatado.

---

## Cenário 21 — GitHub Pages (caminhos e recursos)

**Pré-condição:** Site publicado no GitHub Pages em `https://<usuario>.github.io/crisma-gabi/`.

**Passos:**
1. Acessar a URL pública.
2. Abrir DevTools → aba **Network**.
3. Recarregar.

**Resultado esperado:**
- Todos os recursos retornam HTTP 200: `css/styles.css`, `js/app.js`, `js/constants.js`, `js/storage.js`, `js/weeks.js`, `js/history.js`, `js/backup.js`, `js/statistics.js`, `js/ui.js`.
- Nenhum recurso com erro 404.
- O layout e a identidade visual estão preservados.
- Todos os cenários anteriores funcionam na URL pública.
- O site usa HTTPS.

---

## Checklist de navegadores e dispositivos

| Navegador / Dispositivo | Cenários 1, 2, 8, 9, 14 | Cenário 19 (responsivo) | Cenário 20 (impressão) |
|-------------------------|--------------------------|--------------------------|------------------------|
| Chrome (desktop)        | ☐                        | ☐                        | ☐                      |
| Edge (desktop)          | ☐                        | ☐                        | ☐                      |
| Firefox (desktop)       | ☐                        | ☐                        | ☐                      |
| Safari (desktop/macOS)  | ☐                        | ☐                        | ☐                      |
| Chrome (Android)        | ☐                        | ☐                        | ☐                      |
| Safari (iPhone)         | ☐                        | ☐                        | ☐                      |
| Tablet                  | ☐                        | ☐                        | ☐                      |

---

## Critério de aceite geral do MVP2

O MVP2 estará pronto quando:

- [ ] Os dados do MVP1 forem preservados (Etapa 1 — coberta em `TESTES-MVP2-ETAPA1.md`).
- [ ] Várias semanas puderem ser armazenadas e recuperadas após reload (Cenários 2, 3).
- [ ] O histórico funcionar com ordenação, abertura e exclusão (Cenários 3, 4, 6).
- [ ] Uma nova semana puder ser iniciada sem perda de dados (Cenário 1).
- [ ] O backup puder ser exportado e importado em outro navegador (Cenários 8, 9).
- [ ] As estatísticas forem calculadas corretamente e atualizadas ao editar/excluir (Cenário 14).
- [ ] A interface funcionar em telas pequenas (Cenário 19).
- [ ] Nenhuma ação destrutiva ocorrer sem confirmação (Cenários 6, 9, 13).
- [ ] O site continuar funcionando no GitHub Pages (Cenário 21).
- [ ] Dados corrompidos ou armazenamento bloqueado não causem crash (Cenários 17, 18).
