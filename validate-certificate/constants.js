export const {
  EXPIRED,
  NOT_COME_EFFECT,
  NOT_FOUND_CA,
  VALID_CA,
  INVALID_CA,
  AUTO_SIGNATURE,
  NO_AUTO_SIGNATURE,
} = {
  AUTO_SIGNATURE: {
    name: "Auto-Signature",
    message: "Este certificado é auto assinado",
    color: "#0180FF",
    isValid: true,
  },
  NO_AUTO_SIGNATURE: {
    name: "Emissor",
    message: "Certificado assinado por ",
    color: "#0180FF",
    isValid: true,
  },
  VALID_CA: {
    name: "CA",
    message: "Este certificado tem uma CA confiável",
    color: "#FFBD2F",
    isValid: true,
  },
  NOT_FOUND_CA: {
    name: "CA Subordinada",
    message: "Não foi encontrada nenhuma CA válida",
    color: "#FFBD2F",
    isValid: false,
  },
  INVALID_CA: {
    name: "CA Subordinada",
    message: "Não foi encontrada nenhuma CA válida",
    color: "#FFBD2F",
    isValid: false,
  },
  EXPIRED: {
    name: "Validity",
    message: "Este certificado está expirado",
    color: "#FF2FAC",
    isValid: false,
  },
  NOT_COME_EFFECT: {
    name: "Validity",
    message: "Este certificado ainda não entrou em vigor",
    color: "#FF2FAC",
    isValid: false,
  },
};

import path from "path";
import { fileURLToPath } from "url";

const {
  PROCESS_CERT_ERROR,
  SUCCESS_CERT,
  EMPTY_CONTENT,
  MANDATORY_FILENAME,
  CERT_NOT_FOUND,
  CONCLUDED_VALIDATION,
} = {
  PROCESS_CERT_ERROR: "Erro ao processar o certificado.",
  ISNT_CA: "Este certificado não é de uma Autoridade Certificadora (CA).",
  SUCCESS_CA: "Certificado de CA processado com sucesso.",
  SUCCESS_CERT: "Certificado processado com sucesso.",
  EMPTY_CONTENT: "Nenhum arquivo enviado.",
  VERIFY_ERROR: "Erro ao verificar o certificado",
  RESTRICT_FILES: "Apenas arquivos .cer ou .crt são permitidos.",
  MANDATORY_FILENAME: "O nome do arquivo do certificado é obrigatório.",
  CERT_NOT_FOUND: "Certificado não encontrado.",
  NO_CA: "Nenhuma CA encontrada para validação.",
  CONCLUDED_VALIDATION: "Validação concluída.",
};

// Use a project-local tmp folder so it's created/controlled by this app.
// This matches the repository structure (`./tmp/uploads-cert`) and avoids
// depending on a system /tmp directory which may not exist or have expected
// permissions in all environments.
const DIR_PRINCIPAL = path.join(process.cwd(), "tmp", "uploads-cert");
const uploadsCertDir = DIR_PRINCIPAL;

const MESSAGES = {
  REMOVED_UPLOADS: "Todos os arquivos foram removidos com sucesso.",
  REMOVED_UPLOADS_ERROR: "Erro ao remover os arquivos.",
};

const port = process.env.PORT || 3001;

export {
  uploadsCertDir,
  MESSAGES,
  DIR_PRINCIPAL,
  PROCESS_CERT_ERROR,
  SUCCESS_CERT,
  EMPTY_CONTENT,
  MANDATORY_FILENAME,
  CERT_NOT_FOUND,
  CONCLUDED_VALIDATION,
  port,
};
