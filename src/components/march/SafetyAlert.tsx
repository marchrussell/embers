import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CRISIS_RESOURCES } from "@/lib/marchSafety";

interface SafetyAlertProps {
  isHighRisk?: boolean;
}

export const SafetyAlert = ({ isHighRisk = false }: SafetyAlertProps) => {
  return (
    <Alert variant={isHighRisk ? "destructive" : "default"} className="my-4 border-2">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold mb-2">
        {isHighRisk ? "Immediate Support Available" : "You're Not Alone"}
      </AlertTitle>
      <AlertDescription className="space-y-4">
        <p className="text-sm">
          {isHighRisk 
            ? "I'm really concerned about what you've shared. Your safety is the most important thing right now. Please reach out to someone who can offer immediate support:"
            : "I'm sorry you're going through this. March is here for your wellbeing journey, but professional support may be helpful right now."}
        </p>
        
        <div className="space-y-2 bg-background/50 p-4 rounded-lg">
          {CRISIS_RESOURCES.map((resource, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              {resource.phone && <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />}
              {resource.text && <Heart className="h-4 w-4 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <p className="font-semibold">{resource.name}</p>
                {resource.phone && (
                  <a href={`tel:${resource.phone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                    {resource.phone}
                  </a>
                )}
                {resource.text && <p className="text-muted-foreground">{resource.text}</p>}
                <p className="text-xs text-muted-foreground">{resource.availability}</p>
              </div>
            </div>
          ))}
        </div>
        
        {isHighRisk && (
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => window.location.href = 'tel:999'}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call Emergency Services (999)
          </Button>
        )}
        
        {!isHighRisk && (
          <p className="text-xs text-muted-foreground mt-4">
            Is there anything else I can help you with today in terms of your wellbeing goals or practice?
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
