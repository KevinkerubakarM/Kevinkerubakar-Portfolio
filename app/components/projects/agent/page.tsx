"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAgentPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTrainOpen, setIsTrainOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatWidth, setChatWidth] = useState(30);
  const [isResizing, setIsResizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeFrame = useRef<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainDone, setTrainDone] = useState(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/langGraph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: "chat",
          role: "assistant",
          context: currentInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get AI response");
      }

      const data = await response.json();

      if (data.success && data.data?.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${
          error.message || "Failed to get response. Please try again."
        }`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧩 Resize logic
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      if (resizeFrame.current) cancelAnimationFrame(resizeFrame.current);

      resizeFrame.current = requestAnimationFrame(() => {
        const windowWidth = window.innerWidth;
        const newWidth = ((windowWidth - e.clientX) / windowWidth) * 100;
        const clampedWidth = Math.min(Math.max(newWidth, 20), 40);
        if (panelRef.current) panelRef.current.style.width = `${clampedWidth}%`;
        setChatWidth(clampedWidth);
      });
    },
    [isResizing]
  );

  const handleResizeStop = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", handleResizeStop);
    } else {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleResizeStop);
    }
    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleResizeStop);
    };
  }, [isResizing, handleResize, handleResizeStop]);

  // 🧠 Train AI Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/json",
    ];
    if (!allowed.includes(file.type)) {
      setTrainStatus("Unsupported file type. Upload PDF, DOCX, or JSON.");
      return;
    }
    setSelectedFile(file);
    setTrainStatus(`📁 Selected: ${file.name}`);
    setTrainDone(false);
  };

  const handleTrain = async () => {
    if (!selectedFile) {
      setTrainStatus("Please select a file first.");
      return;
    }
    setIsTraining(true);
    setTrainStatus("Training in progress...");
    setTrainDone(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/chroma", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Training failed");

      const data = await res.json();
      setTrainStatus(data.message || "Training complete");
      setTrainDone(true);
    } catch (err) {
      console.error(err);
      setTrainStatus("Training failed. Check console.");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white">
      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
        <h1 className="text-5xl font-bold mb-6 text-blue-400">
          Test the AI Agent
        </h1>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          This AI Agent is durable, connects with various tools, and is fully
          trainable.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col gap-4">
          <button
            onClick={() => {
              setIsTrainOpen(false);
              setIsChatOpen((prev) => !prev);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg"
          >
            {isChatOpen ? "Close Chat" : "Open Chat"}
          </button>

          <button
            onClick={() => {
              setIsChatOpen(false);
              setIsTrainOpen((prev) => !prev);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg"
          >
            {isTrainOpen ? "Close Trainer" : "Train AI"}
          </button>
        </div>
      </div>

      {/* === RIGHT PANEL: Chat OR Train === */}
      {(isChatOpen || isTrainOpen) && (
        <div
          ref={panelRef}
          className="relative bg-gray-900 border-l border-gray-800 flex flex-col transition-none"
          style={{ width: `${chatWidth}%` }}
        >
          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className={`absolute left-0 top-0 h-full w-1 cursor-col-resize z-10 transition-colors ${
              isResizing ? "bg-blue-500" : "bg-gray-600 hover:bg-blue-400"
            }`}
          />

          {/* === CHAT PANEL === */}
          {isChatOpen && (
            <>
              <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <h1 className="text-lg font-semibold">AI Assistant</h1>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✖
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-20">
                    👋 Start chatting with your AI Agent!
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-xl text-sm shadow ${
                        msg.role === "assistant"
                          ? "bg-gray-700 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm shadow">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-700 flex gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "..." : "Send"}
                </button>
              </form>
            </>
          )}

          {/* === TRAINING PANEL === */}
          {isTrainOpen && (
            <>
              <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <h1 className="text-lg font-semibold">Train AI</h1>
                <button
                  onClick={() => setIsTrainOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✖
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                <input
                  type="file"
                  accept=".pdf,.docx,.json"
                  onChange={handleFileSelect}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />

                <button
                  disabled={isTraining}
                  onClick={handleTrain}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    isTraining
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isTraining ? "Training..." : "Train Model"}
                </button>

                {/* ✅ Animated Check after success */}
                {trainDone && (
                  <div className="flex items-center justify-center mt-4">
                    <svg
                      className="w-12 h-12 text-green-400 animate-checkmark"
                      viewBox="0 0 52 52"
                    >
                      <circle
                        className="stroke-current text-green-600 opacity-20"
                        cx="26"
                        cy="26"
                        r="25"
                        fill="none"
                        strokeWidth="2"
                      />
                      <path
                        className="stroke-current text-green-400"
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="48"
                        strokeDashoffset="48"
                        d="M14 27l7 7 17-17"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="48"
                          to="0"
                          dur="0.6s"
                          fill="freeze"
                        />
                      </path>
                    </svg>
                  </div>
                )}

                {trainStatus && (
                  <p className="text-sm text-gray-300 text-center max-w-sm">
                    {trainStatus}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
