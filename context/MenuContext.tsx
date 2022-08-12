import { TContextProviderProps } from '@context/types'
import React, { createContext, useContext, useState } from 'react'

const MenuContext = createContext<any>({})
export const useMenu = () => useContext(MenuContext)
export const MenuContextProvider = ({ children }: TContextProviderProps) => {
	const [loginModalOpen, setLoginModalOpen] = useState(false)

	const handleLoginModalOpen = () => setLoginModalOpen(true)
	const handleLoginModalClose = () => setLoginModalOpen(false)

	const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
		React.useState<null | HTMLElement>(null)

	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setProfileMenuAnchorEl(event.currentTarget)
	}

	const handleProfileMenuClose = () => {
		setProfileMenuAnchorEl(null)
	}

	const [mobileNavMenuAnchorEl, setMobileNavMenuAnchorEl] =
		React.useState<null | HTMLElement>(null)

	const handleMobileNavMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setMobileNavMenuAnchorEl(event.currentTarget)
	}

	const handleMobileNavMenuClose = () => {
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
				handleProfileMenuClose,
				mobileNavMenuAnchorEl,
				handleMobileNavMenuOpen,
				handleMobileNavMenuClose,
			}}
		>
			{children}
		</MenuContext.Provider>
	)
}
