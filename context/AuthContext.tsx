import {createContext, useContext, useEffect, useState} from "react"
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../firebase/FirebaseConfig'
import {signInWithPopup,signOut, GoogleAuthProvider,FacebookAuthProvider,GithubAuthProvider } from "firebase/auth";
import { OAuthProvider } from "firebase/auth";
const AuthContext = createContext<any>({})

export const useAuth =  () => useContext(AuthContext)

// eslint-disable-next-line no-undef
export const AuthContextProvider = ({children} : {children:React.ReactNode}) =>{

    const [user,setUser] = useState<any>(null)

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,(user: any) =>{
            user ? setUser({
                uid:user.uid,
                email:user.email,
                displayName:user
            }) : setUser(null)
        })
        // OAuth Providers

        
        // Remove all listeners from firebase when unmounting
        return ()=> unsubscribe()
    },[])
    // Providers
    const providerMap:any = {
        "Google": [GoogleAuthProvider,new GoogleAuthProvider()],
        "Apple": [OAuthProvider,new OAuthProvider('apple.com')],
        "Github": [GithubAuthProvider,new GithubAuthProvider()],
        "Facebook": [GithubAuthProvider,new FacebookAuthProvider()]
    }
    const logout = async () =>{ 
        setUser(null)
        await signOut(auth) 
    }
    
    const signInWithProvider = (provider:string) => {
        const [currentProvider , currentProviderAuth] = providerMap[provider]
        signInWithPopup(auth,currentProviderAuth).then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            currentProvider.credentialFromResult(result);
            // const token = credential.accessToken;
            // The signed-in user info.
            // const user = result.user;
            // ...
          }).catch((error) => {

            // Handle Errors here.
            // const errorCode = error.code;
            // const errorMessage = error.message;
            // The email of the user's account used.
            // const email = error.customData.email;
            // The credential that was used.
            currentProvider.credentialFromError(error);
            
            // ...
          })}
          
    return <AuthContext.Provider value={{user,signInWithProvider,logout}}>{children}</AuthContext.Provider>

}