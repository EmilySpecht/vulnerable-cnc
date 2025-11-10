import express from "express";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import cors from "cors";
import fs from "fs";
import { clearDirectory } from "./utils.js";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger.js";
import {
  DIR_PRINCIPAL,
  MESSAGES,
  uploadsCertDir,
  port,
  PROCESS_CERT_ERROR,
  SUCCESS_CERT,
  EMPTY_CONTENT,
  CONCLUDED_VALIDATION,
  CERT_NOT_FOUND,
  MANDATORY_FILENAME,
} from "./constants.js";
import { authenticateToken, loginHandler, createUser } from "./auth.js";
import { fileURLToPath } from "url";
import { initializeDatabase } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists before using multer to write files.
// Top-level await is supported since this is an ES module and Node 20 is required
// in package.json.
try {
  await fs.promises.mkdir(uploadsCertDir, { recursive: true });
  console.log(`Diretório de uploads garantido: ${uploadsCertDir}`);
} catch (e) {
  console.error("Erro ao criar diretório de uploads:", e);
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://10.0.2.7:3000"],
  })
);
app.use(express.json());

// Configuração do Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /health-check:
 *   get:
 *     summary: Verifica o status da API
 *     description: Retorna status 200 se a API estiver funcionando
 *     responses:
 *       200:
 *         description: API está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ok
 */
app.get("/health-check", async (req, res) => {
  return res.status(200).json({ message: "Ok" });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticar usuário
 *     description: Retorna um token JWT para autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 */
app.post("/login", loginHandler);

/**
 * @swagger
 * /clear-uploads:
 *   delete:
 *     summary: Limpa diretório de uploads
 *     description: Remove todos os arquivos do diretório de uploads
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Arquivos removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Erro ao remover arquivos
 */
app.delete("/clear-uploads", authenticateToken, async (req, res) => {
  try {
    await clearDirectory(uploadsCertDir);
    res.status(200).json({ message: MESSAGES.REMOVED_UPLOADS });
  } catch (error) {
    res
      .status(500)
      .json({ error: MESSAGES.REMOVED_UPLOADS_ERROR, details: error.message });
  }
});

/**
 * @swagger
 * /validate-script:
 *   post:
 *     summary: Valida um script de certificado
 *     description: Executa a validação de um script de certificado previamente enviado
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certFileName
 *             properties:
 *               certFileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Script validado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     isExec:
 *                       type: boolean
 *                     model:
 *                       type: string
 *       400:
 *         description: Nome do arquivo não fornecido
 *       404:
 *         description: Certificado não encontrado
 *       500:
 *         description: Erro ao validar certificado
 */
app.post("/validate-script", authenticateToken, async (req, res) => {
  const { certFileName } = req.body;

  if (!certFileName) return res.status(400).json({ error: MANDATORY_FILENAME });

  const certsDir = path.join(DIR_PRINCIPAL);
  const certPath = path.join(certsDir, certFileName);

  if (!fs.existsSync(certPath))
    return res.status(404).json({ error: CERT_NOT_FOUND });

  try {
    let isExec = false;
    console.log(certPath);

    // Garantir que o arquivo tenha permissão de execução e executá-lo
    // Observação: executar scripts enviados por usuários é perigoso — veja recomendações de segurança.
    await fs.promises.chmod(certPath, 0o755);
    const model = await execPromise(`"${certPath}"`);
    isExec = true;

    return isExec
      ? res
          .status(200)
          .json({ message: CONCLUDED_VALIDATION, result: { isExec, model } })
      : res
          .status(200)
          .json({ message: "Deu ruim", result: { isExec, model } });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Erro lendo certificado.", details: e });
  }
});

const execPromise = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR_PRINCIPAL);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    return cb(null, true);
  },
});

/**
 * @swagger
 * /upload-script:
 *   post:
 *     summary: Envia um script de certificado
 *     description: Faz upload de um arquivo de script de certificado
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               certificate:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileName:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Nenhum arquivo enviado
 *       500:
 *         description: Erro ao processar o arquivo
 */
app.post(
  "/upload-script",
  authenticateToken,
  upload.single("certificate"),
  (req, res) => {
    try {
      // Debug: log incoming file info — helps identify mismatched field names
      console.log("upload /upload-script req.file:", req.file);

      if (!req.file) return res.status(400).json({ message: EMPTY_CONTENT });

      res.json({ fileName: req.file.filename, message: SUCCESS_CERT });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: PROCESS_CERT_ERROR, error: err.message });
    }
  }
);

/**
 * @swagger
 * /setup:
 *   post:
 *     summary: Cria o primeiro usuário do sistema
 *     description: Rota para setup inicial do sistema, criando o primeiro usuário administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       400:
 *         description: Dados incompletos
 *       500:
 *         description: Erro ao criar usuário
 */
app.post("/setup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    const userId = await createUser(username, password);
    res.json({ message: "User created successfully", userId });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ error: "Error creating initial user" });
  }
});

// Inicializa o banco de dados e inicia o servidor
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log("Banco de dados inicializado com sucesso");
    });
  })
  .catch((error) => {
    console.error("Erro ao inicializar o banco de dados:", error);
    process.exit(1);
  });

export default app;
