import {
  encodeText,
  decodeText,
  serializeTree,
  deserializeTree
} from "../core/huffman.js";

const MAGIC = "SSCH1";

export function compressText(text) {
  // Codifica o texto com Huffman.
  const { tree, bits } = encodeText(text);

  // Calcula quantos bits faltam para completar o último byte.
  const padding = (8 - (bits.length % 8)) % 8;

  // Cria o conteúdo do arquivo comprimido.
  const payload = {
    magic: MAGIC,
    originalLength: text.length,
    padding,
    tree: serializeTree(tree),
    bits
  };

  // Retorna o conteúdo serializado em JSON.
  return JSON.stringify(payload);
}


//  Descomprime um conteúdo gerado por compressText().

export function decompressText(compressedJson) {
  // Converte o texto JSON em objeto.
  const payload = JSON.parse(compressedJson);

  // Verifica se o arquivo é do nosso formato.
  if (payload.magic !== MAGIC) {
    throw new Error("Arquivo inválido ou corrompido");
  }

  // Reconstrói a árvore salva.
  const tree = deserializeTree(payload.tree);

  // Decodifica os bits usando a árvore reconstruída.
  return decodeText(payload.bits, tree);
}