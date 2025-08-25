import React, { createContext, useContext, useState } from 'react';

type LocationCoords = {
  latitude: number;
  longitude: number;
} | null;

type LocationContextType = {
  location: LocationCoords;
  setLocation: (coords: LocationCoords) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationCoords>(null);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation debe usarse dentro de LocationProvider');
  return context;
};
