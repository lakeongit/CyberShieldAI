import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Loader2, FileText, AlertCircle, RefreshCcw, Copy, ChevronDown, ChevronUp, Plus, Search, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Conversation, Message } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface ChatResponse {
  message: Message;
  sources: Array<{ id: number; title: string; category?: string; tags?: string[] }>;
}

const EXAMPLE_QUESTIONS = [
  "What are the key components of the NIST Cybersecurity Framework?",
  "How do I implement Zero Trust Architecture?",
  "What's the best practice for incident response planning?",
];

export function ChatInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations", searchQuery],
    queryFn: async () => {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      const res = await apiRequest("GET", `/api/conversations${params}`);
      return res.json();
    },
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await apiRequest("GET", `/api/conversations/${selectedConversation.id}/messages`);
      return res.json();
    },
    enabled: !!selectedConversation,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", {
        title: "New Chat"
      });
      return res.json();
    },
    onSuccess: (conversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(conversation);
      setInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const chatMutation = useMutation<ChatResponse, Error, string>({
    mutationFn: async (message) => {
      if (!selectedConversation) {
        throw new Error("No conversation selected");
      }
      const res = await apiRequest("POST", "/api/chat", {
        message,
        conversationId: selectedConversation.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", selectedConversation?.id, "messages"]
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    chatMutation.mutate(input);
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

  return (
    <div className="grid grid-cols-[300px_1fr] h-[600px] gap-4">
      {/* Sidebar */}
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => createConversationMutation.mutate()}
            className="w-full"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {conversations?.map((conversation) => (
              <Button
                key={conversation.id}
                variant={selectedConversation?.id === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedConversation(conversation)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="truncate">{conversation.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="relative">
        <ScrollArea className="h-[530px] p-4" ref={scrollAreaRef}>
          {(!selectedConversation || !messages?.length) && (
            <div className="text-center text-muted-foreground p-4">
              <h3 className="font-semibold mb-2">Example Questions</h3>
              <div className="space-y-2">
                {EXAMPLE_QUESTIONS.map((question) => (
                  <Button
                    key={question}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      if (!selectedConversation) {
                        createConversationMutation.mutate();
                      }
                      setInput(question);
                      handleSubmit(new Event("submit") as any);
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages?.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {message.role === "error" ? (
                  <Alert variant="destructive" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{message.content}</AlertDescription>
                  </Alert>
                ) : (
                  <Collapsible
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
                              >
                                {message.sources ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronUp className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                          <div className="pr-20">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {message.sources && (
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
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-0 right-0 border-t p-4 flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ENO about cybersecurity..."
            disabled={chatMutation.isPending || !selectedConversation}
          />
          <Button type="submit" disabled={chatMutation.isPending || !selectedConversation}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}