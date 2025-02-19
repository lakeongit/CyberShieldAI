import { ChatInterface } from "@/components/chat-interface";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Cybersecurity Expert</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline">Admin Dashboard</Button>
              </Link>
            )}
            <Link href="/docs">
              <Button variant="outline">Documentation</Button>
            </Link>
            <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {user?.username}
            </h2>
            <p className="text-muted-foreground">
              Ask questions about cybersecurity best practices, frameworks, and get expert insights.
            </p>
          </div>

          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
