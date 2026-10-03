import test from 'node:test';
import assert from 'node:assert/strict';
import { MinHeap } from '../docs/js/utils/minHeap.js';

test('MinHeap: extrai sempre o menor elemento', () => {
  const heap = new MinHeap((a, b) => a - b);
  heap.push(10);
  heap.push(4);
  heap.push(15);
  heap.push(1);
  heap.push(7);

  assert.equal(heap.size(), 5);
  assert.equal(heap.peek(), 1);

  assert.equal(heap.pop(), 1);
  assert.equal(heap.pop(), 4);
  assert.equal(heap.pop(), 7);
  assert.equal(heap.pop(), 10);
  assert.equal(heap.pop(), 15);
  assert.equal(heap.pop(), null);
  assert.equal(heap.isEmpty(), true);
});

test('MinHeap: funciona com objetos e função de comparação customizada', () => {
  const heap = new MinHeap((a, b) => a.priority - b.priority);
  heap.push({ id: 1, priority: 30 });
  heap.push({ id: 2, priority: 10 });
  heap.push({ id: 3, priority: 20 });

  assert.equal(heap.peek().id, 2);
  assert.equal(heap.pop().id, 2);
  assert.equal(heap.pop().id, 3);
  assert.equal(heap.pop().id, 1);
});

test('MinHeap: exige função compare no construtor', () => {
  assert.throws(() => new MinHeap(), /MinHeap exige uma função compare/);
});
