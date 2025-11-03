import fs from "fs";
import path from "path";
import { CloudClient } from "chromadb";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";

export interface UploadDoc {
  buffer: Buffer;
  mimeType: string;
}

export interface SplitConfig {
  chunkSize?: number;
  chunkOverlap?: number;
}

export class ChromaService {
  private client: CloudClient;
  private static instance: ChromaService;

  public static getInstance() {
    if (!ChromaService.instance) {
      ChromaService.instance = new ChromaService();
    }
    return ChromaService.instance;
  }
  private constructor() {}

  initialize() {
    this.client = new CloudClient();
  }

  // 🪓 Smart splitter picker
  private getSplitter(ext: string, config?: SplitConfig) {
    const defaultSize = config?.chunkSize ?? 1000;
    const defaultOverlap = config?.chunkOverlap ?? 200;

    if ([".xlsx", ".xls", ".csv"].includes(ext)) {
      return new CharacterTextSplitter({
        chunkSize: defaultSize,
        chunkOverlap: defaultOverlap,
      });
    }

    return new RecursiveCharacterTextSplitter({
      chunkSize: defaultSize,
      chunkOverlap: defaultOverlap,
    });
  }

  // 🧩 Load file contents
  private async loadFile(upload: UploadDoc) {
    const ext = upload.mimeType;
    const tempDir = path.join(process.cwd(), "temp");

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      await fs.promises.mkdir(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, `temp_${Date.now()}.${ext}`);

    try {
      // Write file with proper encoding
      await fs.promises.writeFile(tempPath, upload.buffer, {
        encoding: "binary",
      });

      let loader;
      switch (ext) {
        case "pdf":
          loader = new PDFLoader(tempPath);
          break;
        case "docx":
          loader = new DocxLoader(tempPath);
          break;
        case "csv":
        case "xls":
        case "xlsx":
          loader = new CSVLoader(tempPath);
          break;
        case "txt":
        case "md":
          const text = upload.buffer.toString("utf8");
          return [{ pageContent: text }];
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }

      const docs = await loader.load();
      return docs;
    } catch (error) {
      console.error("Error loading file:", error);
      throw error;
    } finally {
      // Clean up temp file
      try {
        await fs.promises.unlink(tempPath);
      } catch (error) {
        console.warn("Failed to clean up temp file:", tempPath);
      }
    }
  }

  // 📚 Add document chunks into Chroma Cloud
  async addDocument(
    upload: UploadDoc,
    collectionName = "default_collection",
    config?: SplitConfig
  ) {
    try {
      const ext = path.extname(upload.mimeType).toLowerCase();
      console.log("File extension detected:", ext);
      console.log("Loading file...", upload);
      const docs = await this.loadFile(upload);
      console.log("Here are the loaded docs:", docs);
      const text = docs.map((d: any) => d.pageContent).join("\n");

      const splitter = this.getSplitter(ext, config);
      const splitDocs = await splitter.createDocuments([text]);

      const collection = await this.client.getOrCreateCollection({
        name: collectionName,
        embeddingFunction: new GoogleGeminiEmbeddingFunction({
          modelName: "gemini-embedding-001",
        }),
      });

      await collection.add({
        ids: splitDocs.map((_, i) => `${collectionName}_${Date.now()}_${i}`),
        documents: splitDocs.map((d) => d.pageContent),
        metadatas: splitDocs.map(() => ({ source: upload.mimeType })),
      });

      console.log(
        `✅ Added ${splitDocs.length} chunks to '${collectionName}' successfully.`
      );

      return { success: true, chunks: splitDocs.length };
    } catch (err: any) {
      console.error(`❌ Upload error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // 🧠 Retrieve relevant context from Chroma Cloud
  async retrieveContext(
    query: string,
    collectionName = "default_collection",
    limit = 3
  ) {
    if (this.client === undefined) {
      this.initialize();
    }
    const collection = await this.client.getCollection({
      name: collectionName,
    });

    const results = await collection.query({
      queryTexts: [query],
      nResults: limit,
    });

    const docs = results.documents?.flat() ?? [];
    return {
      context: docs.join("\n---\n"),
      sources: results.metadatas?.flat() ?? [],
    };
  }

  // 📜 List all data from a collection
  async listAll(collectionName = "default_collection") {
    const collection = await this.client.getCollection({
      name: collectionName,
    });
    return collection.get();
  }
}

// 🌍 Export single instance for app-wide use
export const chromaService = ChromaService.getInstance();
