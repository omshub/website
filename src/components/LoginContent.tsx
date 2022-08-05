import { Grid } from '@mui/material'
import type { NextPage } from 'next'
import {useAuth} from '../../context/AuthContext'
import {useMenu} from '../../context/MenuContext'
import Stack from '@mui/material/Stack';
import SocialButton from './SocialButton';
const Login:NextPage = () =>{
    const {signInWithProvider} = useAuth()
    const {handleModalClose} = useMenu()
    const providers:any = {
        "Google":{
            style:{
                background: 'white', 
                color: 'black'
            }
        },
        "Facebook":{
            style:{
                background:'#293e69',
                color: 'white'
            }
        },
        "Github":{
            style:{
                background:'#555555',
                color: 'white'
            }
        },
        "Apple":{
            style:{
                background:'#3333331c',
                color: 'black'
            }
        },

    }
    

    return (
        <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ padding: '10px' }}
        >
            <Grid item xs={3}>
                <Stack spacing={2}>
                    {
                    Object.keys(providers).map((key,index)=>{
                        return(
                            <>
                             <SocialButton key={index} onClick={()=>{signInWithProvider(key);handleModalClose()}} style={providers[key].style} text={`Login with ${key}`}></SocialButton>
                            </>
                        )
                    })
                    }
                </Stack>
            </Grid>
        </Grid>

    )}

export default Login
