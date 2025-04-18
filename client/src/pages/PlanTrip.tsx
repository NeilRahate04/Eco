import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchForm from "@/components/SearchForm";
import CarbonCalculator from "@/components/CarbonCalculator";
import TransportOption from "@/components/TransportOption";

const PlanTrip = () => {
  const [searchResults, setSearchResults] = useState<any | null>(null);

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-heading font-bold text-neutral-darkest mb-6">Plan Your Eco-Friendly Trip</h1>
      
      <Tabs defaultValue="search">
        <TabsList className="mb-6">
          <TabsTrigger value="search">Find Routes</TabsTrigger>
          <TabsTrigger value="calculate">Carbon Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-heading font-semibold mb-4">Search for Routes</h2>
                  <p className="text-neutral-dark mb-6">
                    Enter your starting point, destination, and travel date to find eco-friendly route options.
                  </p>
                  <SearchForm onSearchResults={handleSearchResults} />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {searchResults ? (
                    <div>
                      <h2 className="text-xl font-heading font-semibold mb-4">
                        Routes from {searchResults.from} to {searchResults.to}
                      </h2>
                      <p className="text-neutral-dark mb-6">
                        Travel date: {new Date(searchResults.date).toLocaleDateString()}
                      </p>
                      
                      <div className="space-y-4">
                        {searchResults.results.map((result: any, index: number) => (
                          <TransportOption
                            key={index}
                            transportType={result.option.type}
                            name={result.option.name}
                            icon={result.option.icon}
                            duration={`${Math.floor(result.durationMinutes / 60)} hours ${result.durationMinutes % 60} minutes`}
                            carbonFootprint={result.carbonFootprint}
                            colorClass={result.option.colorClass}
                          />
                        ))}
                      </div>
                      
                      <div className="mt-6 text-center">
                        <p className="text-sm text-neutral">
                          <i className="fas fa-info-circle mr-1"></i> 
                          Carbon calculations are estimates based on average emissions data.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="fas fa-route text-primary text-5xl mb-4"></i>
                      <h3 className="text-xl font-heading font-semibold mb-2">No Routes Selected</h3>
                      <p className="text-neutral-dark">
                        Search for routes using the form to see eco-friendly transportation options.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
