import { Grid } from '@mui/material'
import type { NextPage } from 'next'
import {useAuth} from '../context/AuthContext'
const Login:NextPage = () =>{
    const {signInWithProvider} = useAuth()

    const providers = ["Google","Facebook","Github","Apple"]

    return (
        <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh' }}
        > 
        <Grid item xs={3}>
                <ul>
                    {
                    providers.map((provider,index)=>{
                        return(
                            <li key={index}>
                                <button onClick={()=>signInWithProvider(provider)}>Sign in with {provider}</button>
                            </li>
                        )
                    })   
                    }
                </ul>
        </Grid>
        </Grid>
        
    )}

export default Login