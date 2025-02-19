import { Link } from "wouter";
import { ArrowLeft, MessageSquare, FileText, Users, Code, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Documentation() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 mb-8 text-muted-foreground">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Documentation</span>
      </nav>

      {/* Main Title */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">System Documentation</h1>
        <p className="text-lg text-muted-foreground">
          The Cybersecurity Expert Chatbot provides domain-specific answers by leveraging advanced AI models and a curated knowledge base.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <MessageSquare className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Chat Interface</h3>
          <p className="text-muted-foreground mb-4">Interactive AI Assistant</p>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              • Ask questions about cybersecurity
            </li>
            <li className="flex items-center text-sm">
              • Get context-aware responses
            </li>
            <li className="flex items-center text-sm">
              • View source documents
            </li>
          </ul>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <FileText className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Document Management</h3>
          <p className="text-muted-foreground mb-4">For Administrators</p>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              • Upload new documents
            </li>
            <li className="flex items-center text-sm">
              • Automatic classification
            </li>
            <li className="flex items-center text-sm">
              • Vector search integration
            </li>
          </ul>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Users className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">User Access</h3>
          <p className="text-muted-foreground mb-4">Authentication & Roles</p>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              • User registration/login
            </li>
            <li className="flex items-center text-sm">
              • Admin privileges
            </li>
            <li className="flex items-center text-sm">
              • Secure document access
            </li>
          </ul>
        </Card>
      </div>

      {/* Technical Architecture */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Technical Architecture</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">Frontend</Badge>
              <p className="text-sm">React with TypeScript, Tailwind CSS, and Shadcn UI components</p>
            </div>
            <Separator />
            <div>
              <Badge variant="outline" className="mb-2">Backend</Badge>
              <p className="text-sm">Express.js server with PostgreSQL database</p>
            </div>
            <Separator />
            <div>
              <Badge variant="outline" className="mb-2">AI Integration</Badge>
              <p className="text-sm">OpenAI API for document analysis and natural language processing</p>
            </div>
          </div>
        </Card>
      </div>

      {/* API Documentation Link */}
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">API Documentation</h3>
            <p className="text-muted-foreground">Explore the API endpoints and integration guides</p>
          </div>
          <Code className="h-8 w-8 text-primary" />
        </div>
      </Card>
    </div>
  );
}

export default Documentation;
