
import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  previousScreen: string | null;
  setPreviousScreen: (screen: string | null) => void;
  navigateTo: (screen: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [previousScreen, setPreviousScreen] = useState<string | null>(null);

  const navigateTo = (screen: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        previousScreen,
        setPreviousScreen,
        navigateTo,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextProps => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
