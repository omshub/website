
import Button from '@mui/material/Button';

interface SocialButtonProps {
    text?: string
    variant?: string
    style?: object
}

const SocialButton = ({...props}:SocialButtonProps) => {
    return (
        <Button style={props.style}>
            {props.text}
        </Button>
    )
}

export default SocialButton
