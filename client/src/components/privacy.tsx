
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle>Privacy Policy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <div className="prose prose-sm">
              <h2>Introduction</h2>
              <p>This Privacy Policy explains how ENOsecure ("we", "us", or "our") collects, uses, and protects your information when you use our AI-powered cybersecurity expert chatbot system.</p>

              <h2>Information We Collect</h2>
              <h3>1. Account Information</h3>
              <ul>
                <li>Email address</li>
                <li>Name</li>
                <li>Password (encrypted)</li>
                <li>Organization details (if applicable)</li>
              </ul>

              <h3>2. Usage Data</h3>
              <ul>
                <li>Chat interactions</li>
                <li>Document uploads and modifications</li>
                <li>System access logs</li>
                <li>Feature usage statistics</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <ul>
                <li>To provide and maintain our Service</li>
                <li>To improve and personalize user experience</li>
                <li>To process and analyze chat interactions</li>
                <li>To detect and prevent security incidents</li>
                <li>To communicate with you about service updates</li>
              </ul>

              <h2>Data Security</h2>
              <p>We implement robust security measures to protect your data:</p>
              <ul>
                <li>End-to-end encryption for sensitive data</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data storage and transmission</li>
              </ul>

              <h2>Data Retention</h2>
              <p>We retain your data only for as long as necessary to provide our services and comply with legal obligations. You can request data deletion at any time.</p>

              <h2>Third-Party Services</h2>
              <p>We may use third-party services for:</p>
              <ul>
                <li>Cloud storage</li>
                <li>Analytics</li>
                <li>Authentication</li>
              </ul>
              <p>These services are carefully selected and required to maintain appropriate security standards.</p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request data deletion</li>
                <li>Export your data</li>
                <li>Opt-out of certain data processing</li>
              </ul>

              <h2>Changes to Privacy Policy</h2>
              <p>We may update this policy periodically. We will notify you of any material changes via email or through the Service.</p>

              <h2>Contact Us</h2>
              <p>For privacy-related questions or concerns, contact us at privacy@enosecure.com</p>

              <p className="text-sm text-muted-foreground mt-8">Last updated: February 18, 2025</p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
