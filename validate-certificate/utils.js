import fs from "fs";
import path from "path";

export async function clearDirectory(directoryPath) {
  try {
    const files = await fs.promises.readdir(directoryPath);
    await Promise.all(
      files.map((file) => fs.promises.unlink(path.join(directoryPath, file)))
    );
    console.log(`Arquivos de ${directoryPath} foram removidos com sucesso.`);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      // Diretório não existe — nada a remover
      console.log(`Diretório não encontrado: ${directoryPath}`);
      return;
    }
    console.error(`Erro ao limpar o diretório ${directoryPath}:`, error);
    throw error;
  }
}
