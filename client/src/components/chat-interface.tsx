import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Loader2, FileText, AlertCircle, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
  sources?: Array<{ id: number; title: string }>;
  retryFn?: () => void;
}

interface ChatResponse {
  response: string;
  sources: Array<{ id: number; title: string }>;
}

export function ChatInterface() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const chatMutation = useMutation<ChatResponse, Error, string>({
    mutationFn: async (message) => {
      try {
        const res = await apiRequest("POST", "/api/chat", { message });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to send message");
        }
        return res.json();
      } catch (error: any) {
        throw new Error(error.message || "Network error occurred");
      }
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources,
        },
      ]);
    },
    onError: (error, variables) => {
      const errorMessage = error.message || "Failed to get response";
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: errorMessage,
          retryFn: () => chatMutation.mutate(variables),
        },
      ]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleRetry = (retryFn: () => void) => {
    setMessages((prev) => prev.filter((msg) => msg.role !== "error"));
    retryFn();
  };

  return (
    <Card className="relative">
      <ScrollArea className="h-[600px] p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {message.role === "error" ? (
                <Alert variant="destructive" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.content}</AlertDescription>
                  {message.retryFn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => message.retryFn?.()}
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                </Alert>
              ) : (
                <>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source) => (
                          <Badge key={source.id} variant="secondary">
                            {source.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="border-t p-4 flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about cybersecurity..."
          disabled={chatMutation.isPending}
        />
        <Button type="submit" disabled={chatMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}