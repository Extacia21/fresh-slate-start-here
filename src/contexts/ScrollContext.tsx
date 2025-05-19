
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ScrollContextType {
  isScrollingDown: boolean;
  scrollPosition: number;
}

const ScrollContext = createContext<ScrollContextType>({
  isScrollingDown: false,
  scrollPosition: 0,
});

export const useScroll = () => useContext(ScrollContext);

export const ScrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrollingDown(currentScrollTop > lastScrollTop && currentScrollTop > 10);
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
      setScrollPosition(currentScrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  return (
    <ScrollContext.Provider value={{ isScrollingDown, scrollPosition }}>
      {children}
    </ScrollContext.Provider>
  );
};
