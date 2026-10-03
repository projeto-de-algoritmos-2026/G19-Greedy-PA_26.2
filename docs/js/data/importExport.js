import {
  compressText,
  decompressText
} from "./compressedFile.js";

function downloadTextFile(filename, content) {
  // Cria um Blob com o conteúdo.
  const blob = new Blob([content], {
    type: "application/octet-stream"
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

export function exportCompressedSchedule(schedule) {
  // Transforma a agenda em JSON.
  const json = JSON.stringify(schedule);

  // Comprime o JSON com Huffman.
  const compressed = compressText(json);

  // Baixa o arquivo comprimido.
  downloadTextFile("agenda.lhf", compressed);
}


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