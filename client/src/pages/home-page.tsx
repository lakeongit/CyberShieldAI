import { ChatInterface } from "@/components/chat-interface";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, BookOpen, Lock, Network, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EXAMPLE_TOPICS = [
  {
    icon: <Lock className="w-4 h-4" />,
    title: "Security Frameworks",
    description: "NIST CSF, ISO 27001, SOC 2",
  },
  {
    icon: <Network className="w-4 h-4" />,
    title: "Network Security",
    description: "Firewalls, IDS/IPS, Zero Trust",
  },
  {
    icon: <Activity className="w-4 h-4" />,
    title: "Incident Response",
    description: "Threat Detection, Analysis, Recovery",
  },
];

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">ENO Secure</h1>
              <p className="text-sm text-muted-foreground">Your AI Security Expert</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline">Admin Dashboard</Button>
              </Link>
            )}
            <Link href="/docs">
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Documentation
              </Button>
            </Link>
            <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to ENO Secure, {user?.username}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get expert insights on cybersecurity best practices, frameworks, and implementation strategies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {EXAMPLE_TOPICS.map((topic) => (
                <Card key={topic.title} className="group hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {topic.icon}
                      </div>
                      <h3 className="font-semibold">{topic.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <ChatInterface />
        </div>
      </main>
    </div>
  );
}