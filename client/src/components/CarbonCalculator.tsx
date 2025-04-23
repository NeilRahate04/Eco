import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import TransportOption from "./TransportOption";

const OPENROUTE_API_KEY = "5b3ce3597851110001cf6248aa02e6e4876e416eb6773831684020c6";
const OPENROUTE_API_URL = "https://api.openrouteservice.org/geocode/search";
const OPENROUTE_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

// Carbon emissions in grams per passenger per kilometer
const CARBON_EMISSIONS = {
  car: 192, // Average car emissions
  bus: 68,  // Average bus emissions
  train: 41, // Average train emissions
  plane: 285, // Average short-haul flight emissions
  motorcycle: 103, // Average motorcycle emissions
  bicycle: 0, // No direct emissions
  walking: 0, // No direct emissions
};

const formSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  passengers: z.number().min(1, "At least 1 passenger is required").max(100, "Maximum 100 passengers allowed"),
});

type FormData = z.infer<typeof formSchema>;

interface TransportOption {
  name: string;
  type: string;
  carbonPerKm: number;
  icon: string;
  colorClass: string;
}

interface CalculationResult {
  transportOption: TransportOption;
  totalEmissions: number;
  savings: number;
}

interface OpenRouteGeocodeResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      label: string;
    };
  }>;
}

interface OpenRouteDirectionsResponse {
  features: Array<{
    properties: {
      segments: Array<{
        distance: number; // distance in meters
      }>;
    };
  }>;
}

const CarbonCalculator = () => {
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: 1,
    },
  });

  useEffect(() => {
    // Initialize transport options with default values
    setTransportOptions([
      {
        name: "Car",
        type: "car",
        carbonPerKm: CARBON_EMISSIONS.car,
        icon: "🚗",
        colorClass: "bg-blue-100",
      },
      {
        name: "Bus",
        type: "bus",
        carbonPerKm: CARBON_EMISSIONS.bus,
        icon: "🚌",
        colorClass: "bg-green-100",
      },
      {
        name: "Train",
        type: "train",
        carbonPerKm: CARBON_EMISSIONS.train,
        icon: "🚂",
        colorClass: "bg-red-100",
      },
      {
        name: "Plane",
        type: "plane",
        carbonPerKm: CARBON_EMISSIONS.plane,
        icon: "✈️",
        colorClass: "bg-purple-100",
      },
      {
        name: "Motorcycle",
        type: "motorcycle",
        carbonPerKm: CARBON_EMISSIONS.motorcycle,
        icon: "🏍️",
        colorClass: "bg-yellow-100",
      },
      {
        name: "Bicycle",
        type: "bicycle",
        carbonPerKm: CARBON_EMISSIONS.bicycle,
        icon: "🚲",
        colorClass: "bg-teal-100",
      },
    ]);
  }, []);

  const geocodeLocation = async (location: string): Promise<[number, number]> => {
    try {
      const response = await fetch(
        `${OPENROUTE_API_URL}?api_key=${OPENROUTE_API_KEY}&text=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data: OpenRouteGeocodeResponse = await response.json();
      
      if (!data.features?.[0]?.geometry?.coordinates) {
        throw new Error(`Could not find coordinates for location: ${location}`);
      }

      return data.features[0].geometry.coordinates;
    } catch (error) {
      console.error("Error geocoding location:", error);
      throw new Error(`Failed to find coordinates for: ${location}`);
    }
  };

  const getDistance = async (source: string, destination: string): Promise<number> => {
    try {
      const [startCoords, endCoords] = await Promise.all([
        geocodeLocation(source),
        geocodeLocation(destination)
      ]);

      const response = await fetch(
        `${OPENROUTE_DIRECTIONS_URL}?api_key=${OPENROUTE_API_KEY}&start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRoute API error: ${errorData.error?.message || response.status}`);
      }

      const data: OpenRouteDirectionsResponse = await response.json();
      
      if (!data.features?.[0]?.properties?.segments?.[0]?.distance) {
        throw new Error("Could not calculate distance between locations");
      }

      return data.features[0].properties.segments[0].distance / 1000;
    } catch (error) {
      console.error("Error calculating distance:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to calculate distance between locations");
    }
  };

  const calculateCarbonFootprint = (distance: number, passengers: number) => {
    const results: CalculationResult[] = transportOptions.map(option => {
      const totalEmissions = option.carbonPerKm * distance * passengers;
      const highestEmissions = Math.max(...transportOptions.map(o => o.carbonPerKm * distance * passengers));
      const savings = highestEmissions - totalEmissions;

      return {
        transportOption: option,
        totalEmissions,
        savings,
      };
    });

    // Sort by emissions (lowest first)
    return results.sort((a, b) => a.totalEmissions - b.totalEmissions);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.source || !data.destination || !data.passengers) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDistance(null);
    
    try {
      const calculatedDistance = await getDistance(data.source, data.destination);
      setDistance(calculatedDistance);
      
      const results = calculateCarbonFootprint(calculatedDistance, data.passengers);
      setCalculationResults(results);
      toast.success("Carbon footprint calculated successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to calculate carbon footprint";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error calculating carbon footprint:", error);
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
        <div>
          <Label htmlFor="passengers">Number of Passengers</Label>
          <Input
            id="passengers"
            type="number"
            min="1"
            max="100"
            {...register("passengers", { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.passengers && (
            <p className="text-sm text-red-500">{errors.passengers.message}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Calculating..." : "Calculate Carbon Footprint"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              reset();
              setCalculationResults([]);
              setError(null);
              setDistance(null);
            }}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>

      {distance !== null && (
        <div className="text-center text-muted-foreground">
          Distance: {distance.toFixed(1)} km
        </div>
      )}

      {calculationResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Carbon Footprint Results</h3>
          <div className="grid gap-4">
            {calculationResults.map((result) => (
              <TransportOption
                key={result.transportOption.type}
                transportType={result.transportOption.type}
                name={result.transportOption.name}
                icon={result.transportOption.icon}
                carbonFootprint={result.totalEmissions}
                colorClass={result.transportOption.colorClass}
                savings={result.savings}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonCalculator;
