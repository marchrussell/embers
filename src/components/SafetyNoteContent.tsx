import { Link } from "react-router-dom";

const LINK_PHRASES = ["full HŌM Safety Information", "Safety Disclosure"];

const SUBTITLE_LINES = [
  "Before You Begin",
  "Do not practice this session if you have:",
  "Additionally, only practice if you:",
];

const linkRegex = new RegExp(
  `(${LINK_PHRASES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g"
);

interface SafetyNoteContentProps {
  text: string;
  /** If provided, renders safety link phrases as a button calling this handler.
   *  If omitted, renders them as a <Link> to /safety-disclosure. */
  onSafetyLinkClick?: () => void;
}

export const SafetyNoteContent = ({ text, onSafetyLinkClick }: SafetyNoteContentProps) => {
  const renderInline = (line: string, keyPrefix: string) =>
    line.split(linkRegex).map((part, i) => {
      if (!LINK_PHRASES.includes(part)) return <span key={`${keyPrefix}-${i}`}>{part}</span>;
      if (onSafetyLinkClick) {
        return (
          <button
            key={`${keyPrefix}-${i}`}
            onClick={(e) => {
              e.preventDefault();
              onSafetyLinkClick();
            }}
            className="font-bold underline transition-colors hover:opacity-80"
          >
            {part}
          </button>
        );
      }
      return (
        <Link
          key={`${keyPrefix}-${i}`}
          to="/safety-disclosure"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline transition-colors hover:opacity-80"
        >
          {part}
        </Link>
      );
    });

  return (
    <>
      {text.split(/\n\n/).map((block, bIdx) => {
        const lines = block.split(/\n/);
        const trimmed = block.trim();

        // Standalone subtitle line → bold heading
        if (lines.length === 1 && SUBTITLE_LINES.includes(trimmed)) {
          return (
            <p key={bIdx} className="mb-4 font-semibold last:mb-0">
              {trimmed}
            </p>
          );
        }

        // Block containing bullet items (• or -)
        const hasBullets = lines.some((l) => /^[•\-] /.test(l));
        if (hasBullets) {
          const headerLines = lines.filter((l) => !/^[•\-]/.test(l));
          const bulletLines = lines.filter((l) => /^[•\-]/.test(l));
          return (
            <div key={bIdx} className="mb-4 last:mb-0">
              {headerLines.map((hl, i) => (
                <p key={i} className="mb-1 font-semibold">
                  {renderInline(hl, `${bIdx}-h-${i}`)}
                </p>
              ))}
              <ul className="space-y-1 pl-5">
                {bulletLines.map((bl, i) => (
                  <li key={i} className="list-disc">
                    {renderInline(bl.replace(/^[•\-]\s/, ""), `${bIdx}-b-${i}`)}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={bIdx} className="mb-4 leading-relaxed last:mb-0">
            {lines.map((line, lIdx, arr) => (
              <span key={lIdx}>
                {renderInline(line, `${bIdx}-${lIdx}`)}
                {lIdx < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
};
