# MVP2 — Histórico e continuidade do Plano Semanal da Crisma

## 1. Objetivo

Transformar o plano atual, que registra somente uma semana, em um acompanhamento contínuo no qual o jovem possa:

* salvar a semana atual;
* iniciar uma nova semana;
* consultar semanas anteriores;
* reabrir uma semana;
* excluir uma semana;
* imprimir uma semana específica;
* exportar seus dados para backup;
* importar um backup;
* consultar indicadores pessoais simples e acolhedores.

Todos os dados continuarão armazenados apenas no navegador e no dispositivo utilizado.

---

# 2. Escopo do MVP2

## 2.1 Histórico de semanas

Cada plano semanal deverá ser armazenado como um registro independente.

Cada registro deverá conter:

* identificador único;
* data inicial;
* data final;
* nome do participante;
* intenção da semana;
* virtude selecionada;
* virtude personalizada, quando houver;
* marcações da rotina semanal;
* respostas do exame de consciência;
* data de criação;
* data da última alteração;
* status da semana:

  * em andamento;
  * concluída;
  * arquivada, se necessário futuramente.

A página deverá identificar automaticamente qual é a semana atual.

---

## 2.2 Tela ou seção “Esta semana”

Ao abrir o site, o jovem deverá visualizar o plano da semana atual.

Possíveis situações:

### Ainda não existe plano para esta semana

Mostrar:

“Você ainda não iniciou seu plano desta semana.”

E o botão:

“Iniciar minha semana”

### Já existe um plano

Restaurar automaticamente todas as informações preenchidas.

### Existe uma semana anterior ainda aberta

O sistema poderá mostrar:

“Existe um plano anterior que ainda não foi concluído.”

Com as opções:

* continuar plano anterior;
* concluir e iniciar nova semana;
* iniciar nova semana sem concluir a anterior.

Não deve haver cobrança ou linguagem negativa.

---

## 2.3 Iniciar nova semana

Adicionar um botão:

“Nova semana”

Ao clicar, o sistema deverá:

1. verificar se existe uma semana atual preenchida;
2. explicar que os dados atuais serão preservados no histórico;
3. solicitar confirmação;
4. salvar a semana atual;
5. criar um novo plano vazio;
6. preencher automaticamente as datas da nova semana;
7. manter o nome do jovem, caso ele já tenha sido informado;
8. limpar intenção, virtude e marcações;
9. abrir o novo plano.

O sistema nunca deverá apagar automaticamente uma semana anterior.

---

## 2.4 Histórico

Adicionar uma nova área chamada:

“Minha caminhada”

Essa área deverá apresentar as semanas anteriores em cartões.

Cada cartão poderá mostrar:

* intervalo da semana;
* virtude escolhida;
* quantidade de momentos registrados;
* status;
* data da última atualização.

Exemplo:

Semana de 13 a 19 de julho de 2026

Virtude: Paciência

18 momentos registrados

Concluída

Ações disponíveis:

* visualizar;
* editar;
* imprimir;
* excluir.

A exclusão deverá sempre exigir confirmação.

---

## 2.5 Visualização de semana anterior

Ao selecionar uma semana do histórico, o usuário deverá poder:

* consultar todos os dados preenchidos;
* imprimir;
* editar, caso desejado;
* retornar ao plano atual.

A interface deverá deixar claro quando uma semana anterior estiver aberta.

Exemplo:

“Você está visualizando a semana de 6 a 12 de julho.”

Adicionar o botão:

“Voltar para esta semana”

---

## 2.6 Estatísticas pessoais

As estatísticas deverão ser simples e não competitivas.

Podem ser apresentadas:

* número de semanas registradas;
* número total de momentos de oração e recolhimento registrados;
* virtude mais escolhida;
* quantidade de semanas concluídas;
* constância geral do período.

Não utilizar:

* ranking;
* comparação entre jovens;
* sequência perdida;
* mensagens de fracasso;
* pontuação espiritual;
* medalhas;
* linguagem de cobrança.

Exemplos adequados:

“Você já registrou 4 semanas da sua caminhada.”

“A virtude mais escolhida neste período foi Paciência.”

“Você registrou 38 momentos de oração e recolhimento.”

As estatísticas devem ser calculadas localmente a partir do histórico, sem serem salvas como fonte principal. Assim, evitamos valores incorretos ou desatualizados.

---

## 2.7 Exportação dos dados

Adicionar o botão:

“Exportar meus dados”

Ao clicar, o navegador deverá gerar um arquivo JSON.

Exemplo de nome:

plano-crisma-backup-2026-07-19.json

O arquivo deverá conter:

* versão do formato;
* data da exportação;
* plano atual;
* histórico de semanas;
* preferências locais que façam parte do MVP.

Antes do download, mostrar uma explicação:

“Este arquivo contém as informações registradas no seu plano. Guarde-o em um local seguro. Ele poderá ser utilizado para recuperar seus dados neste ou em outro dispositivo.”

O arquivo não deverá conter código executável.

---

## 2.8 Importação dos dados

Adicionar o botão:

“Importar backup”

O usuário deverá selecionar um arquivo JSON previamente exportado.

Antes de importar, o sistema deverá:

1. verificar se o arquivo é JSON válido;
2. verificar se possui a estrutura esperada;
3. verificar a versão do formato;
4. rejeitar arquivos incompatíveis ou corrompidos;
5. informar quantas semanas foram encontradas;
6. perguntar se o usuário deseja:

   * substituir os dados atuais;
   * mesclar com os dados atuais;
   * cancelar.

Na mesclagem:

* não duplicar semanas com o mesmo identificador;
* em caso de registros com o mesmo identificador, manter o mais recentemente atualizado;
* preservar registros exclusivos de cada origem.

Nunca substituir os dados atuais sem confirmação explícita.

Antes de uma substituição, criar uma cópia temporária dos dados atuais para permitir recuperação enquanto a página permanecer aberta.

---

## 2.9 Aviso de armazenamento local

Atualizar o aviso de privacidade:

“Seus dados ficam armazenados apenas neste navegador e neste dispositivo. Eles não são enviados para a catequista nem para um servidor. Para evitar perdas, faça um backup periodicamente.”

Adicionar um link ou botão:

“Entenda como funciona”

A explicação deverá informar:

* os dados não são sincronizados;
* outro dispositivo não terá acesso automático;
* limpar os dados do navegador pode apagar o histórico;
* a navegação anônima não é indicada;
* a exportação gera uma cópia de segurança;
* qualquer pessoa com acesso ao mesmo perfil do navegador poderá acessar o plano.

---

# 3. Modelo de dados sugerido

Utilizar um único objeto principal versionado.

Exemplo conceitual:

{
"version": 2,
"activeWeekId": "week-2026-07-13",
"profile": {
"name": "Nome do jovem"
},
"weeks": [
{
"id": "week-2026-07-13",
"startDate": "2026-07-13",
"endDate": "2026-07-19",
"status": "in_progress",
"intention": "",
"virtue": {
"type": "predefined",
"value": "Paciência"
},
"routine": {
"morningPrayer": {
"monday": false,
"tuesday": false,
"wednesday": false,
"thursday": false,
"friday": false,
"saturday": false,
"sunday": false
}
},
"conscienceExam": {},
"createdAt": "2026-07-13T12:00:00.000Z",
"updatedAt": "2026-07-13T12:00:00.000Z"
}
]
}

Esse modelo é apenas uma referência. Os nomes finais devem seguir um padrão consistente.

---

# 4. Migração dos dados do MVP1

O MVP2 deverá reconhecer os dados existentes do MVP1.

Na primeira abertura após a atualização:

1. procurar os dados salvos pelo MVP1;
2. verificar se existem informações preenchidas;
3. converter os dados antigos para o novo formato;
4. criar uma semana correspondente;
5. salvar no formato do MVP2;
6. marcar a migração como concluída;
7. manter uma cópia temporária do registro antigo durante a migração;
8. não duplicar os dados ao abrir a página novamente.

Caso a migração falhe:

* não apagar os dados antigos;
* registrar o erro no console;
* mostrar uma mensagem amigável;
* permitir que o usuário continue usando o site sem perda imediata.

---

# 5. Arquitetura recomendada

Mesmo que o projeto continue pequeno, separar os arquivos:

index.html

css/
styles.css

js/
app.js
storage.js
weeks.js
history.js
backup.js
statistics.js
ui.js

Não é obrigatório utilizar exatamente esses nomes, mas as responsabilidades devem ser separadas.

## storage.js

Responsável por:

* ler o armazenamento;
* salvar o armazenamento;
* validar o objeto principal;
* realizar migrações;
* tratar indisponibilidade do localStorage.

## weeks.js

Responsável por:

* criar semana;
* calcular segunda-feira e domingo;
* localizar semana atual;
* atualizar semana;
* concluir semana;
* excluir semana.

## history.js

Responsável por:

* ordenar semanas;
* renderizar histórico;
* abrir semana anterior;
* retornar à semana atual.

## backup.js

Responsável por:

* exportar JSON;
* validar arquivo importado;
* substituir dados;
* mesclar dados;
* tratar conflitos.

## statistics.js

Responsável por:

* calcular indicadores;
* não armazenar estatísticas redundantes;
* ignorar registros inválidos.

## ui.js

Responsável por:

* mensagens;
* modais;
* estados vazios;
* confirmações;
* notificações acessíveis.

---

# 6. Tecnologias

## Obrigatórias

* HTML5;
* CSS3;
* JavaScript moderno, sem frameworks;
* localStorage;
* JSON;
* Blob e URL.createObjectURL para exportação;
* FileReader ou método moderno equivalente e amplamente suportado para importação;
* GitHub Pages;
* Git e GitHub.

## Opcionais

* GitHub Actions para validações automáticas;
* ESLint para qualidade do JavaScript;
* Prettier para formatação;
* HTMLHint para validação do HTML;
* Stylelint para validação do CSS.

As ferramentas opcionais são utilizadas durante o desenvolvimento e não criam necessidade de servidor em produção.

---

# 7. O que não será necessário

Neste MVP não será necessário:

* banco de dados online;
* Supabase;
* Firebase;
* servidor próprio;
* API;
* Node.js em produção;
* login;
* senha;
* conta de usuário;
* autenticação;
* painel da catequista;
* coleta centralizada de informações;
* domínio próprio.

Node.js poderá ser usado apenas no ambiente de desenvolvimento para executar ferramentas de qualidade, mas o site publicado continuará sendo estático.

---

# 8. Etapas de implementação

## Etapa 1 — Preparação e segurança

* criar uma branch específica para o MVP2;
* fazer backup da versão atual;
* identificar todas as chaves utilizadas no localStorage;
* documentar o formato do MVP1;
* criar o novo modelo versionado;
* criar funções de leitura e gravação seguras;
* implementar tratamento de JSON inválido;
* implementar migração do MVP1.

Critério de aceite:

Os dados preenchidos na versão anterior continuam disponíveis depois da atualização.

---

## Etapa 2 — Gerenciamento de semanas

* calcular automaticamente o período semanal;
* criar identificadores únicos;
* criar semana atual;
* salvar várias semanas;
* trocar entre semanas;
* iniciar uma nova semana;
* preservar o nome do participante;
* impedir exclusões acidentais.

Critério de aceite:

É possível criar três semanas diferentes, recarregar a página e encontrar as três preservadas.

---

## Etapa 3 — Histórico

* criar a área “Minha caminhada”;
* exibir cartões;
* ordenar da mais recente para a mais antiga;
* abrir uma semana;
* editar;
* imprimir;
* excluir;
* voltar à semana atual;
* criar estados vazios.

Critério de aceite:

O usuário consegue localizar e abrir qualquer semana registrada sem perder o plano atual.

---

## Etapa 4 — Exportação e importação

* exportar backup JSON;
* definir versão do arquivo;
* validar importação;
* implementar substituição;
* implementar mesclagem;
* evitar duplicações;
* tratar arquivos inválidos;
* mostrar mensagens claras.

Critério de aceite:

Um backup exportado em um navegador pode ser importado em outro, recuperando todas as semanas.

---

## Etapa 5 — Estatísticas

* calcular semanas registradas;
* calcular momentos marcados;
* calcular virtude mais escolhida;
* calcular semanas concluídas;
* criar mensagens acolhedoras;
* garantir que dados incompletos não causem erros.

Critério de aceite:

As estatísticas são recalculadas corretamente depois de editar, importar ou excluir uma semana.

---

## Etapa 6 — Testes e publicação

Testar:

* Chrome;
* Edge;
* Firefox;
* Safari, quando possível;
* Android;
* iPhone, quando possível;
* tela pequena;
* tablet;
* desktop;
* teclado;
* recarregamento;
* fechamento do navegador;
* dados corrompidos;
* armazenamento bloqueado;
* importação inválida;
* histórico vazio;
* muitas semanas;
* impressão de semana atual;
* impressão de semana anterior.

Publicar primeiro em uma branch ou ambiente de teste.

Após validação:

* mesclar com a branch principal;
* publicar no GitHub Pages;
* verificar o endereço público;
* confirmar que o site utiliza HTTPS;
* testar novamente no endereço publicado.

---

# 9. Critérios gerais de conclusão

O MVP2 estará pronto quando:

* os dados do MVP1 forem preservados;
* várias semanas puderem ser armazenadas;
* o histórico funcionar;
* uma nova semana puder ser iniciada com segurança;
* o backup puder ser exportado;
* o backup puder ser importado;
* as estatísticas forem calculadas corretamente;
* a interface funcionar no celular;
* nenhuma ação destrutiva ocorrer sem confirmação;
* o site continuar funcionando no GitHub Pages;
* nenhum dado for enviado para servidores;
* erros de armazenamento forem tratados de forma amigável.
