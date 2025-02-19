import { Link } from "wouter";
import { ArrowLeft, MessageSquare, FileText, Users, Code, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Documentation() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header Section */}
      <header className="mb-12">
        <nav className="flex items-center space-x-2 mb-6 text-muted-foreground">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Documentation</span>
        </nav>

        <h1 className="text-4xl font-bold mb-6">Cybersecurity Expert System</h1>
        <Card className="p-6 bg-primary/5">
          <p className="text-lg text-muted-foreground leading-relaxed">
            An AI-powered assistant that provides expert-level cybersecurity guidance by leveraging advanced AI models and a curated knowledge base.
          </p>
        </Card>
      </header>

      {/* Key Features Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-l-4 border-primary">
            <Badge variant="outline" className="mb-2">Document Management</Badge>
            <p className="text-sm">Upload and manage cybersecurity documents for enhanced responses</p>
          </Card>
          <Card className="p-6 border-l-4 border-primary">
            <Badge variant="outline" className="mb-2">Secure Authentication</Badge>
            <p className="text-sm">Protected access with user authentication</p>
          </Card>
          <Card className="p-6 border-l-4 border-primary">
            <Badge variant="outline" className="mb-2">Interactive Chat</Badge>
            <p className="text-sm">Real-time conversation with AI-powered responses</p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="relative">
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-border -translate-x-1/2 md:block hidden" />
          <div className="space-y-12">
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <Card className="p-6 md:text-right">
                <h3 className="text-xl font-semibold mb-3">1. Ask Questions</h3>
                <p className="text-muted-foreground">
                  Input your cybersecurity queries through our intuitive chat interface
                </p>
              </Card>
              <div className="hidden md:block" />
            </div>

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div className="hidden md:block" />
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">2. AI Processing</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your question and searches through verified cybersecurity documents
                </p>
              </Card>
            </div>

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <Card className="p-6 md:text-right">
                <h3 className="text-xl font-semibold mb-3">3. Expert Response</h3>
                <p className="text-muted-foreground">
                  Receive detailed answers with citations from authoritative sources
                </p>
              </Card>
              <div className="hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <MessageSquare className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-4">Chat Interface</h3>
            <div className="space-y-3">
              <Badge variant="secondary" className="w-full justify-start text-sm">
                Ask questions about cybersecurity
              </Badge>
              <Badge variant="secondary" className="w-full justify-start text-sm">
                Get context-aware responses
              </Badge>
              <Badge variant="secondary" className="w-full justify-start text-sm">
                View source documents
              </Badge>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <FileText className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-4">Document Management</h3>
            <div className="space-y-3">
              <Badge variant="secondary" className="w-full justify-start text-sm">
                Upload new documents
              </Badge>
              <Badge variant="secondary" className="w-full justify-start text-sm">
                Automatic classification
              </Badge>
              <Badge variant="secondary" className="w-full justify-start text-sm">
                Vector search integration
              </Badge>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Users className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-4">User Access</h3>
            <div className="space-y-3">
              <Badge variant="secondary" className="w-full justify-start text-sm">
                User registration/login
              </Badge>
              <Badge variant="secondary" className="w-full justify-start text-sm">
                Admin privileges
              </Badge>
              <Badge variant="secondary" className="w-full justify-start text-sm">
                Secure document access
              </Badge>
            </div>
          </Card>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Technical Architecture</h2>
        <Card className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Frontend</Badge>
              <p className="text-sm text-muted-foreground">
                React with TypeScript, Tailwind CSS, and Shadcn UI components
              </p>
            </div>
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Backend</Badge>
              <p className="text-sm text-muted-foreground">
                Express.js server with PostgreSQL database
              </p>
            </div>
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">AI Integration</Badge>
              <p className="text-sm text-muted-foreground">
                OpenAI GPT-4 for chat responses and document analysis
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* API Documentation Link */}
      <Link href="/api-docs">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                API Documentation
              </h3>
              <p className="text-muted-foreground">
                Explore the API endpoints and integration guides
              </p>
            </div>
            <Code className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </Card>
      </Link>
    </div>
  );
}

export default Documentation;