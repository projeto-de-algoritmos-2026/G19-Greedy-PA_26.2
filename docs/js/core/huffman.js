import { MinHeap } from "../utils/minHeap.js";
export class HuffmanNode{
    constructor(character = null, frequency = 0){
        this.character = character;

        this.frequency = frequency;

        this.left = null;
        this.right = null;
    }

    isLeaf(){
        return this.left === null && this.right === null;
    }
}

export function countFrequencies(text){
    const frequencies = new Map();

    for(const character of text){
       const currentFrequency = frequencies.get(character) || 0;
       frequencies.set(character, currentFrequency + 1);
    }

    return frequencies;
}

export function buildHuffmanTree(text) {

  if (text.length === 0) {
    return null;
  }

  const frequencies = countFrequencies(text);

  const heap = new MinHeap(
    (a, b) => a.frequency - b.frequency
  );

  for (const [character, frequency] of frequencies) {

    const node = new HuffmanNode(character, frequency);

    heap.push(node);
  }


  while (heap.size() > 1) {

    const left = heap.pop();


    const right = heap.pop();

    const parentFrequency = left.frequency + right.frequency;

    const parent = new HuffmanNode(null, parentFrequency);

    parent.left = left;

    parent.right = right;

    heap.push(parent);
  }

  return heap.pop();
}

export function generateCodes(tree) {

  const codes = new Map();


  if (!tree) {
    return codes;
  }

  function walk(node, code) {

    if (node.isLeaf()) {

      codes.set(node.character, code || "0");

      return;
    }

    walk(node.left, code + "0");

    walk(node.right, code + "1");
  }


  walk(tree, "");


  return codes;
}

export function encodeText(text) {

  if (text.length === 0) {
    return {
      tree: null,
      codes: new Map(),
      bits: ""
    };
  }

  const tree = buildHuffmanTree(text);

  const codes = generateCodes(tree);

 
  let bits = "";

  for (const character of text) {

    const code = codes.get(character);

    bits += code;
  }

  return {
    tree,
    codes,
    bits
  };
}

export function decodeText(bits, tree) {

  if (!tree) {
    return "";
  }

  if (tree.isLeaf()) {

    return tree.character.repeat(bits.length);
  }


  let result = "";

  let currentNode = tree;

  for (const bit of bits) {

    if (bit === "0") {
      currentNode = currentNode.left;
    } else {

      currentNode = currentNode.right;
    }

    if (currentNode.isLeaf()) {

      result += currentNode.character;


      currentNode = tree;
    }
  }


  return result;
}

export function serializeTree(node) {
  if (!node) {
    return null;
  }

  return {
    character: node.character,
    frequency: node.frequency,
    left: serializeTree(node.left),
    right: serializeTree(node.right)
  };
}

export function deserializeTree(data) {

  if (!data) {
    return null;
  }

  const node = new HuffmanNode(
    data.character,
    data.frequency
  );

  node.left = deserializeTree(data.left);

  node.right = deserializeTree(data.right);

  return node;
}