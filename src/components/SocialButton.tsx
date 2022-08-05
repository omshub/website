
import Button from '@mui/material/Button';
import * as React from 'react'
interface SocialButtonProps {
    key?: number 
    text?: string
    variant?: string
    style?: object
    onClick?: () => void
}

const SocialButton= ({...props}:SocialButtonProps) => {
    return (
        <Button key={props.key} onClick={props.onClick} style={props.style}>
            {props.text}
        </Button>
    )
}

export default SocialButton
