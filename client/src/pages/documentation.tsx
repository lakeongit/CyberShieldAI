import { Link } from "wouter";
import { 
  ArrowLeft, 
  BookOpen, 
  Shield, 
  Network,
  MessageSquare, 
  FileText, 
  Users, 
  Code,
  Lock,
  Database,
  Bot,
  ServerIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, items }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="p-6 h-full border-none bg-gradient-to-br from-white to-muted shadow-lg hover:shadow-xl transition-all">
      <div className="p-3 w-12 h-12 rounded-lg bg-primary/10 mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2 text-sm">
        {items.map((item: string, index: number) => (
          <li key={index} className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  </motion.div>
);

export function Documentation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Header */}
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

      <main className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
              Cybersecurity Expert System
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              An AI-powered assistant that combines advanced language models with a curated 
              knowledge base to provide expert-level cybersecurity guidance.
            </p>
          </motion.div>
        </section>

        {/* Core Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Bot}
              title="AI Assistant"
              description="Intelligent chat interface powered by advanced language models"
              items={[
                "Context-aware responses",
                "Real-time interactions",
                "Source citations"
              ]}
            />
            <FeatureCard
              icon={Database}
              title="Knowledge Base"
              description="Comprehensive document management system"
              items={[
                "Secure document storage",
                "Automatic classification",
                "Version control"
              ]}
            />
            <FeatureCard
              icon={Lock}
              title="Security"
              description="Enterprise-grade security features"
              items={[
                "Role-based access",
                "Audit logging",
                "Encryption"
              ]}
            />
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Technical Architecture</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 bg-gradient-to-br from-white to-muted border-none shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <ServerIcon className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Frontend</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  React with TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Tailwind CSS for styling
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Shadcn UI components
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-white to-muted border-none shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Backend</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Node.js + Express
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  PostgreSQL database
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  OpenAI integration
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/api-docs">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="p-6 bg-gradient-to-br from-white to-muted border-none shadow-lg cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <Code className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        API Documentation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Explore API endpoints and integration guides
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            <Link href="/admin">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="p-6 bg-gradient-to-br from-white to-muted border-none shadow-lg cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <Shield className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        Admin Panel
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage system settings and users
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Documentation;