import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchForm from "@/components/SearchForm";
import CarbonCalculator from "@/components/CarbonCalculator";
import TransportOption from "@/components/TransportOption";
import RoutePlanner from "@/components/RoutePlanner";
import ItineraryPlanner from "@/components/ItineraryPlanner";

const PlanTrip = () => {
  const [searchResults, setSearchResults] = useState<any | null>(null);

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-heading font-bold text-neutral-darkest mb-6">Plan Your Eco-Friendly Trip</h1>
      
      <Tabs defaultValue="routes">
        <TabsList className="mb-6">
          <TabsTrigger value="routes">Find Routes</TabsTrigger>
          <TabsTrigger value="itinerary">Create Itinerary</TabsTrigger>
          <TabsTrigger value="calculate">Carbon Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="routes">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <RoutePlanner />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="itinerary">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <ItineraryPlanner />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calculate">
          <CarbonCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanTrip;
