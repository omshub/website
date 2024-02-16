import { TContextProviderProps } from '@context/types';
import React, { createContext, useContext, useState } from 'react';

const MenuContext = createContext<any>({});

export const useMenu = () => useContext(MenuContext);

export const MenuContextProvider = ({ children }: TContextProviderProps) => {
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLoginOpen = () => setLoginOpen(true);
  const handleLoginClose = () => setLoginOpen(false);

  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const [mobileNavMenuAnchorEl, setMobileNavMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleMobileNavMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileNavMenuAnchorEl(event.currentTarget);
  };

  const handleMobileNavMenuClose = () => {
    setMobileNavMenuAnchorEl(null);
  };

  return (
    <MenuContext.Provider
      value={{
        profileMenuAnchorEl,
        loginOpen,
        handleLoginOpen,
        handleLoginClose,
        handleProfileMenuOpen,
        handleProfileMenuClose,
        mobileNavMenuAnchorEl,
        handleMobileNavMenuOpen,
        handleMobileNavMenuClose,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
