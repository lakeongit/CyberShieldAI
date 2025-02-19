import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Loader2, FileText, AlertCircle, RefreshCcw, Copy, ChevronDown, ChevronUp, Search, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/ui/sidebar";

interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
  sources?: Array<{ id: number; title: string; category?: string; tags?: string[] }>;
  retryFn?: () => void;
  expanded?: boolean;
  metadata?: {
    type?: "warning" | "info" | "tip";
    title?: string;
  };
}

interface ChatResponse {
  response: string;
  sources: Array<{ id: number; title: string; category?: string; tags?: string[] }>;
}

const EXAMPLE_QUESTIONS = [
  "What are the key components of the NIST Cybersecurity Framework?",
  "How do I implement Zero Trust Architecture?",
  "What's the best practice for incident response planning?",
];

export function ChatInterface() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredMessages = messages.filter(
    msg => typeof msg.content === 'string' && msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          expanded: false,
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

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ description: "Copied to clipboard!" });
    } catch (err) {
      toast({ description: "Failed to copy", variant: "destructive" });
    }
  };

  const toggleExpand = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, expanded: !msg.expanded } : msg
      )
    );
  };

  return (
    <div className="flex h-full">
      {showSidebar && (
        <div className="w-64 border-r p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {filteredMessages
              .filter((msg) => msg.role === "user")
              .map((msg, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start text-sm truncate mb-1"
                  onClick={() => {
                    setInput(msg.content);
                  }}
                >
                  {msg.content}
                </Button>
              ))}
          </ScrollArea>
        </div>
      )}

      <Card className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[600px] p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              <h3 className="font-semibold mb-2">Example Questions</h3>
              <div className="space-y-2">
                {EXAMPLE_QUESTIONS.map((question) => (
                  <Button
                    key={question}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setInput(question);
                      handleSubmit(new Event("submit") as any);
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
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
                    <Collapsible
                      open={message.expanded}
                      className={`w-full ${
                        message.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="relative">
                            <div className="absolute right-0 top-0 flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => toggleExpand(i)}
                                >
                                  {message.expanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            <div className={cn(
                              "pr-20",
                              message.metadata?.type === "warning" && "border-l-4 border-yellow-500 pl-4",
                              message.metadata?.type === "info" && "border-l-4 border-blue-500 pl-4",
                              message.metadata?.type === "tip" && "border-l-4 border-green-500 pl-4"
                            )}>
                              {message.metadata?.title && (
                                <div className="mb-2 font-semibold">
                                  {message.metadata.title}
                                </div>
                              )}
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                              {message.sources && message.sources.length > 0 && (
                                <Separator className="my-4" />
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>

                      {message.sources && message.sources.length > 0 && (
                        <CollapsibleContent>
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source) => (
                                <Badge
                                  key={source.id}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {source.title}
                                  {source.category && (
                                    <span className="text-xs opacity-70">
                                      • {source.category}
                                    </span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  )}
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ENO is thinking...
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4 space-y-2">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={handleNewChat}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ENO about cybersecurity..."
              disabled={chatMutation.isPending}
            />
            <Button type="submit" disabled={chatMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}