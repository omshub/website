// TODO: Refactor to use async API calls logic here, or change to Redux + thunk
import * as React from 'react'
import { createContext, useContext, useState } from 'react'
import { IProviderProps } from '@context/types'

const CurrentCourseContext = createContext<any>({})
export const useCourse = () => useContext(CurrentCourseContext)
export const CurrentCourseProvider = ({ children }: IProviderProps) => {
	const [allCourseData, setAllCourseData] = useState<any>()
	return (
		<CurrentCourseContext.Provider value={{ allCourseData, setAllCourseData }}>
			{children}
		</CurrentCourseContext.Provider>
	)
}
