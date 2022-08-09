import * as React from 'react';
import { createContext, useContext, useState } from "react";
const CurrentCourseContext = createContext<any>({})
export const useCourse = () => useContext(CurrentCourseContext)
export const CurrentCourseProvider = ({children} : {children:React.ReactNode}) => {
    const [allCourseData, setAllCourseData] = useState<any>();
    return <CurrentCourseContext.Provider value={{allCourseData,setAllCourseData}}>{children}</CurrentCourseContext.Provider>
}