# Grupo 19

# StudyScheduler - Planejador Inteligente de Estudos

Projeto da disciplina de **Projeto de Algoritmos (PA)** que aplica algoritmos gulosos (*Greedy Algorithms*) para automatizar e otimizar a criação de agendas semanais de estudo para estudantes universitários. 

O sistema modela a rotina acadêmica através de restrições temporais e resolve dois problemas clássicos de alocação:
1. **Interval Scheduling**: seleciona o subconjunto ótimo de sessões de estudo que cabem na capacidade livre do estudante, priorizando disciplinas com provas e trabalhos mais próximos através de uma estratégia gulosa *Earliest Deadline First* combinada com pesos de urgência.
2. **Interval Partitioning**: aloca as sessões selecionadas nos blocos de tempo livres da semana sem permitir sobreposições, utilizando uma fila de prioridade mínima (**Min-Heap**) para atribuir dinamicamente a próxima sessão ao bloco que fica disponível mais cedo.

Além disso, o projeto implementa o algoritmo guloso de **Compressão de Huffman** para compactar a agenda e os dados do estudante em um arquivo com extensão proprietária `.lhf` (*Lightweight Huffman File*), permitindo exportação, importação e persistência eficiente.

---

## Alunos

| Matrícula | Nome |
| :---: | :--- |
| 241025990 | Pedro Henrique Ferreira Xavier |
| 241040350 | Philipe Amancio Reis Caetano |

---

## Vídeo de Apresentação

**[Vídeo de Apresentação no YouTube](https://youtu.be/SEU_LINK_AQUI)** *(Link a ser inserido)*

---

## Objetivos

- **Modelagem de Demandas e Restrições**: Permitir o cadastro intuitivo de matérias, metas de horas semanais, níveis de dificuldade, prazos de provas/trabalhos, blocos de disponibilidade semanal, compromissos fixos e reservas de estudo.
- **Divisão Inteligente de Carga Horária**: Fracionar a carga de estudo semanal em sessões discretas de 1 hora (ou blocos proporcionais residuais).
- **Priorização Dinâmica**: Calcular a urgência de cada matéria aumentando sua prioridade de forma inversamente proporcional aos dias restantes para avaliações (*deadlines*).
- **Seleção Gulosa (Interval Scheduling)**: Selecionar apenas as sessões que cabem dentro do orçamento de horas livres do estudante, ordenadas por prazo e prioridade.
- **Distribuição sem Sobreposição (Interval Partitioning)**: Distribuir as sessões nos horários livres cadastrados garantindo conflito zero entre atividades, por meio de um Min-Heap.
- **Visualização Interativa**: Apresentar um calendário semanal interativo e responsivo com blocos coloridos por matéria, estatísticas de aproveitamento e lista explicativa de sessões pendentes.
- **Compactação e Persistência**: Implementar compressão e descompressão de Huffman sem bibliotecas externas para importar/exportar a agenda em arquivo `.lhf` e persistir rascunhos no `localStorage`.

---

## Funcionamento Geral

O fluxo de execução do sistema é estruturado em etapas bem definidas:

```
[Entrada de Dados]
  ├── Matérias & Horas semanais
  ├── Horários Livres (Disponibilidade)
  ├── Provas e Trabalhos (com Prazos)
  └── Compromissos e Reservas Fixas
            │
            ▼
[Geração de Sessões & Priorização]
  └── Cálculo de bônus por proximidade de provas (models.js)
            │
            ▼
[Interval Scheduling] (intervalScheduler.js)
  └── Ordenação gulosa (Earliest Deadline + Maior Prioridade)
  └── Seleção do que cabe no tempo livre total
  └── Separação de sessões selecionadas e pendentes
            │
            ▼
[Interval Partitioning com Min-Heap] (intervalPartitioner.js)
  └── Alocação nos blocos livres sem sobreposição
  └── Atualização do término dos blocos no Min-Heap
            │
            ▼
[Interface Gráfica & Calendário Semanal] (scheduleView.js)
  └── Renderização da grade visual, métricas e pendências
            │
            ▼
[Compressão de Huffman] (huffman.js / compressedFile.js)
  └── Exportação em .json e .lhf compactado
```

1. **Entrada e Cadastro**: O usuário informa matérias, horários livres da semana (ex: Segunda das 08:00 às 12:00), datas de provas e compromissos fixos.
2. **Criação das Sessões de Estudo**: A carga horária semanal de cada disciplina é particionada em sessões padrão de 60 minutos (ex: Cálculo com 3h vira 3 sessões de 1h).
3. **Cálculo de Prioridade Dinâmica**: Provas em menos de 7 dias adicionam forte bônus de urgência. Trabalhos próximos também aumentam a prioridade.
4. **Interval Scheduling**: As sessões são ordenadas pelo prazo mais próximo (*Earliest Deadline*) e desempate por prioridade. As sessões que ultrapassam o total de tempo livre disponível são marcadas como pendentes (`unallocated`).
5. **Interval Partitioning**: Cada bloco livre é inserido em um **Min-Heap** indexado pelo horário em que fica livre. As sessões são alocadas sucessivamente sem sobreposição.
6. **Visualização**: A interface desenha a grade semanal com os blocos alocados por cor, badges de urgência de prova, métricas de eficiência e alerta de horas não alocadas.
7. **Exportação/Importação e Huffman**: A agenda final pode ser salva no navegador (`localStorage`), exportada em `.json` ou codificada pelo algoritmo de Huffman em um arquivo binário/serializado `.lhf`.

---

## Algoritmos Implementados

### 1. Interval Scheduling & Priorização Gulosa

Implementado em `docs/js/core/intervalScheduler.js` e `docs/js/core/models.js`.

- **Critério Guloso**:
  1. Menor `deadlineDays` (prova ou entrega mais próxima tem prioridade máxima - *Earliest Deadline First*).
  2. Maior `priority` (calculada pela dificuldade base somada ao bônus exponencial de provas e trabalhos próximos).
  3. Menor índice sequencial da sessão na matéria.
- **Capacidade**: Calcula a soma de minutos livres disponíveis da semana e preenche a capacidade de estudo de forma gulosa com as sessões mais urgentes, garantindo que o estudante foque no que mais precisa se o tempo semanal for escasso.

### 2. Min-Heap (Fila de Prioridade Mínima)

Implementado manualmente em `docs/js/utils/minHeap.js` sem dependências externas:

- Mantém os blocos de horário ordenados pela chave `freeAt` (momento em que o bloco fica disponível).
- Operações de `push(item)` com `bubbleUp` para reestruturação ascendente da árvore binária em array.
- Operações de `pop()` com `bubbleDown` para garantir extração do menor elemento em tempo logarítmico.
- Métodos auxiliares `peek()`, `size()`, `isEmpty()` e função de comparação customizável `compare(a, b)`.

### 3. Interval Partitioning

Implementado em `docs/js/core/intervalPartitioner.js`:

- O algoritmo recebe as sessões selecionadas e os blocos de tempo livres.
- Cada bloco livre é inserido no Min-Heap com `freeAt = block.start`.
- Para cada sessão, o algoritmo consulta o bloco que fica livre mais cedo (`heap.pop()`):
  - Se a sessão cabe no intervalo (`freeAt + duration <= block.end`), ela é agendada com início em `freeAt` e término em `freeAt + duration`.
  - O bloco é atualizado com o novo horário de término e reinserido no heap caso ainda reste tempo livre útil.
  - Se o bloco não comportar a duração da sessão, o algoritmo busca o próximo bloco disponível no heap.
- Garante ausência total de sobreposição e conflito entre sessões de estudo.

### 4. Compressão e Descompressão de Huffman

Implementado em `docs/js/core/huffman.js` e `docs/js/data/compressedFile.js`:

- **Frequência de Caracteres**: Realiza a contagem da frequência de cada caractere na string JSON da agenda.
- **Construção da Árvore de Huffman**: Utiliza o `MinHeap` para combinar iterativamente os nós de menor frequência até obter a raiz da árvore ótima de prefixos livres de ambiguidade.
- **Geração de Códigos**: Cria a tabela de mapeamento de cada caractere para sua sequência de bits (`0` e `1`).
- **Codificação & Decodificação**: Codifica a string em fluxo binário e decodifica percorrendo a árvore de Huffman nó a nó.
- **Formato `.lhf`**: Encapsula a árvore serializada, tamanho original e bits codificados, garantindo a propriedade:
  $$\text{decompressText}(\text{compressText}(x)) \equiv x$$

---

## Complexidade dos Algoritmos

Considerando:
- $N$: número total de sessões de estudo geradas;
- $M$: número de blocos de disponibilidade livre cadastrados;
- $K$: número de caracteres no texto JSON da agenda;
- $U$: número de caracteres únicos (alfabeto) no JSON da agenda.

| Algoritmo / Etapa | Complexidade de Tempo | Complexidade de Espaço | Descrição |
| :--- | :---: | :---: | :--- |
| **Criação de Sessões & Priorização** | $O(N)$ | $O(N)$ | Fracionamento das horas e cálculo linear de bônus |
| **Interval Scheduling (Ordenação)** | $O(N \log N)$ | $O(N)$ | Ordenação por *Earliest Deadline* e prioridade |
| **Min-Heap (Push / Pop)** | $O(\log M)$ | $O(M)$ | Operações básicas de fila de prioridade binária |
| **Interval Partitioning** | $O(N \log M + M \log M)$ | $O(N + M)$ | Alocação das $N$ sessões nos $M$ blocos livres via Min-Heap |
| **Construção da Árvore de Huffman** | $O(K + U \log U)$ | $O(U)$ | Contagem de frequências e fusão gulosa com Min-Heap |
| **Codificação / Decodificação Huffman** | $O(K)$ | $O(K)$ | Mapeamento por dicionário e travessia da árvore |

---

## Organização dos Arquivos

```text
.
├── .github/
│   └── workflows/
│       └── deploy-pages.yml         # Automação de deploy para GitHub Pages
├── docs/                            # Diretório servido pelo GitHub Pages
│   ├── index.html                   # Estrutura e marcação semântica da interface
│   ├── style.css                    # Design System moderno, responsivo e tema escuro
│   ├── styles.css                   # Arquivo de compatibilidade de importação
│   └── js/
│       ├── main.js                  # Orquestrador da interface e manipuladores de eventos
│       ├── core/
│       │   ├── time.js              # Conversões "HH:MM", minutos e checagem de sobreposição
│       │   ├── models.js            # Entidades, fábrica de sessões e priorização por provas
│       │   ├── intervalScheduler.js # Algoritmo guloso de Interval Scheduling
│       │   ├── intervalPartitioner.js # Algoritmo guloso de Interval Partitioning
│       │   └── huffman.js           # Árvore, codificação e decodificação de Huffman
│       ├── data/
│       │   ├── storage.js           # Persistência de rascunhos no localStorage
│       │   ├── compressedFile.js    # Manipulação e empacotamento do formato .lhf
│       │   └── importExport.js      # Download/upload de arquivos .json e .lhf
│       ├── ui/
│       │   ├── forms.js             # Captura dos dados de entrada e estado em memória
│       │   ├── scheduleView.js      # Renderização do calendário semanal e métricas
│       │   └── notifications.js     # Sistema de toasts e avisos visuais
│       └── utils/
│           └── minHeap.js           # Implementação manual de Min-Heap
├── tests/
│   ├── time.test.js                 # Testes unitários de conversão temporal
│   ├── intervalScheduler.test.js    # Testes do algoritmo de Interval Scheduling
│   ├── intervalPartitioner.test.js  # Testes do algoritmo de Interval Partitioning
│   ├── minHeap.test.js              # Testes unitários do Min-Heap
│   ├── huffman.test.js              # Testes da compressão e descompressão de Huffman
│   └── planner.test.js              # Testes de integração do gerador da agenda
├── package.json                     # Configuração de scripts e ESM
└── README.md                        # Documentação completa do projeto
```

---

## Requisitos

- **Para uso no Navegador**: Qualquer navegador moderno com suporte a JavaScript ES6+ (Google Chrome, Firefox, Edge, Safari). Não exige nenhum tipo de servidor backend ou banco de dados.
- **Para desenvolvimento e execução dos testes**: [Node.js](https://nodejs.org/) versão 18 ou superior.

---

## Como Rodar o Projeto

### 1. Executando Localmente no Navegador

Como o projeto é modular e utiliza ES Modules (`import`/`export`), o navegador requer um servidor estático local para evitar restrições de CORS:

```bash
# Inicia um servidor local na pasta docs
npm start
```

Ou execute diretamente via `npx`:
```bash
npx serve docs
```

Abra o endereço indicado no terminal (normalmente `http://localhost:3000`) no seu navegador.

*Alternativamente:* abra o projeto no VS Code e utilize a extensão **Live Server** clicando com o botão direito em `docs/index.html` e escolhendo **"Open with Live Server"**.

### 2. Executando os Testes Automatizados

O projeto conta com **27 testes unitários e de integração** utilizando o test runner nativo do Node.js:

```bash
npm test
```

Os testes cobrem:
- Validação de conversões `"HH:MM"` e detecção de sobreposição de horários;
- Particionamento de matérias em sessões de 1 hora;
- Aumento de prioridade proporcional à proximidade de provas e entregas;
- Seleção gulosa respeitando capacidade temporal e separação de horas pendentes;
- Funcionamento do Min-Heap (push, pop, peek, bubbleUp, bubbleDown);
- Alocação sem sobreposição via Interval Partitioning;
- Compressão e descompressão de Huffman com preservação íntegra de dados (caracteres especiais, acentos e JSON).

---

## Publicação no GitHub Pages

O projeto foi projetado para rodar nativamente no **GitHub Pages**, pois toda a lógica de algoritmos e renderização é executada no cliente (*client-side*):

1. No repositório no GitHub, vá em **Settings** > **Pages**.
2. Na seção **Build and deployment**:
   - **Source**: Escolha `Deploy from a branch`.
   - **Branch**: Selecione `main` e a pasta `/docs`.
   - Clique em **Save**.
3. Em instantes, a aplicação estará acessível publicamente pela URL do GitHub Pages do repositório (ou através da execução da GitHub Action inclusa em `.github/workflows/deploy-pages.yml`).

---

## Limitações e Observações

- **Granularidade das Sessões**: Por padrão, o fracionamento de sessões utiliza blocos de 60 minutos (com frações proporcionais para restos menores). Blocos livres com duração inferior à duração mínima de uma sessão não podem acomodar a sessão e são reportados como pendências.
- **Disponibilidade Estática**: A alocação considera uma semana típica representativa (Segunda a Domingo).
- **Escopo do Algoritmo Guloso**: O Interval Scheduling utiliza a heurística ótima *Earliest Deadline First* combinada com ponderação de urgência, que encontra soluções de alocação de alta qualidade em tempo quase linear, adequadas para a escala de planejamento de estudos semanal.

---

## Referências

- **KLEINBERG, Jon; TARDOS, Éva**. *Algorithm Design*. Pearson/Addison-Wesley, 2006. (Capítulo 4: Greedy Algorithms - Interval Scheduling, Scheduling to Minimize Lateness, Interval Partitioning).
- **CORMEN, Thomas H. et al.** *Algoritmos: teoria e prática*. 3. ed. Rio de Janeiro: Elsevier, 2012. (Capítulo 6: Heapsort / Filas de Prioridade; Capítulo 16: Algoritmos Gulosos e Códigos de Huffman).
- **HUFFMAN, David A.** *A Method for the Construction of Minimum-Redundancy Codes*. Proceedings of the IRE, v. 40, n. 9, p. 1098-1101, 1952.
