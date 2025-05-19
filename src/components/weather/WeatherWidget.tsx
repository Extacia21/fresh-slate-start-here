
import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudLightning, Thermometer, Wind, Droplets } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: React.ElementType;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate weather API fetch
    const timer = setTimeout(() => {
      setWeather({
        temp: 72,
        condition: "Partly Cloudy",
        humidity: 45,
        windSpeed: 8,
        description: "Partly cloudy with a chance of rain later",
        icon: Cloud
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-muted animate-pulse h-32 rounded-xl"></div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-secondary p-4 rounded-xl text-foreground">
        <p className="text-center">Weather data unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-xl text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <weather.icon className="h-10 w-10 mr-3" />
            <div>
              <h2 className="font-bold text-2xl">{weather.temp}°F</h2>
              <p className="text-sm opacity-90">{weather.condition}</p>
            </div>
          </div>
          <p className="text-sm mt-2 opacity-90">{weather.description}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-xs">
            <Wind className="h-3 w-3 mr-1" />
            <span>Wind: {weather.windSpeed} mph</span>
          </div>
          <div className="flex items-center text-xs">
            <Droplets className="h-3 w-3 mr-1" />
            <span>Humidity: {weather.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
