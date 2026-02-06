import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ArcWelcomeCallConfirmed = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: '#050608' }}
    >
      <div className="text-center mx-auto" style={{ maxWidth: '640px' }}>
        
        {/* Headline */}
        <h1 
          className="font-light mb-6"
          style={{ 
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.15,
            color: 'rgba(255,255,255,0.95)'
          }}
        >
          Your ARC Welcome Call Is Confirmed
        </h1>
        
        {/* Short paragraph */}
        <p 
          className="mb-10"
          style={{ 
            fontSize: 'clamp(17px, 2vw, 19px)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          Thank you for booking your call.<br />
          You'll receive an email shortly with your appointment time and link.
        </p>
        
        {/* What to expect */}
        <div className="text-left mb-10">
          <h2 
            className="font-medium mb-4"
            style={{ 
              fontSize: 'clamp(18px, 2vw, 20px)',
              color: 'rgba(255,255,255,0.9)'
            }}
          >
            What to Expect
          </h2>
          <ul className="space-y-3">
            {[
              "A calm, honest conversation — not a sales pitch",
              "Space to share what you've been experiencing, at your own pace",
              "A clearer understanding of what your system has been carrying",
              "Whether the Rise ARC Method is the right next step for you — and if not, what might genuinely help"
            ].map((item, i) => (
              <li 
                key={i}
                style={{ 
                  fontSize: 'clamp(16px, 1.8vw, 17px)', 
                  color: 'rgba(255,255,255,0.8)', 
                  lineHeight: 1.6 
                }}
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Prep note */}
        <div className="text-left mb-10">
          <p 
            className="mb-3"
            style={{ 
              fontSize: 'clamp(16px, 1.8vw, 17px)',
              color: 'rgba(255,255,255,0.75)'
            }}
          >
            You don't need to prepare anything.<br />
            If you'd like, you can simply reflect on:
          </p>
          <ul className="space-y-2 pl-4">
            <li 
              style={{ 
                fontSize: 'clamp(15px, 1.6vw, 16px)', 
                color: 'rgba(255,255,255,0.7)', 
                lineHeight: 1.5 
              }}
            >
              • When do things feel most overwhelming, flat, or "not like you"?
            </li>
            <li 
              style={{ 
                fontSize: 'clamp(15px, 1.6vw, 16px)', 
                color: 'rgba(255,255,255,0.7)', 
                lineHeight: 1.5 
              }}
            >
              • What would feel different in six months if something real shifted?
            </li>
          </ul>
        </div>
        
        {/* Closing line */}
        <p 
          className="italic mb-10"
          style={{ 
            fontSize: 'clamp(17px, 2vw, 19px)',
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.65)'
          }}
        >
          I'm looking forward to meeting you.<br />
          — March
        </p>
        
        {/* Secondary CTA */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{ 
            fontSize: '15px', 
            color: 'rgba(255,255,255,0.5)' 
          }}
        >
          Return to Home <ArrowRight className="w-4 h-4" />
        </Link>
        
      </div>
    </div>
  );
};

export default ArcWelcomeCallConfirmed;
