export class MinHeap {
 
   
    // Função que define qual elemento tem prioridade.

  constructor(compare) {
    // Garante que o usuário passou uma função de comparação válida.
    if (typeof compare !== "function") {
      throw new Error("MinHeap exige uma função compare(a, b)");
    }

    // Array que representa a árvore do heap.
    // A raiz fica em items[0].
    this.items = [];

    // Guarda a função de comparação para usar em push, pop,
    // bubbleUp e bubbleDown.
    this.compare = compare;
  }

  
  size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }


  // Retorna o menor elemento sem removê-lo.
  peek() {
    // Se não houver elementos, não há o que retornar.
    if (this.isEmpty()) {
      return null;
    }

    return this.items[0];
  }

  /**
   * Adiciona um novo elemento ao heap.
   * Depois, corrige a posição dele subindo na árvore, se necessário.
   */
  push(item) {
    // Coloca o novo elemento no final do array.
    this.items.push(item);

    const newIndex = this.items.length - 1;

    this.bubbleUp(newIndex);
  }

  pop() {

    if (this.isEmpty()) {
      return null;
    }

    const top = this.items[0];

    // O método pop() já remove e retorna o último elemento.
    const last = this.items.pop();

    // Se ainda sobrou algum elemento no heap, o último elemento precisa virar a nova raiz.
    if (!this.isEmpty()) {
      // O antigo último elemento ocupa a posição da raiz.
      this.items[0] = last;

      this.bubbleDown(0);
    }

    return top;
  }

  bubbleUp(index) {

    while (index > 0) {
      
      const parentIndex = Math.floor((index - 1) / 2);

      if (
        this.compare(this.items[index], this.items[parentIndex]) >= 0
      ) {
        break;
      }

      this.swap(index, parentIndex);

      index = parentIndex;
    }
  }

  bubbleDown(index) {
    const size = this.items.length;

    while (true) {

      const left = 2 * index + 1;
      const right = 2 * index + 2;

      let smallest = index;

      if (
        left < size &&
        this.compare(this.items[left], this.items[smallest]) < 0
      ) {
        smallest = left;
      }

      if (
        right < size &&
        this.compare(this.items[right], this.items[smallest]) < 0
      ) {

        smallest = right;
      }


      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);

      index = smallest;
    }
  }

  swap(a, b) {

    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
  }
}