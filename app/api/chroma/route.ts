import { chromaService } from "@/app/service/chroma.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    chromaService.initialize();

    // Ensure multipart form data
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid content type. Expected multipart/form-data upload.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const collection =
      request.headers.get("x-collection") || "default_collection";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // ✅ Validate file type
    const mimeType = file.type || "application/octet-stream";
    const allowedTypes = [
      "application/pdf",
      "application/json",
      "text/plain",
      "application/xml",
      "text/xml",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported file type. Allowed: PDF, DOCX, CSV, XLSX, JSON, TXT, XML.",
        },
        { status: 400 }
      );
    }

    // ✅ Validate file size (50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Determine file extension
    let extension = "txt";
    if (mimeType.includes("pdf")) extension = "pdf";
    else if (mimeType.includes("json")) extension = "json";
    else if (mimeType.includes("xml")) extension = "xml";
    else if (mimeType.includes("csv")) extension = "csv";
    else if (mimeType.includes("sheet")) extension = "xlsx";
    else if (mimeType.includes("word")) extension = "docx";

    // Prepare document
    const uploadDoc = {
      buffer: fileBuffer,
      mimeType: extension,
    };

    // ✅ Add document to Chroma
    const result = await chromaService.addDocument(uploadDoc, collection, {
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    return NextResponse.json({
      success: true,
      message: `Data from ${file.name} added successfully to ${collection}`,
      data: result,
    });
  } catch (error: any) {
    console.error("Chroma API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add data" },
      { status: 500 }
    );
  }
}
