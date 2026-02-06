import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface DocumentViewerProps {
  url: string;
  title: string;
  description?: string;
}

export const DocumentViewer = ({ url, title, description }: DocumentViewerProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-card p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-light">{title}</h2>
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        
        {/* PDF Viewer with formatted styling */}
        <div className="bg-background">
          <iframe
            src={url}
            className="w-full min-h-[800px] border-0"
            title={title}
          />
        </div>
      </CardContent>
    </Card>
  );
};
