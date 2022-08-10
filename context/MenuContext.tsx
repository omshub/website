import React, { createContext, useContext, useState } from 'react'
import { TContextProviderProps } from '@context/types'

const MenuContext = createContext<any>({})
export const useMenu = () => useContext(MenuContext)
export const MenuContextProvider = ({ children }: TContextProviderProps) => {
	const [loginModalOpen, setLoginModalOpen] = useState(false)
	const handleLoginModalOpen = () => {
		setLoginModalOpen(true)
	}
	const handleLoginModalClose = () => setLoginModalOpen(false)
	const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
		React.useState<null | HTMLElement>(null)
	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setProfileMenuAnchorEl(event.currentTarget)
	}
	const handleMenuClose = () => {
		setProfileMenuAnchorEl(null)
	}
	return (
		<MenuContext.Provider
			value={{
				profileMenuAnchorEl,
				loginModalOpen,
				handleLoginModalOpen,
				handleLoginModalClose,
				handleProfileMenuOpen,
				handleMenuClose,
			}}
		>
			{children}
		</MenuContext.Provider>
	)
}
