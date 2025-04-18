import { Button } from "@/components/ui/button";

interface TransportOptionProps {
  transportType: string;
  name: string;
  icon: string;
  duration: string;
  carbonFootprint: number;
  colorClass: string;
  onSelect?: () => void;
}

const TransportOption = ({
  transportType,
  name,
  icon,
  duration,
  carbonFootprint,
  colorClass,
  onSelect
}: TransportOptionProps) => {
  // Map color class to tailwind classes
  const getColorClasses = (colorClass: string) => {
    switch (colorClass) {
      case 'success':
        return {
          border: 'border-success',
          bg: 'bg-success bg-opacity-10',
          text: 'text-success'
        };
      case 'warning':
        return {
          border: 'border-warning',
          bg: 'bg-warning bg-opacity-10',
          text: 'text-warning'
        };
      case 'error':
        return {
          border: 'border-error',
          bg: 'bg-error bg-opacity-10',
          text: 'text-error'
        };
      default:
        return {
          border: 'border-neutral',
          bg: 'bg-neutral bg-opacity-10',
          text: 'text-neutral'
        };
    }
  };

  const colors = getColorClasses(colorClass);

  return (
    <div className={`bg-white p-4 rounded-md shadow-sm border-l-4 ${colors.border}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center mb-3 sm:mb-0">
          <div className={`${colors.bg} p-2 rounded-full`}>
            <i className={`fas fa-${icon} ${colors.text} text-xl`}></i>
          </div>
          <div className="ml-3">
            <h4 className="font-heading font-medium text-neutral-darkest">{name}</h4>
            <span className="text-sm text-neutral-dark">{duration}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-6">
            <span className="block text-sm text-neutral-dark">Carbon per person</span>
            <span className={`font-semibold ${colors.text}`}>{carbonFootprint} kg CO2</span>
          </div>
          <Button 
            onClick={onSelect} 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransportOption;
