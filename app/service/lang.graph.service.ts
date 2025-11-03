import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages";

// Types
export type AIRole =
  | "assistant"
  | "analyst"
  | "creative"
  | "technical"
  | "educator";

export interface TaskInput {
  task: string;
  role: AIRole;
  context: string;
}

// Define state annotation
const GraphStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  context: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  role: Annotation<AIRole>({
    reducer: (x, y) => y ?? x,
  }),
  response: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
  }),
  error: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
  }),
});

class LangGraphService {
  private static instance: LangGraphService;
  private model: ChatGoogleGenerativeAI;
  private graph;

  private constructor() {
    // Initialize Gemini model
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY || "",
    });

    // Initialize graph
    this.graph = this.buildGraph();
  }

  public static getInstance(): LangGraphService {
    if (!LangGraphService.instance) {
      LangGraphService.instance = new LangGraphService();
    }
    return LangGraphService.instance;
  }

  private buildGraph() {
    const workflow = new StateGraph(GraphStateAnnotation)
      .addNode("generate", this.generateNode.bind(this))
      .addEdge("__start__", "generate")
      .addEdge("generate", "__end__");
    const compiledWorkflow = workflow.compile();
    return compiledWorkflow;
  }

  private async generateNode(state: typeof GraphStateAnnotation.State) {
    try {
      const systemPrompt = this.getRolePrompt(state.role);

      // Prepare messages with system message first
      const messages: BaseMessage[] = [
        new SystemMessage(`${systemPrompt}\nContext: ${state.context}`),
        ...state.messages,
      ];

      // Create a message chain for the model
      const response = await this.model.invoke(messages);

      return {
        response: response.content,
      };
    } catch (error) {
      console.error("Error generating response:", error);
      return {
        error:
          "Failed to generate AI response. Please check your Google API key and try again.",
      };
    }
  }

  private getRolePrompt(role: AIRole): string {
    const rolePrompts: Record<AIRole, string> = {
      assistant:
        "You are a helpful AI assistant. Provide clear, accurate, and friendly responses.",
      analyst:
        "You are a data analyst. Provide analytical insights, identify patterns, and offer data-driven recommendations.",
      creative:
        "You are a creative AI. Generate innovative ideas, creative content, and imaginative solutions.",
      technical:
        "You are a technical expert. Provide detailed technical explanations, code examples, and best practices.",
      educator:
        "You are an educator. Explain concepts clearly, use examples, and ensure understanding through structured learning.",
    };

    return rolePrompts[role] || rolePrompts.assistant;
  }

  public async taskControl(
    task: string,
    role: AIRole,
    context: string
  ): Promise<string | unknown> {
    try {
      switch (task.toLowerCase()) {
        case "chat":
          return await this.handleChat(role, context);

        default:
          return "Task not supported. Only 'chat' is available.";
      }
    } catch (error) {
      console.error("Error in task control:", error);
      return error;
    }
  }

  private async handleChat(
    role: AIRole,
    context: string
  ): Promise<string | unknown> {
    try {
      const result = await this.graph.invoke({
        messages: [new HumanMessage(context)] as BaseMessage[],
        context,
        role,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.response || "No response generated";
    } catch (error) {
      console.error("Error in chat handler:", error);
      return error;
    }
  }
}

// Export singleton instance
export const langGraphService = LangGraphService.getInstance();
