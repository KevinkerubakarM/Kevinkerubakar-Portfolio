import { chromaService } from "@/app/service/chroma.service";
import { AIRole, langGraphService } from "@/app/service/lang.graph.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid content type. Expected application/json.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Extract parameters
    const { task, role, context } = body;

    // Validate required fields
    if (!task || typeof task !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing or invalid 'task' field" },
        { status: 400 }
      );
    }

    if (!context || typeof context !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing or invalid 'context' field" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: AIRole[] = [
      "assistant",
      "analyst",
      "creative",
      "technical",
      "educator",
    ];
    const aiRole: AIRole = role;

    if (!validRoles.includes(aiRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid role. Allowed: ${validRoles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate context length
    if (context.length > 10000) {
      return NextResponse.json(
        { success: false, message: "Context exceeds 10,000 character limit" },
        { status: 400 }
      );
    }

    //get context from chroma
    const chromaContext = await chromaService.retrieveContext(context);
    const enrichedContext = `${context}\n\nAdditional Context:\n${chromaContext.context}`;
    console.log("Enriched Context:", enrichedContext);

    // Call LangGraph service
    const response = await langGraphService.taskControl(
      task,
      aiRole,
      enrichedContext
    );

    // Check if response is an error
    if (response instanceof Error) {
      throw response;
    }

    return NextResponse.json({
      success: true,
      message: "AI response generated successfully",
      data: {
        task,
        role: aiRole,
        response,
      },
    });
  } catch (error: any) {
    console.error("LangGraph API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate AI response",
      },
      { status: 500 }
    );
  }
}
