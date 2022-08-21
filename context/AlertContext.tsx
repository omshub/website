import { createContext, useContext, useState } from 'react'
import { TContextProviderProps } from '@context/types'

interface Alert {
	type?: string
	text?: string
	severity?: string
}

const AlertContext = createContext<any>({})

export const useAlert = () => useContext(AlertContext)

export const AlertContextProvider = ({ children }: TContextProviderProps) => {
	const [alert, setAlert] = useState<Alert>()
	return (
		<AlertContext.Provider value={{ alert, setAlert }}>
			{children}
		</AlertContext.Provider>
	)
}
