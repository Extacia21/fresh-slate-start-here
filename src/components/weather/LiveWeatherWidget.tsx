
import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudLightning, Sun, Wind, Droplets } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  highTemp: number;
  lowTemp: number;
  description: string;
  icon: React.ElementType;
  warnings: string[];
}

const LiveWeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getWeatherIcon = (condition: string) => {
    const conditions = condition.toLowerCase();
    if (conditions.includes('rain') || conditions.includes('shower')) {
      return CloudRain;
    } else if (conditions.includes('thunder') || conditions.includes('storm')) {
      return CloudLightning;
    } else if (conditions.includes('clear') || conditions.includes('sunny')) {
      return Sun;
    } else {
      return Cloud;
    }
  };

  useEffect(() => {
    // Simulate fetching weather data for Chinhoyi, Zimbabwe
    const fetchWeatherForChinhoyi = async () => {
      setIsLoading(true);
      
      // This would be an actual API call in production
      // For now we're simulating the data
      setTimeout(() => {
        // Generate random but realistic weather for Chinhoyi (Zimbabwe has a warm climate)
        const conditions = ["Partly Cloudy", "Mostly Sunny", "Clear", "Light Rain", "Scattered Showers"];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        // Zimbabwe's temperature typically ranges between 20-30°C
        const baseTemp = 22 + Math.floor(Math.random() * 8);
        
        // Generate random warnings based on the condition
        let warnings: string[] = [];
        if (randomCondition.includes("Rain")) {
          warnings.push("Periodic rainfall expected throughout the day");
        } else if (randomCondition === "Clear") {
          warnings.push("High UV index expected, use sun protection");
        }
        
        setWeather({
          temp: baseTemp,
          highTemp: baseTemp + 2 + Math.floor(Math.random() * 3),
          lowTemp: baseTemp - 2 - Math.floor(Math.random() * 3),
          condition: randomCondition,
          humidity: 40 + Math.floor(Math.random() * 30),
          windSpeed: 2 + Math.floor(Math.random() * 8),
          description: `${randomCondition} in Chinhoyi, Zimbabwe`,
          icon: getWeatherIcon(randomCondition),
          warnings: warnings
        });
        
        setIsLoading(false);
      }, 1000);
    };

    fetchWeatherForChinhoyi();
    
    // Update weather every 30 minutes
    const intervalId = setInterval(fetchWeatherForChinhoyi, 1800000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-muted animate-pulse h-32 rounded-xl"></div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-secondary p-4 rounded-xl text-foreground">
        <p className="text-center">Weather data unavailable for Chinhoyi</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-xl text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium mb-1">Chinhoyi, Zimbabwe</span>
          <div className="flex items-center">
            <weather.icon className="h-10 w-10 mr-3" />
            <div>
              <h2 className="font-bold text-2xl">{weather.temp}°C</h2>
              <p className="text-sm opacity-90">{weather.condition}</p>
            </div>
          </div>
          <p className="text-sm mt-2 opacity-90">{weather.description}</p>
          <p className="text-xs mt-1">High: {weather.highTemp}°C | Low: {weather.lowTemp}°C</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-xs">
            <Wind className="h-3 w-3 mr-1" />
            <span>Wind: {weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center text-xs">
            <Droplets className="h-3 w-3 mr-1" />
            <span>Humidity: {weather.humidity}%</span>
          </div>
        </div>
      </div>
      
      {weather.warnings.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/20">
          <p className="text-xs font-semibold">Weather Alerts:</p>
          {weather.warnings.map((warning, index) => (
            <p key={index} className="text-xs mt-1 opacity-90">{warning}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveWeatherWidget;
