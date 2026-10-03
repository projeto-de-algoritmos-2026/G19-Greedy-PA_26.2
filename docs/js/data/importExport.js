import {
  compressText,
  decompressText
} from "./compressedFile.js";

function downloadTextFile(filename, content, mimeType = "application/octet-stream") {
  // Cria um Blob com o conteúdo.
  const blob = new Blob([content], {
    type: mimeType
  });

  // Cria uma URL temporária para o Blob.
  const url = URL.createObjectURL(blob);

  // Cria um link invisível para disparar o download.
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  // Libera a URL temporária.
  URL.revokeObjectURL(url);
}

/**
 * Exporta a agenda e dados em arquivo JSON não comprimido.
 * @param {Object} data - Objeto da agenda e dados.
 */
export function exportJsonSchedule(data) {
  const json = JSON.stringify(data, null, 2);
  downloadTextFile("agenda-estudos.json", json, "application/json");
}

/**
 * Exporta a agenda comprimida com o algoritmo de Huffman (.lhf).
 * @param {Object} schedule - Objeto da agenda.
 */
export function exportCompressedSchedule(schedule) {
  // Transforma a agenda em JSON.
  const json = JSON.stringify(schedule);

  // Comprime o JSON com Huffman.
  const compressed = compressText(json);

  // Baixa o arquivo comprimido.
  downloadTextFile("agenda.lhf", compressed);
}

/**
 * Importa um arquivo JSON tradicional.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function importJsonSchedule(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (err) {
        reject(new Error("Arquivo JSON inválido ou corrompido"));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Importa um arquivo comprimido com Huffman (.lhf).
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function importCompressedSchedule(file) {
  return new Promise((resolve, reject) => {
    // Cria um leitor de arquivos.
    const reader = new FileReader();

    // Quando terminar de ler:
    reader.onload = () => {
      try {
        // Descomprime o conteúdo.
        const json = decompressText(reader.result);

        // Converte o JSON de volta em objeto.
        resolve(JSON.parse(json));
      } catch (error) {
        reject(error);
      }
    };

    // Se der erro na leitura:
    reader.onerror = reject;

    // Lê o arquivo como texto.
    reader.readAsText(file);
  });
}

/**
 * Importa arquivo autodetectando se é .lhf (Huffman) ou .json.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function importScheduleFile(file) {
  if (!file) {
    return Promise.reject(new Error("Nenhum arquivo selecionado"));
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".lhf")) {
    return importCompressedSchedule(file);
  }
  return importJsonSchedule(file);
}