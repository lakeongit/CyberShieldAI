import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Terms of Service</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <div className="prose prose-sm">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using ENOsecure ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.</p>

              <h2>2. Description of Service</h2>
              <p>ENOsecure is an AI-powered cybersecurity expert chatbot system designed for secure document management and intelligent information retrieval.</p>

              <h2>3. User Accounts</h2>
              <p>Users must register for an account to access the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

              <h2>4. Data Security and Privacy</h2>
              <p>We implement industry-standard security measures to protect your data. Your use of the Service is also governed by our Privacy Policy.</p>

              <h2>5. Acceptable Use</h2>
              <ul>
                <li>You may not use the Service for any illegal purposes</li>
                <li>You may not attempt to gain unauthorized access to any portion of the Service</li>
                <li>You may not interfere with or disrupt the Service</li>
                <li>You may not upload malicious content or attempt to compromise system security</li>
              </ul>

              <h2>6. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality are owned by ENOsecure and are protected by international copyright, trademark, and other intellectual property laws.</p>

              <h2>7. Termination</h2>
              <p>We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.</p>

              <h2>8. Limitation of Liability</h2>
              <p>ENOsecure shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>

              <h2>9. Changes to Terms</h2>
              <p>We reserve the right to modify or replace these Terms at any time. Material changes will be notified to users through the Service.</p>

              <h2>10. Contact Information</h2>
              <p>For any questions about these Terms, please contact us at support@enosecure.com</p>

              <p className="text-sm text-muted-foreground mt-8">Last updated: February 18, 2025</p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
