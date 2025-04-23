import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TransportOptionProps {
  transportType: string;
  name: string;
  icon: string;
  carbonFootprint: number;
  colorClass: string;
  savings?: number;
}

const TransportOption = ({
  transportType,
  name,
  icon,
  carbonFootprint,
  colorClass,
  savings
}: TransportOptionProps) => {
  const formatCarbon = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)} kg`;
    }
    return `${grams.toFixed(0)} g`;
  };

  return (
    <Card className={cn("overflow-hidden", colorClass)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h4 className="font-medium">{name}</h4>
              <p className="text-sm text-muted-foreground">{transportType}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold">{formatCarbon(carbonFootprint)} CO₂</div>
            {savings !== undefined && savings > 0 && (
              <div className="text-sm text-green-600">
                Saves {formatCarbon(savings)} CO₂
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransportOption;
