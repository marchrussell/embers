import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  inviteToken: string;
  programType: "diy" | "guided";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviteToken, programType }: InvitationEmailRequest = await req.json();

    const signupUrl = `${Deno.env.get("SUPABASE_URL")?.replace("/supabase", "")}/signup?invite=${inviteToken}`;
    
    const programName = programType === "guided" 
      ? "Guided Mentorship Program" 
      : "DIY Mentorship Program";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .header {
              background: linear-gradient(135deg, rgba(230,219,199,0.1) 0%, rgba(230,219,199,0.05) 100%);
              padding: 40px 30px;
              text-align: center;
              border-bottom: 1px solid rgba(230,219,199,0.2);
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 300;
              color: #E6DBC7;
              letter-spacing: 0.5px;
            }
            .content {
              padding: 40px 30px;
              background: rgba(0,0,0,0.3);
              backdrop-filter: blur(10px);
            }
            .greeting {
              font-size: 18px;
              color: #E6DBC7;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: rgba(255,255,255,0.8);
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .program-badge {
              display: inline-block;
              padding: 8px 16px;
              background: ${programType === "guided" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)"};
              border: 1px solid ${programType === "guided" ? "rgba(59, 130, 246, 0.3)" : "rgba(34, 197, 94, 0.3)"};
              border-radius: 20px;
              color: ${programType === "guided" ? "#93c5fd" : "#86efac"};
              font-size: 14px;
              font-weight: 500;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 16px 40px;
              background: rgba(255,255,255,0.05);
              backdrop-filter: blur(10px);
              color: white;
              text-decoration: none;
              border-radius: 50px;
              font-size: 16px;
              font-weight: 400;
              border: 2px solid white;
              transition: all 0.3s ease;
              margin: 20px 0;
            }
            .button:hover {
              background: rgba(255,255,255,0.1);
              transform: translateY(-2px);
            }
            .footer {
              padding: 30px;
              text-align: center;
              background: rgba(0,0,0,0.5);
              border-top: 1px solid rgba(230,219,199,0.1);
            }
            .footer p {
              margin: 5px 0;
              font-size: 14px;
              color: rgba(230,219,199,0.6);
            }
            .link-text {
              color: rgba(230,219,199,0.5);
              font-size: 12px;
              margin-top: 15px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Breath Aligned Sessions</h1>
            </div>
            <div class="content">
              <p class="greeting">You've been invited! ✨</p>
              <p class="message">
                You have been personally invited to join our exclusive mentorship program. 
                This is your gateway to transformative breathwork practices and personalized guidance.
              </p>
              <div class="program-badge">${programName}</div>
              <p class="message">
                Click the button below to create your account and begin your journey:
              </p>
              <div style="text-align: center;">
                <a href="${signupUrl}" class="button">Accept Invitation & Sign Up</a>
              </div>
              <p class="link-text">
                Or copy and paste this link into your browser:<br>
                ${signupUrl}
              </p>
            </div>
            <div class="footer">
              <p>This invitation link will expire in 30 days.</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Breath Aligned Sessions <onboarding@resend.dev>",
      to: [email],
      subject: `You're Invited to ${programName}`,
      html: emailHtml,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
