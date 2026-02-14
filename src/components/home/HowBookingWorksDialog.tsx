"use client";

import { useAiAssistant } from "@/hooks/useAiAssistant";
import { RootState, useAppDispatch } from "@/lib/store";
import { setCars, setAllCars } from "@/lib/slices/data";
import { Send, X, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

const AVATAR_URL =
  "https://res.cloudinary.com/dlax3esau/image/upload/v1771041869/ChatGPT_Image_Feb_14_2026_11_57_50_AM_svfe1e.png";

const QUICK_QUESTIONS = [
  "How do I book a car?",
  "What cars are available near me?",
  "Check my booking",
  "What is the refund policy?",
];

/**
 * HowBookingWorksDialog component
 * AI-powered chat assistant that answers car rental booking questions
 */
export function HowBookingWorksDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const dispatch = useAppDispatch();
  const mapbox = useSelector((state: RootState) => state.mapBox?.current);
  const guestToken = useSelector((state: RootState) => state.auth?.guestToken);
  const locationContext = useMemo(() => {
    if (!mapbox?.address) return undefined;
    return {
      address: mapbox.address,
      city: mapbox.city,
      province: mapbox.province,
    };
  }, [mapbox?.address, mapbox?.city, mapbox?.province]);

  const allCars = useSelector((state: RootState) => (state.data as { allCars: Record<string, unknown>[] })?.allCars || []);

  const handleCarsFound = useCallback((rawCars: Record<string, unknown>[]) => {
    if (rawCars.length > 0) {
      // Merge into allCars so useCar(id) can find any car from AI results
      const existingIds = new Set(allCars.map((c: Record<string, unknown>) => c.id));
      const newCars = rawCars.filter((c: Record<string, unknown>) => !existingIds.has(c.id));
      if (newCars.length > 0) {
        dispatch(setAllCars([...allCars, ...newCars]));
      }
    }
  }, [dispatch, allCars]);

  const { messages, isLoading, sendMessage, clearChat, waitingForEmail, waitingForOtp } = useAiAssistant({
    location: locationContext,
    token: guestToken,
    onCarsFound: handleCarsFound,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
    // Keep input focused when messages update (AI responding)
    if (open) inputRef.current?.focus();
  }, [messages, isLoading, scrollToBottom, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickQuestion = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage]
  );

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-15 right-2 z-9999 flex items-center justify-center w-14 h-14 rounded-full  hover:scale-110 transition-all duration-200 active:scale-95 overflow-hidden "
        aria-label="Chat with Renty"
      >
        <Image
          src={AVATAR_URL}
          alt="Renty AI Assistant"
          width={70}
          height={70}
          className="object-cover"
        />
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-32 right-2 z-9999 w-[340px] sm:w-[380px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
              <Image
                src={AVATAR_URL}
                alt="Renty"
                width={70}
                height={70}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Renty</div>
              <div className="text-[10px] text-blue-100">
                Car Rental Assistant
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[calc(70vh-140px)]">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5">
                    <Image
                      src={AVATAR_URL}
                      alt="Renty"
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                    <p className="text-sm text-gray-800">
                      Hi! I&apos;m <strong>Renty</strong>, your car rental
                      assistant. Ask me anything about booking, pricing,
                      payments, or policies!
                    </p>
                  </div>
                </div>

                {/* Quick questions */}
                <div className="pl-9 space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                    Quick questions
                  </p>
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      className="block w-full text-left text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-100"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5">
                    <Image
                      src={AVATAR_URL}
                      alt="Renty"
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 max-w-[85%] text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm" + (msg.isHtml ? "" : " whitespace-pre-wrap")
                  }`}
                >
                  {msg.isHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        const anchor = target.closest('a');
                        const href = anchor?.getAttribute('href');
                        if (anchor && href?.startsWith('/')) {
                          e.preventDefault();
                          // If navigating to /cars/[id], dispatch car data to Redux first
                          const carMatch = href.match(/^\/cars\/([^/]+)$/);
                          if (carMatch) {
                            const carId = carMatch[1];
                            const carData = allCars.find((c: Record<string, unknown>) => c.id === carId || c._id === carId);
                            if (carData) {
                              dispatch(setCars(carData));
                            }
                          }
                          setOpen(false);
                          router.push(href);
                        }
                      }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5">
                  <Image
                    src={AVATAR_URL}
                    alt="Renty"
                    width={28}
                    height={28}
                    className="object-cover"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={waitingForOtp ? "Enter 6-digit code..." : waitingForEmail ? "Enter your email address..." : "Ask me anything..."}
                className="flex-1 text-sm px-3 py-2 bg-white border border-gray-200 rounded-full outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-1">
              Powered by AI - Answers may not always be accurate
            </p>
          </div>
        </div>
      )}
    </>
  );
}
