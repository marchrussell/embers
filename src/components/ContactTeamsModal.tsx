import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

interface ContactTeamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactTeamsModal = ({
  open,
  onOpenChange
}: ContactTeamsModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    teamSize: "",
    supportType: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.email || !formData.phone || !formData.teamSize || !formData.supportType || !formData.message) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const messageBody = [
        `Company: ${formData.company}`,
        `Phone: ${formData.phone}`,
        `Team Size: ${formData.teamSize}`,
        `Type of Support: ${formData.supportType}`,
        `\nMessage:\n${formData.message.trim()}`
      ].join('\n');

      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          message: messageBody,
          type: 'contact'
        }
      });

      if (error) throw error;

      setShowSuccess(true);
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        teamSize: "",
        supportType: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  const inputStyle = {
    width: '100%',
    height: '48px',
    fontSize: '15px',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.92)',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '0 16px',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: '6px',
    letterSpacing: '0.02em'
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        hideClose
        className="w-[94%] sm:w-[90%] max-w-[740px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto p-0 border border-white/20 bg-black/80 backdrop-blur-xl rounded-[28px] scrollbar-hide"
      >
        {/* Close Button - X icon */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 sm:right-8 sm:top-8 md:right-10 md:top-10 z-50 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        {showSuccess ? (
          /* Success State */
          <div className="px-6 py-14 sm:px-10 sm:py-16 md:px-14 md:py-20 text-center">
            <DialogTitle 
              className="font-editorial" 
              style={{
                fontSize: '28px',
                lineHeight: 1.3,
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: '16px'
              }}
            >
              Thank you — we'll be in touch shortly.
            </DialogTitle>
            <p style={{
              fontSize: '15px',
              lineHeight: 1.6,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '400px',
              margin: '0 auto 28px auto'
            }}>
              I'll read your message personally and respond within 24 hours.
            </p>
            <button 
              onClick={handleClose} 
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          /* Form State */
          <div className="px-6 pt-14 pb-10 sm:px-10 sm:pt-16 md:px-14 md:pt-20 md:pb-12">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }} className="sm:mb-8">
              <DialogTitle
                className="font-editorial text-2xl sm:text-3xl md:text-[32px]"
                style={{
                  lineHeight: 1.25,
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: '14px'
                }}
              >
                Start The Conversation
              </DialogTitle>
              <p className="text-sm sm:text-[15px]" style={{
                lineHeight: 1.65,
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.68)',
                maxWidth: '480px',
                margin: '0 auto'
              }}>
                A short conversation to understand what your team is navigating and clarify what kind of support — if any — would be most appropriate right now.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Name & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="teams-name" style={labelStyle}>Name</label>
                  <input
                    id="teams-name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    style={inputStyle}
                    className="placeholder:text-[rgba(255,255,255,0.35)] focus:border-[rgba(255,255,255,0.25)] focus:bg-[rgba(255,255,255,0.06)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                  />
                </div>
                <div>
                  <label htmlFor="teams-company" style={labelStyle}>Company</label>
                  <input
                    id="teams-company"
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                    style={inputStyle}
                    className="placeholder:text-[rgba(255,255,255,0.35)] focus:border-[rgba(255,255,255,0.25)] focus:bg-[rgba(255,255,255,0.06)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="teams-email" style={labelStyle}>Email</label>
                  <input
                    id="teams-email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    style={inputStyle}
                    className="placeholder:text-[rgba(255,255,255,0.35)] focus:border-[rgba(255,255,255,0.25)] focus:bg-[rgba(255,255,255,0.06)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                  />
                </div>
                <div>
                  <label htmlFor="teams-phone" style={labelStyle}>Phone</label>
                  <input
                    id="teams-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Your phone number"
                    style={inputStyle}
                    className="placeholder:text-[rgba(255,255,255,0.35)] focus:border-[rgba(255,255,255,0.25)] focus:bg-[rgba(255,255,255,0.06)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                  />
                </div>
              </div>

              {/* Team Size & Type of Support */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="teams-size" style={labelStyle}>Team Size</label>
                  <select
                    id="teams-size"
                    value={formData.teamSize}
                    onChange={e => setFormData({ ...formData, teamSize: e.target.value })}
                    style={{
                      ...inputStyle,
                      color: formData.teamSize ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.35)',
                      cursor: 'pointer',
                    }}
                    className="focus:border-[rgba(255,255,255,0.25)] focus:bg-[rgba(255,255,255,0.06)]"
                  >
                    <option value="" disabled>Select team size</option>
                    <option value="1-5">1–5</option>
                    <option value="6-10">6–10</option>
                    <option value="11-25">11–25</option>
                    <option value="26-50">26–50</option>
                    <option value="51-100">51–100</option>
                    <option value="100+">100+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="teams-support" style={labelStyle}>Type of Support</label>
                  <select
                    id="teams-support"
                    value={formData.supportType}
                    onChange={e => setFormData({ ...formData, supportType: e.target.value })}
                    style={{
                      ...inputStyle,
                      color: formData.supportType ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.35)',
                      cursor: 'pointer',
                    }}
                    className="focus:border-[rgba(255,255,255,0.25)] focus:bg-[rgba(255,255,255,0.06)]"
                  >
                    <option value="" disabled>Select support type</option>
                    <option value="arc-workplace">ARC Workplace Program</option>
                    <option value="march-labs">March Labs for Teams</option>
                    <option value="custom-workshops">Custom Workshops</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                </div>
              </div>

              {/* Message (Required) */}
              <div className="mb-6">
                <label htmlFor="teams-message" style={labelStyle}>Message</label>
                <textarea
                  id="teams-message"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="If helpful, share a few words about what's bringing you here."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.92)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.55,
                    transition: 'all 0.2s ease'
                  }}
                  className="placeholder:text-[rgba(255,255,255,0.35)] focus:border-[rgba(255,255,255,0.25)] focus:bg-[rgba(255,255,255,0.06)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                />
              </div>

              {/* CTA Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Primary CTA */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:scale-[1.01]"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '15px',
                    fontWeight: 500,
                    padding: '0 32px',
                    letterSpacing: '0.01em',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: 'rgba(0, 0, 0, 0.88)',
                    borderRadius: '9999px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                    height: '52px'
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"} 
                  {!isSubmitting && <ArrowRight style={{ width: '16px', height: '16px' }} />}
                </Button>

                {/* Secondary text link */}
                <button
                  type="button"
                  onClick={() => window.open('https://calendly.com/march-marchrussell/arc-resilience-leadership-for-teams-discovery-call', '_blank')}
                  className="transition-colors hover:text-white/80"
                  style={{
                    marginTop: '20px',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.02em',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Prefer to book a call directly?
                </button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
