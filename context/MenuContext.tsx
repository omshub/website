
import {createContext, useContext, useState} from "react"
import * as React from 'react'


const MenuContext = createContext<any>({})
export const useMenu = () => useContext(MenuContext)
export const MenuContextProvider = ({children} : {children:React.ReactNode}) => {
    const [modalOpen, setModalOpen] = useState(false);
	const handleModalOpen = () => {
        setModalOpen(true);
    }
	const handleModalClose = () => setModalOpen(false);
    const [profileMenuAnchorEl, setProfileMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setProfileMenuAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setProfileMenuAnchorEl(null);
	};
    return <MenuContext.Provider value={{profileMenuAnchorEl,modalOpen,handleModalOpen,handleModalClose,handleProfileMenuOpen,handleMenuClose}}>{children}</MenuContext.Provider>
}