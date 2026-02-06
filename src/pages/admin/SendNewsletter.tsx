import { AdminLayout } from "@/components/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, TestTube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SendNewsletter = () => {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const generatePreview = () => {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
        <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 24px;">${subject || "Your Subject Here"}</h1>
        ${content.split('\n').map(p => `<p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: 16px;">${p}</p>`).join('')}
        <p style="margin-top: 32px; font-size: 16px; color: #4a4a4a;">Kind regards,<br/><strong>March</strong></p>
        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            No longer want to receive these emails?<br/>
            <a href="#" style="color: #1a1a1a; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;
    setPreviewHtml(html);
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Please enter a test email address");
      return;
    }

    if (!subject.trim() || !content.trim()) {
      toast.error("Please fill in subject and content");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          subject,
          content,
          preheader,
          testEmail,
        },
      });

      if (error) throw error;

      toast.success(`Test email sent to ${testEmail}`);
    } catch (error: any) {
      console.error("Error sending test:", error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Please fill in subject and content");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to send this newsletter to all active subscribers? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          subject,
          content,
          preheader,
        },
      });

      if (error) throw error;

      toast.success(data.message || "Newsletter sent successfully!");
      
      setSubject("");
      setPreheader("");
      setContent("");
      setTestEmail("");
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      toast.error(error.message || "Failed to send newsletter");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Send Newsletter"
      description="Compose and send newsletters to subscribers"
    >
      <Alert className="mb-8 bg-white/5 border-white/20">
        <Mail className="h-5 w-5 text-[#E6DBC7]" />
        <AlertDescription className="text-white/70">
          All newsletters automatically include an unsubscribe link at the bottom.
          Test your email before sending to all subscribers.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="compose" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">Compose</TabsTrigger>
          <TabsTrigger value="preview" onClick={generatePreview} className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
            <CardHeader>
              <CardTitle className="text-[#E6DBC7] text-xl">Newsletter Content</CardTitle>
              <CardDescription className="text-white/60">
                Write your newsletter content in plain text. Paragraphs will be formatted automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white/80">Subject Line *</Label>
                <Input
                  id="subject"
                  placeholder="Your newsletter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preheader" className="text-white/80">Preheader Text (Optional)</Label>
                <Input
                  id="preheader"
                  placeholder="Brief preview text that appears in inbox..."
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-base"
                />
                <p className="text-xs text-white/50">
                  This text appears next to the subject line in email clients
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white/80">Newsletter Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your newsletter content here... Each paragraph should be on a new line."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] bg-white/5 border-white/20 text-white placeholder:text-white/40 text-base"
                />
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail" className="text-white/80">Test Email Address</Label>
                  <div className="flex gap-3">
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-base"
                    />
                    <Button
                      onClick={handleSendTest}
                      disabled={isLoading}
                      variant="outline"
                      className="whitespace-nowrap gap-2 border-white/20 text-white hover:bg-white/10"
                    >
                      <TestTube className="h-5 w-5" />
                      Send Test
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSendNewsletter}
                  disabled={isLoading}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Send className="h-5 w-5" />
                  {isLoading ? "Sending..." : "Send Newsletter to All Subscribers"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
            <CardHeader>
              <CardTitle className="text-[#E6DBC7] text-xl">Email Preview</CardTitle>
              <CardDescription className="text-white/60">
                This is an approximate preview. Send a test email for the exact rendering.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewHtml ? (
                <div 
                  className="border border-white/20 rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="text-white/60 text-center py-12">
                  Fill in the content and click "Preview" to see how your email will look
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default SendNewsletter;
