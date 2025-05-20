
import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudLightning, Sun, Thermometer, Wind, Droplets } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: React.ElementType;
  highTemp: number;
  lowTemp: number;
  location: string;
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
    // In a real app, this would be an API call to a weather service API for Chinhoyi, Zimbabwe
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
      const randomTemp = Math.floor(Math.random() * 10) + 25; // 25-35°C for Chinhoyi
      const highTemp = randomTemp + Math.floor(Math.random() * 5); // High temp is 1-5 degrees higher
      const lowTemp = randomTemp - Math.floor(Math.random() * 5); // Low temp is 1-5 degrees lower
      const randomHumidity = Math.floor(Math.random() * 30) + 50; // 50-80% humidity for tropical climate
      const randomWind = Math.floor(Math.random() * 10) + 5; // 5-15 km/h wind speed
      
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
        highTemp: highTemp,
        lowTemp: lowTemp,
        condition: randomCondition,
        humidity: randomHumidity,
        windSpeed: randomWind,
        description: description,
        icon: getWeatherIcon(randomCondition),
        location: "Chinhoyi, Zimbabwe"
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
              <h2 className="font-bold text-2xl">{weather.temp}°C</h2>
              <div className="flex items-center text-xs">
                <span>H: {weather.highTemp}°C</span>
                <span className="mx-1">|</span>
                <span>L: {weather.lowTemp}°C</span>
              </div>
              <p className="text-sm opacity-90">{weather.condition}</p>
            </div>
          </div>
          <p className="text-sm mt-2 opacity-90">{weather.description}</p>
          <p className="text-xs mt-1 font-medium">{weather.location}</p>
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
    </div>
  );
};

export default LiveWeatherWidget;
