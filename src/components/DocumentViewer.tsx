import { FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface DocumentViewerProps {
  url: string;
  title: string;
  description?: string;
}

export const DocumentViewer = ({ url, title, description }: DocumentViewerProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b bg-card p-6">
          <div className="mb-2 flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-light">{title}</h2>
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        {/* PDF Viewer with formatted styling */}
        <div className="bg-background">
          <iframe src={url} className="min-h-[800px] w-full border-0" title={title} />
        </div>
      </CardContent>
    </Card>
  );
};
