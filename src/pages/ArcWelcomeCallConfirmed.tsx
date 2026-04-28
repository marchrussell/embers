import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { FadeUp } from "@/components/FadeUp";

const ArcWelcomeCallConfirmed = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#050608" }}
    >
      <div className="mx-auto text-center" style={{ maxWidth: "640px" }}>
        <FadeUp>
          <h1
            className="mb-6 font-light"
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.15,
              color: "rgba(255,255,255,0.95)",
            }}
          >
            Your ARC Welcome Call Is Confirmed
          </h1>
        </FadeUp>

        <FadeUp delay={80}>
          <p
            className="mb-10"
            style={{
              fontSize: "clamp(17px, 2vw, 19px)",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Thank you for booking your call.
            <br />
            You'll receive an email shortly with your appointment time and link.
          </p>
        </FadeUp>

        <FadeUp delay={160}>
          <div className="mb-10 text-left">
            <h2
              className="mb-4 font-medium"
              style={{
                fontSize: "clamp(18px, 2vw, 20px)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              What to Expect
            </h2>
            <ul className="space-y-3">
              {[
                "A calm, honest conversation — not a sales pitch",
                "Space to share what you've been experiencing, at your own pace",
                "A clearer understanding of what your system has been carrying",
                "Whether the Rise ARC Method is the right next step for you — and if not, what might genuinely help",
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "clamp(16px, 1.8vw, 17px)",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.6,
                  }}
                >
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>

        <FadeUp delay={240}>
          <div className="mb-10 text-left">
            <p
              className="mb-3"
              style={{
                fontSize: "clamp(16px, 1.8vw, 17px)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              You don't need to prepare anything.
              <br />
              If you'd like, you can simply reflect on:
            </p>
            <ul className="space-y-2 pl-4">
              <li
                style={{
                  fontSize: "clamp(15px, 1.6vw, 16px)",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5,
                }}
              >
                • When do things feel most overwhelming, flat, or "not like you"?
              </li>
              <li
                style={{
                  fontSize: "clamp(15px, 1.6vw, 16px)",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5,
                }}
              >
                • What would feel different in six months if something real shifted?
              </li>
            </ul>
          </div>
        </FadeUp>

        <FadeUp delay={320}>
          <p
            className="mb-10 italic"
            style={{
              fontSize: "clamp(17px, 2vw, 19px)",
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            I'm looking forward to meeting you.
            <br />— March
          </p>
        </FadeUp>

        <FadeUp delay={400}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Return to Home <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeUp>
      </div>
    </div>
  );
};

export default ArcWelcomeCallConfirmed;
