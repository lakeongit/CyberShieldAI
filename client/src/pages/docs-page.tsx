import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, MessageCircle, Upload, Users, Shield, Code, Database, Bot } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Documentation
              </h1>
            </div>
            <Link href="/">
              <Button variant="outline" className="hover:bg-primary/5">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
              Cybersecurity Expert System
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              An AI-powered assistant combining advanced language models with expert knowledge for precise cybersecurity guidance.
            </p>
          </motion.div>

          {/* Overview Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-muted">
            <CardHeader>
              <CardTitle className="text-2xl">System Overview</CardTitle>
              <CardDescription className="text-lg">
                Core features and capabilities of our cybersecurity chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Bot className="h-4 w-4 text-primary mt-1" />
                      <span><strong>Domain-Specific Knowledge:</strong> Specialized cybersecurity expertise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-primary mt-1" />
                      <span><strong>Document Management:</strong> Enhanced response system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary mt-1" />
                      <span><strong>Secure Authentication:</strong> Protected access control</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    How It Works
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our system leverages advanced language models and a specialized knowledge base to deliver:
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary mt-1" />
                      Context-aware responses based on your queries
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary mt-1" />
                      Real-time document processing and analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary mt-1" />
                      Continuous learning from new documents
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Core Components</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-muted h-full">
                  <CardHeader>
                    <MessageCircle className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Chat Interface</CardTitle>
                    <CardDescription>Interactive AI Assistant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Natural language queries
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Real-time responses
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Source citations
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-muted h-full">
                  <CardHeader>
                    <Upload className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Document System</CardTitle>
                    <CardDescription>Knowledge Management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Secure file uploads
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Auto-classification
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Version tracking
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-muted h-full">
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Access Control</CardTitle>
                    <CardDescription>Security & Permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Role-based access
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Activity tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Audit logging
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Technical Architecture */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Technical Architecture</h2>
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-muted">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      Frontend Stack
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>React with TypeScript</span>
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Tailwind CSS + shadcn/ui</span>
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Responsive Design System</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Backend Infrastructure
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Node.js + Express</span>
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>PostgreSQL + pgvector</span>
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>OpenAI Integration</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}