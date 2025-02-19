import { Link } from "wouter";
import { ArrowLeft, MessageSquare, FileText, Users, Code, ChevronRight, BookOpen, Shield, Network } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Documentation</h1>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Quick Overview Section */}
        <section className="mb-12">
          <Card className="p-6 bg-primary/5 border-l-4 border-primary">
            <h2 className="text-2xl font-bold mb-4">Cybersecurity Expert System</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              An AI-powered assistant that combines advanced language models with a curated knowledge base to provide expert-level cybersecurity guidance.
            </p>
          </Card>
        </section>

        {/* Core Features Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 w-12 h-12 rounded-full bg-primary/10 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Chat Interface</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Context-aware responses
                </li>
                <li className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Real-time interaction
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Source citations
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 w-12 h-12 rounded-full bg-primary/10 mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Document Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure uploads
                </li>
                <li className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Auto-classification
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Version control
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User Access</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure authentication
                </li>
                <li className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Role-based access
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Activity logging
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Technical Architecture</h2>
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Frontend</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>React with TypeScript</li>
                  <li>Tailwind CSS for styling</li>
                  <li>Shadcn UI components</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Backend</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Node.js + Express</li>
                  <li>PostgreSQL database</li>
                  <li>OpenAI integration</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Quick Links */}
        <section>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/api-docs">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-center gap-4">
                  <Code className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary">API Documentation</h3>
                    <p className="text-sm text-muted-foreground">Explore API endpoints and integration guides</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/admin">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-center gap-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary">Admin Panel</h3>
                    <p className="text-sm text-muted-foreground">Manage system settings and users</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Documentation;