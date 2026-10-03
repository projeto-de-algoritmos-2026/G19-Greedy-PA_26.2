import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countFrequencies,
  buildHuffmanTree,
  encodeText,
  decodeText
} from '../docs/js/core/huffman.js';
import {
  compressText,
  decompressText
} from '../docs/js/data/compressedFile.js';

test('countFrequencies: conta frequências corretamente', () => {
  const freqs = countFrequencies('abacaba');
  assert.equal(freqs.get('a'), 4);
  assert.equal(freqs.get('b'), 2);
  assert.equal(freqs.get('c'), 1);
});

test('Huffman encodeText e decodeText: ida e volta preserva o texto original', () => {
  const original = 'Algoritmos e Estruturas de Dados 2026.2 - Estudo Otimizado!';
  const { tree, bits } = encodeText(original);
  assert.ok(bits.length > 0);

  const decoded = decodeText(bits, tree);
  assert.equal(decoded, original);
});

test('Huffman com caracteres especiais, acentos e JSON', () => {
  const jsonText = JSON.stringify({
    materia: 'Cálculo 2',
    professor: 'João da Silva',
    horario: '14:00 às 16:30',
    tags: ['prova', 'urgente', 'análise']
  });

  const { tree, bits } = encodeText(jsonText);
  const decoded = decodeText(bits, tree);
  assert.equal(decoded, jsonText);
});

test('compressText e decompressText: ciclo completo de arquivo .lhf', () => {
  const sampleSchedule = JSON.stringify({
    sessions: [
      { id: 'calc2-1', day: 'segunda', start: 480, end: 540, title: 'Cálculo 2' },
      { id: 'ed-1', day: 'terca', start: 600, end: 660, title: 'Estruturas de Dados' }
    ],
    stats: {
      totalRequestedMinutes: 120,
      totalScheduledMinutes: 120,
      occupancyRate: 100
    }
  });

  const compressed = compressText(sampleSchedule);
  assert.ok(typeof compressed === 'string');

  const decompressed = decompressText(compressed);
  assert.equal(decompressed, sampleSchedule);
});
