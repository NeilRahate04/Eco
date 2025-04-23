import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OPENROUTE_API_KEY = "5b3ce3597851110001cf6248aa02e6e4876e416eb6773831684020c6";
const OPENROUTE_API_URL = "https://api.openrouteservice.org/v2/directions";

const formSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
});

type FormData = z.infer<typeof formSchema>;

interface Route {
  mode: string;
  distance: number;
  duration: number;
  carbonEmissions: number;
  geometry: string;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

const RoutePlanner = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const geocodeLocation = async (location: string): Promise<[number, number]> => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${OPENROUTE_API_KEY}&text=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.features?.[0]?.geometry?.coordinates) {
        throw new Error(`Could not find coordinates for location: ${location}`);
      }

      return data.features[0].geometry.coordinates;
    } catch (error) {
      console.error("Error geocoding location:", error);
      throw new Error(`Failed to find coordinates for: ${location}`);
    }
  };

  const getRoutes = async (source: string, destination: string) => {
    try {
      const [startCoords, endCoords] = await Promise.all([
        geocodeLocation(source),
        geocodeLocation(destination)
      ]);

      // Define transport modes and their carbon emissions (grams per km)
      const transportModes = [
        { mode: 'driving-car', label: 'Car', emissions: 192 },
        { mode: 'cycling-regular', label: 'Bicycle', emissions: 0 },
        { mode: 'foot-walking', label: 'Walking', emissions: 0 },
      ];

      const routePromises = transportModes.map(async ({ mode, label, emissions }) => {
        const response = await fetch(
          `${OPENROUTE_API_URL}/${mode}?api_key=${OPENROUTE_API_KEY}&start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`
        );

        if (!response.ok) {
          throw new Error(`OpenRoute API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.features?.[0]?.properties?.segments?.[0]) {
          throw new Error(`Could not calculate route for ${label}`);
        }

        const distance = data.features[0].properties.segments[0].distance / 1000; // Convert to km
        const duration = data.features[0].properties.segments[0].duration / 60; // Convert to minutes
        const carbonEmissions = emissions * distance;

        // Only include routes that are practical
        if (
          (mode === 'cycling-regular' && distance <= 50) || // Cycling up to 50km
          (mode === 'foot-walking' && distance <= 10) || // Walking up to 10km
          mode === 'driving-car' // Always include driving
        ) {
          return {
            mode: label,
            distance,
            duration,
            carbonEmissions,
            geometry: data.features[0].geometry,
            steps: data.features[0].properties.segments[0].steps.map((step: any) => ({
              instruction: step.instruction,
              distance: step.distance / 1000,
              duration: step.duration / 60,
            })),
          };
        }
        return null;
      });

      const results = await Promise.all(routePromises);
      const validRoutes = results.filter((route): route is Route => route !== null);
      
      // Sort routes by carbon emissions
      validRoutes.sort((a, b) => a.carbonEmissions - b.carbonEmissions);
      
      return validRoutes;
    } catch (error) {
      console.error("Error calculating routes:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to calculate routes");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setRoutes([]);
    
    try {
      const calculatedRoutes = await getRoutes(data.source, data.destination);
      setRoutes(calculatedRoutes);
      toast.success("Routes calculated successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to calculate routes";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="source">From</Label>
            <Input
              id="source"
              {...register("source")}
              placeholder="Enter source location (e.g., New York, NY)"
              disabled={isLoading}
            />
            {errors.source && (
              <p className="text-sm text-red-500">{errors.source.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="destination">To</Label>
            <Input
              id="destination"
              {...register("destination")}
              placeholder="Enter destination (e.g., Los Angeles, CA)"
              disabled={isLoading}
            />
            {errors.destination && (
              <p className="text-sm text-red-500">{errors.destination.message}</p>
            )}
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Calculating..." : "Find Eco-Friendly Routes"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              reset();
              setRoutes([]);
              setError(null);
            }}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>

      {routes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Eco-Friendly Route Options</h3>
          <div className="grid gap-4">
            {routes.map((route, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{route.mode}</span>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {index === 0 ? "Most Eco-Friendly" : "Alternative"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance:</span>
                      <span>{route.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{Math.round(route.duration)} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carbon Emissions:</span>
                      <span>{route.carbonEmissions.toFixed(1)} g CO₂</span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Route Steps:</h4>
                      <div className="space-y-1">
                        {route.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="text-sm">
                            {step.instruction} ({step.distance.toFixed(1)} km, {Math.round(step.duration)} min)
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner; 