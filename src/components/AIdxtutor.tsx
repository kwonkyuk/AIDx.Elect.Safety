import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Bot, X, Send, Loader2 } from "lucide-react";
import { ChatMessage } from "../types";

interface AIdxtutorProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AIdxtutor({ isOpen, setIsOpen }: AIdxtutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "반갑습니다! AI.DX 전기안전 수업에 참여한 것을 환영합니다. 산업안전관리과 YUKWON 교수입니다. 교안의 공식적인 물리 공식이나 줄의 법칙, LOTO 절차, 방폭 구조, 단락흔 감식 등 어려운 점이 있으면 무엇이든 질문 바랍니다.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resize state (from bottom-left diagonal corner)
  const [width, setWidth] = useState(380);
  const [height, setHeight] = useState(520);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, startWidth: 0, startHeight: 0 });

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startWidth: width,
      startHeight: height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Restrict drag positioning slightly inside window bounds
        const nextX = e.clientX - dragStart.current.x;
        const nextY = e.clientY - dragStart.current.y;
        setPosition({ x: nextX, y: nextY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.mouseX;
        const deltaY = e.clientY - resizeStart.current.mouseY;
        
        // Bottom-left resizing math:
        // Dragging left (negative deltaX) should INCREASE width
        const targetWidth = resizeStart.current.startWidth - deltaX;
        // Dragging down (positive deltaY) should INCREASE height
        const targetHeight = resizeStart.current.startHeight + deltaY;
        
        setWidth(Math.max(300, Math.min(800, targetWidth)));
        setHeight(Math.max(350, Math.min(800, targetHeight)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, width, height]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyToSend = messages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, chatHistory: historyToSend }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to communicate with AI.");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `이런! 실시간 학사망 통신 상태가 고르지 못하구나. 한 번 더 차분히 물어봐 주겠니? (오류: ${err.message || "연결 불가"})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={dragRef}
      className="fixed z-50 transition-all duration-75 select-none"
      style={{
        bottom: position.y === 0 ? "24px" : "auto",
        right: position.x === 0 ? "24px" : "auto",
        transform: position.x !== 0 || position.y !== 0 
          ? `translate3d(${position.x}px, ${position.y}px, 0)` 
          : "none",
        ...(position.x !== 0 || position.y !== 0 ? { top: "100px", left: "100px" } : {})
      }}
    >
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center relative cursor-pointer border border-blue-500/20 shadow-blue-500/10"
          title="YUKWON 교수 AI 튜터 켜기"
        >
          <div className="absolute -top-1 -right-1 bg-red-600 text-[9px] text-white px-2 py-0.5 rounded-full font-bold animate-pulse shadow-sm">
            AI 튜터
          </div>
          <Bot className="w-7 h-7" />
        </button>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div
          onMouseDown={handleMouseDown}
          className="bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden select-text relative"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Header (Draggable Handle) */}
          <div className="bg-slate-900 border-b-2 border-blue-500 p-4 text-white flex justify-between items-center cursor-move">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">YUKWON 교수 AI 튜터</h4>
                <p className="text-[11px] text-slate-400 font-medium">산업안전 전기공학 지도실</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="no-drag hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer animate-none"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "model" && (
                  <div className="bg-blue-100/60 text-blue-800 p-1.5 rounded-lg h-fit">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className="max-w-[78%] flex flex-col">
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed text-zinc-700 shadow-sm border ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none border-blue-500 font-semibold"
                        : "bg-white rounded-tl-none border-slate-200"
                    }`}
                  >
                    {/* Render newlines beautifully inside chat bubbles */}
                    {m.text.split("\n").map((line, idx) => (
                      <p key={idx} className={line ? "mb-1" : "h-2"}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <span className={`text-[9px] text-slate-400 mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-2.5">
                <div className="bg-blue-100 text-blue-800 p-1.5 rounded-lg h-fit animate-spin">
                  <Loader2 className="w-4 h-4" />
                </div>
                <div className="bg-blue-50 text-blue-800/80 p-3 rounded-xl rounded-tl-none text-xs border border-blue-100/50">
                  교수님이 답변을 열심히 적고 계십니다...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field with left padding for bottom-left resize handler */}
          <div className="p-4 pl-7 bg-white border-t border-slate-100 no-drag relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="교수님에게 질문을 시작하세요..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 placeholder-slate-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom-left resize handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize flex items-end justify-start p-1.5 z-50 group hover:bg-slate-100/50 rounded-bl-xl active:bg-slate-200/50 no-drag"
            title="창 확대/축소 드래그 (좌측 하단)"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 5L5 19M5 19H12M5 19V12" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
