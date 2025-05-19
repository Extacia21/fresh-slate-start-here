
import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudLightning, Sun, Thermometer, Wind, Droplets } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: React.ElementType;
}

const LiveWeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getWeatherIcon = (condition: string) => {
    const conditions = condition.toLowerCase();
    if (conditions.includes('rain') || conditions.includes('shower')) {
      return CloudRain;
    } else if (conditions.includes('thunder') || conditions.includes('lightning') || conditions.includes('storm')) {
      return CloudLightning;
    } else if (conditions.includes('clear') || conditions.includes('sunny')) {
      return Sun;
    } else {
      return Cloud;
    }
  };

  const fetchWeather = async () => {
    // In a real app, this would be an API call to a weather service API
    // For this demo, we'll simulate weather data that would be fetched from a weather API
    try {
      // Simulate API fetch with different weather conditions
      const conditions = [
        "Partly Cloudy", 
        "Light Rain", 
        "Thunderstorms", 
        "Clear Skies",
        "Cloudy",
        "Heavy Rain"
      ];
      
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const randomTemp = Math.floor(Math.random() * 25) + 60; // 60-85°F
      const randomHumidity = Math.floor(Math.random() * 50) + 30; // 30-80%
      const randomWind = Math.floor(Math.random() * 15) + 1; // 1-15 mph
      
      let description = "";
      if (randomCondition === "Partly Cloudy") {
        description = "Partly cloudy with a chance of rain later";
      } else if (randomCondition === "Light Rain") {
        description = "Light rain showers, bring an umbrella";
      } else if (randomCondition === "Thunderstorms") {
        description = "Thunderstorms expected, stay indoors if possible";
      } else if (randomCondition === "Clear Skies") {
        description = "Clear skies and pleasant conditions";
      } else if (randomCondition === "Cloudy") {
        description = "Overcast with clouds, no precipitation expected";
      } else {
        description = "Heavy rain with possible flooding in low areas";
      }
      
      setWeather({
        temp: randomTemp,
        condition: randomCondition,
        humidity: randomHumidity,
        windSpeed: randomWind,
        description: description,
        icon: getWeatherIcon(randomCondition)
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchWeather();
    
    // Set up interval for less frequent updates (every 30 minutes instead of every minute)
    // In a real app, this would be aligned with the weather API's update frequency
    const interval = setInterval(() => {
      fetchWeather();
    }, 1800000); // 30 minutes
    
    // Clean up interval
    return () => clearInterval(interval);
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
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-xl text-white shadow-lg relative dark:from-blue-700 dark:to-blue-900">
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

export default LiveWeatherWidget;
