import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, MessageCircle, Upload, Users } from "lucide-react";
import { Link } from "wouter";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-8">
        <div className="prose prose-sm max-w-none">
          <h2>System Overview</h2>
          <p>
            The Cybersecurity Expert Chatbot is an AI-powered assistant that provides domain-specific
            answers by combining a knowledge base of cybersecurity documents with advanced language
            models.
          </p>

          <div className="grid gap-6 md:grid-cols-3 my-8">
            <Card>
              <CardHeader>
                <MessageCircle className="h-6 w-6 mb-2" />
                <CardTitle>Chat Interface</CardTitle>
                <CardDescription>Interactive AI Assistant</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Ask questions about cybersecurity</li>
                  <li>Get context-aware responses</li>
                  <li>View source documents</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Upload className="h-6 w-6 mb-2" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>For Administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Upload new documents</li>
                  <li>Automatic classification</li>
                  <li>Vector search integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-6 w-6 mb-2" />
                <CardTitle>User Access</CardTitle>
                <CardDescription>Authentication & Roles</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  <li>User registration/login</li>
                  <li>Admin privileges</li>
                  <li>Secure document access</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2>Technical Architecture</h2>
          <ul>
            <li>
              <strong>Frontend:</strong> React with TypeScript, Tailwind CSS, and
              Shadcn UI components
            </li>
            <li>
              <strong>Backend:</strong> Express.js server with PostgreSQL database
            </li>
            <li>
              <strong>AI Integration:</strong> OpenAI GPT-4o for chat responses
            </li>
            <li>
              <strong>Vector Search:</strong> Document embeddings stored in
              PostgreSQL with pgvector
            </li>
          </ul>

          <h2>Usage Guidelines</h2>
          <h3>For Users</h3>
          <ol>
            <li>Register an account or login to access the chat interface</li>
            <li>Ask questions about cybersecurity topics</li>
            <li>Review source documents referenced in responses</li>
          </ol>

          <h3>For Administrators</h3>
          <ol>
            <li>Access the admin dashboard via the navigation menu</li>
            <li>Upload new documents in supported formats</li>
            <li>Review automatic document classification and tagging</li>
            <li>Monitor the document knowledge base</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
