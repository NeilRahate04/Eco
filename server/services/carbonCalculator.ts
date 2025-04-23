import Transport from '../models/Transport';

// Average carbon emissions per km for different transport modes (in grams CO2 per passenger per km)
const DEFAULT_CARBON_DATA = [
  {
    name: 'Train',
    type: 'rail',
    carbonPerKm: 14,
    description: 'Electric or diesel trains',
    icon: '🚂',
    colorClass: 'bg-blue-100 text-blue-800'
  },
  {
    name: 'Bus',
    type: 'bus',
    carbonPerKm: 68,
    description: 'Public transport buses',
    icon: '🚌',
    colorClass: 'bg-green-100 text-green-800'
  },
  {
    name: 'Car (Petrol)',
    type: 'car',
    carbonPerKm: 192,
    description: 'Average petrol car',
    icon: '🚗',
    colorClass: 'bg-red-100 text-red-800'
  },
  {
    name: 'Car (Electric)',
    type: 'car',
    carbonPerKm: 53,
    description: 'Electric vehicle',
    icon: '🚗',
    colorClass: 'bg-purple-100 text-purple-800'
  },
  {
    name: 'Plane (Short Haul)',
    type: 'air',
    carbonPerKm: 255,
    description: 'Flights under 3 hours',
    icon: '✈️',
    colorClass: 'bg-yellow-100 text-yellow-800'
  },
  {
    name: 'Bicycle',
    type: 'bike',
    carbonPerKm: 0,
    description: 'Zero emissions transport',
    icon: '🚲',
    colorClass: 'bg-emerald-100 text-emerald-800'
  }
];

export async function initializeTransportData() {
  try {
    const count = await Transport.countDocuments();
    if (count === 0) {
      await Transport.insertMany(DEFAULT_CARBON_DATA);
      console.log('Default transport data initialized');
    }
  } catch (error) {
    console.error('Error initializing transport data:', error);
  }
}

export async function calculateCarbonFootprint(
  distance: number,
  transportType: string,
  passengers: number = 1
): Promise<{
  transport: ITransport;
  totalEmissions: number;
  emissionsPerPassenger: number;
}> {
  const transport = await Transport.findOne({ type: transportType });
  
  if (!transport) {
    throw new Error(`Transport type ${transportType} not found`);
  }

  const emissionsPerPassenger = transport.carbonPerKm * distance;
  const totalEmissions = emissionsPerPassenger * passengers;

  return {
    transport,
    totalEmissions,
    emissionsPerPassenger
  };
}

export async function getAllTransportOptions() {
  return await Transport.find().sort({ carbonPerKm: 1 });
}

export async function compareTransportOptions(
  distance: number,
  passengers: number = 1
) {
  const transports = await getAllTransportOptions();
  
  return transports.map(transport => {
    const emissionsPerPassenger = transport.carbonPerKm * distance;
    const totalEmissions = emissionsPerPassenger * passengers;
    
    return {
      transport,
      totalEmissions,
      emissionsPerPassenger,
      savings: transports[0].carbonPerKm * distance * passengers - totalEmissions
    };
  });
} 