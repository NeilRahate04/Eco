import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { carbonCalcSchema, type CarbonCalc } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import TransportOption from "./TransportOption";

const CarbonCalculator = () => {
  const [calculationResults, setCalculationResults] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const form = useForm<CarbonCalc>({
    resolver: zodResolver(carbonCalcSchema),
    defaultValues: {
      from: "San Francisco",
      to: "Los Angeles",
      passengers: 3
    }
  });

  const onSubmit = async (data: CarbonCalc) => {
    setIsCalculating(true);
    try {
      const response = await apiRequest("POST", "/api/calculate-carbon", data);
      const results = await response.json();
      setCalculationResults(results);
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: error instanceof Error ? error.message : "Failed to calculate carbon footprint",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-neutral-darkest mb-4">
            Calculate Your Travel Footprint
          </h2>
          <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
            Compare the environmental impact of different transportation methods for your journey.
          </p>
        </div>
        
        <Card className="bg-neutral-lightest shadow-md">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem className="col-span-3 md:col-span-1">
                        <FormLabel className="text-neutral-darkest text-sm font-medium">From</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem className="col-span-3 md:col-span-1">
                        <FormLabel className="text-neutral-darkest text-sm font-medium">To</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passengers"
                    render={({ field }) => (
                      <FormItem className="col-span-3 md:col-span-1">
                        <FormLabel className="text-neutral-darkest text-sm font-medium">Passengers</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select number of passengers" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md text-sm font-medium"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Calculating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calculator mr-2"></i> Calculate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Form>
            
            {calculationResults && (
              <div className="mt-8">
                <h3 className="font-heading font-semibold text-lg mb-4">Transport Options Comparison</h3>
                
                <div className="space-y-4">
                  {calculationResults.results.map((result: any, index: number) => (
                    <TransportOption
                      key={index}
                      transportType={result.transportOption.type}
                      name={result.transportOption.name}
                      icon={result.transportOption.icon}
                      duration={result.durationFormatted}
                      carbonFootprint={result.carbonFootprint}
                      colorClass={result.transportOption.colorClass}
                    />
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-neutral text-center">
                    <i className="fas fa-info-circle mr-1"></i> 
                    Carbon calculations are estimates based on average emissions data.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CarbonCalculator;
