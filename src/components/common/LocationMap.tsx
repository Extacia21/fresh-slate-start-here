
import { useEffect, useRef } from "react";

interface LocationMapProps {
  location: string;
  className?: string;
  zoom?: number;
  showDirections?: boolean;
}

const LocationMap = ({ location, className, zoom = 13, showDirections = false }: LocationMapProps) => {
  const mapRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // If no specific location is provided, default to Chinhoyi, Zimbabwe
    const mapLocation = location || "Chinhoyi, Zimbabwe";
    
    if (mapRef.current) {
      const query = encodeURIComponent(mapLocation);
      const src = `https://maps.google.com/maps?q=${query}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
      mapRef.current.src = src;
    }
  }, [location, zoom]);

  return (
    <div className={`${className || ""} relative overflow-hidden`}>
      <iframe
        ref={mapRef}
        width="100%"
        height="100%"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        src="about:blank"
        title={`Map of ${location || "Chinhoyi, Zimbabwe"}`}
        className="absolute inset-0"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default LocationMap;
