import { Grid } from '@mui/material'
import type { NextPage } from 'next'
// import {useAuth} from '../../context/AuthContext'
import Stack from '@mui/material/Stack';
import SocialButton from './SocialButton';
const Login:NextPage = () =>{
    // const {signInWithProvider} = useAuth()

    const providers = ["Google","Facebook","Github","Apple"]

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
                    providers.map((provider,index)=>{
                        return(
                            <>
                             <SocialButton key={index} text={`Login with ${provider}`}></SocialButton>
                            </>
                        )
                    })
                    }
                </Stack>
            </Grid>
        </Grid>

    )}

export default Login
