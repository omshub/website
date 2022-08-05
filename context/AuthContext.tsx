import {createContext, useContext, useEffect, useState} from "react"
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../firebase/FirebaseConfig'
import {fetchSignInMethodsForEmail,signInWithPopup,signOut, GoogleAuthProvider,FacebookAuthProvider,GithubAuthProvider } from "firebase/auth";
import {useAlert} from './AlertContext'
import { OAuthProvider } from "firebase/auth";
const AuthContext = createContext<any>({})

export const useAuth =  () => useContext(AuthContext)

// eslint-disable-next-line no-undef
export const AuthContextProvider = ({children} : {children:React.ReactNode}) =>{

    const [user,setUser] = useState<any>(null)
    const {setAlert} = useAlert()
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
            console.log(result)
            currentProvider.credentialFromResult(result);
            // const token = credential.accessToken;
            // The signed-in user info.
            // const user = result.user;
            // ...
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            // const errorMessage = error.message;
            const email = error.customData.email;
            // The email of the user's account used.
            switch(errorCode){
                case 'auth/account-exists-with-different-credential':{
                    fetchSignInMethodsForEmail(auth,email).then((providers:string[])=>{
                        const providersArray = providers.map((provider:string)=>{

                            const lowerCaseName = provider.split(".")[0]
                            const normalCaseName = lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.slice(1).toLowerCase()
                            return normalCaseName
                        })
            
                        setAlert({
                            severity:'error',
                            text:`You already have an account${(providersArray.length > 1) ? 's' : ''} with the following sign-in method${(providersArray.length > 1) ? 's' : ''}: ${providersArray.join(', ')}.` 
                            + "\n" + `Please login with ${(providersArray.length > 1) ? 'one of those methods' : 'that method'} to link the new OAuth method for future use.`,
                            variant:'outlined'
                        })
                    })
                }

            }
            // The credential that was used.
            currentProvider.credentialFromError(error);
            
            // ...
          })}
          
    return <AuthContext.Provider value={{user,signInWithProvider,logout}}>{children}</AuthContext.Provider>

}