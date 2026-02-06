import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Bold, Italic } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder = "Enter text...", minHeight = "120px" }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isFocused) {
      editorRef.current.innerHTML = formatTextToHTML(value);
    }
  }, [value, isFocused]);

  const formatTextToHTML = (text: string): string => {
    if (!text) return "";
    
    // Convert markdown-style formatting to HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
      .replace(/\n/g, '<br>'); // line breaks
    
    return formatted;
  };

  const formatHTMLToText = (html: string): string => {
    if (!html) return "";
    
    // Convert HTML back to markdown-style
    let text = html
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<i>(.*?)<\/i>/g, '*$1*')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div>/g, '\n')
      .replace(/<\/div>/g, '')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n');
    
    return text.trim();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = formatHTMLToText(html);
      onChange(text);
    }
  };

  const applyFormat = (format: 'bold' | 'italic') => {
    document.execCommand(format === 'bold' ? 'bold' : 'italic', false);
    handleInput();
  };

  return (
    <div className="border border-[#E6DBC7]/20 rounded-md overflow-hidden bg-background/40 backdrop-blur-xl">
      <div className="flex gap-1 p-2 border-b border-[#E6DBC7]/20 bg-background/60">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('bold')}
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <Bold className="h-4 w-4 text-[#E6DBC7]" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('italic')}
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <Italic className="h-4 w-4 text-[#E6DBC7]" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="p-3 outline-none text-[#E6DBC7] overflow-y-auto"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(230, 219, 199, 0.4);
        }
      `}</style>
    </div>
  );
};

export const RichTextDisplay = ({ content }: { content: string | null }) => {
  if (!content) return <span className="text-[#E6DBC7]/40 italic">No notes yet</span>;

  const formatTextToHTML = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className="text-[#E6DBC7]/80 text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatTextToHTML(content) }}
    />
  );
};