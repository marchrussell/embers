import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, CheckCircle } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const NewsletterUnsubscribe = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Check if the email exists in newsletter subscribers
      const { data: subscriber, error: fetchError } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (fetchError || !subscriber) {
        toast.error("Email address not found in our newsletter list");
        setIsLoading(false);
        return;
      }

      // If already inactive, inform the user
      if (!subscriber.active) {
        toast.info("This email is already unsubscribed from our newsletter");
        setIsUnsubscribed(true);
        setIsLoading(false);
        return;
      }

      // Update the subscriber status to inactive
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({ active: false })
        .eq("email", email.toLowerCase());

      if (updateError) throw updateError;

      setIsUnsubscribed(true);
      toast.success("You have been successfully unsubscribed from our newsletter");
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe. Please try again or contact support");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-lg">
          <Card className="bg-card/50 backdrop-blur-xl border-border/40 shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-8">
              {isUnsubscribed ? (
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-500/10 p-6">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <Mail className="h-12 w-12 text-primary" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <CardTitle className="text-3xl md:text-4xl font-editorial text-foreground">
                  {isUnsubscribed ? "You're Unsubscribed" : "Unsubscribe from Newsletter"}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground max-w-md mx-auto">
                  {isUnsubscribed
                    ? "You've been removed from our mailing list and won't receive any more newsletters from us."
                    : "We're sorry to see you go. Enter your email below to unsubscribe from our newsletter."}
                </CardDescription>
              </div>
            </CardHeader>

            {!isUnsubscribed && (
              <CardContent className="space-y-6 px-6 md:px-8 pb-8">
                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-background/60 border-border/60 focus:border-primary text-base"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? "Unsubscribing..." : "Unsubscribe"}
                  </Button>
                </form>
                <p className="text-sm text-center text-muted-foreground/80 pt-2">
                  You can resubscribe anytime from our website. We'd love to have you back.
                </p>
              </CardContent>
            )}

            {isUnsubscribed && (
              <CardContent className="text-center space-y-6 px-6 md:px-8 pb-8">
                <p className="text-sm text-muted-foreground">
                  Thank you for being part of our community. If you change your mind, we'll be here.
                </p>
                <Button
                  onClick={() => window.location.href = "/"}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8"
                >
                  Return to Home
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewsletterUnsubscribe;
