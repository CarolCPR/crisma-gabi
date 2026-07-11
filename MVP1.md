# Evolução do MVP 1 — Plano Semanal da Crisma

Você é um desenvolvedor Front-end sênior especializado em HTML5, CSS3, JavaScript puro (Vanilla JS), UX, acessibilidade e Progressive Web Apps.

## Contexto

Existe um projeto já funcional hospedado no GitHub Pages.

O projeto consiste em uma única página HTML que funciona como um plano semanal de oração para jovens da catequese de Crisma.

O layout atual foi aprovado e deve ser preservado ao máximo. A identidade visual, tipografia, cores, espaçamentos e estilo não devem ser alterados, exceto quando necessário para melhorar a responsividade ou acessibilidade.

O objetivo NÃO é reescrever o projeto, mas evoluir este MVP mantendo compatibilidade com GitHub Pages.

Não utilizar frameworks.

Não utilizar React.

Não utilizar Vue.

Não utilizar Angular.

Não utilizar banco de dados.

Não utilizar backend.

Todo o funcionamento deve permanecer em HTML + CSS + JavaScript.

---

# Objetivos desta versão (MVP 1)

Implementar apenas os itens abaixo.

## 1. Persistência local automática

Todos os dados preenchidos pelo usuário devem ser salvos automaticamente utilizando localStorage.

O salvamento deve ocorrer sempre que qualquer campo for alterado.

Ao abrir novamente a página, todos os dados devem ser restaurados automaticamente.

Devem ser armazenados:

* Nome
* Datas da semana
* Intenção da semana
* Virtude escolhida
* Virtude personalizada
* Todos os checkboxes da rotina semanal
* Todos os checkboxes do exame de consciência

O usuário não deverá precisar clicar em "Salvar".

---

## 2. Aviso de privacidade

Adicionar abaixo do título (ou em outro local elegante da interface) uma pequena mensagem discreta:

"Seus dados permanecem armazenados apenas neste navegador e neste dispositivo. Nenhuma informação é enviada para a internet."

Essa mensagem deve combinar visualmente com o restante do layout.

---

## 3. Botão "Limpar plano"

Adicionar um botão discreto próximo ao botão de impressão.

Ao clicar:

* solicitar confirmação
* apagar todos os dados do localStorage
* limpar todos os campos
* reiniciar a página

Nunca apagar os dados sem confirmação.

---

## 4. Tooltip das virtudes

Ao passar o mouse sobre cada virtude (desktop) ou tocar e segurar (mobile, se possível), exibir um pequeno balão explicando seu significado.

As descrições devem ser simples, acolhedoras e voltadas para adolescentes.

Utilizar aproximadamente os seguintes textos:

### Paciência

Aprender a esperar com serenidade, acolher as dificuldades e tratar os outros com calma.

### Justiça

Dar a cada pessoa aquilo que lhe é devido, agindo com honestidade e respeito.

### Verdade

Falar e viver com sinceridade, evitando mentiras e falsidades.

### Pureza

Buscar pensamentos, palavras e atitudes que aproximem de Deus e respeitem a dignidade das pessoas.

### Mansidão

Responder com calma mesmo diante das dificuldades ou provocações.

### Temperança

Usar com equilíbrio tudo aquilo que faz parte da vida, sem exageros.

### Caridade

Amar concretamente o próximo através de atitudes, ajuda, perdão e cuidado.

O tooltip deve possuir:

* animação suave
* boa legibilidade
* funcionar em telas pequenas
* não ultrapassar os limites da tela

---

## 5. Responsividade

Melhorar completamente a experiência mobile.

Hoje a tabela semanal possui rolagem horizontal.

A ideia é:

Desktop:

manter a tabela atual.

Tablet:

adaptar conforme necessário.

Celular:

substituir automaticamente a tabela por cartões diários.

Exemplo:

Segunda-feira

☐ Oração da manhã

☐ Missa ou leitura espiritual

☐ Terço

☐ Exame de consciência

☐ Gesto de caridade

Depois:

Terça-feira

...

Não duplicar dados.

Desktop e mobile devem compartilhar exatamente o mesmo estado salvo.

---

## 6. Melhorias de acessibilidade

Associar corretamente todos os labels aos inputs utilizando id e for.

Adicionar atributos aria quando fizer sentido.

Garantir navegação por teclado.

Melhorar contraste caso necessário.

Garantir foco visível.

---

## 7. Correção técnica

Existe um problema no código atual.

O JavaScript seleciona todos os elementos com a classe ".chip", incluindo o input de "outra virtude".

Corrigir para que apenas os botões sejam tratados como seleção de virtude.

O campo "Outra..." deve funcionar apenas como entrada de texto.

---

## 8. Estrutura do JavaScript

Refatorar o código JavaScript criando funções bem organizadas, por exemplo:

loadData()

saveData()

clearData()

restoreCheckboxes()

saveCheckboxes()

initializeVirtues()

initializeTooltips()

initializeResponsiveWeek()

Não utilizar código duplicado.

Adicionar comentários apenas quando realmente agregarem valor.

---

# O que NÃO fazer

Não alterar a identidade visual.

Não trocar a paleta de cores.

Não trocar tipografia.

Não adicionar login.

Não adicionar backend.

Não adicionar banco de dados.

Não adicionar frameworks.

Não alterar os textos religiosos existentes.

Não remover nenhuma funcionalidade atual.

---

# Qualidade esperada

O código deve ser escrito como um projeto profissional.

Priorizar:

* organização
* legibilidade
* manutenção
* acessibilidade
* compatibilidade entre navegadores modernos
* baixo acoplamento
* JavaScript limpo
* CSS organizado
* HTML semântico

Sempre que possível, reutilizar a estrutura existente ao invés de recriá-la.

Ao finalizar, explique resumidamente todas as alterações realizadas e os motivos de cada uma.
