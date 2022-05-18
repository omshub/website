import * as React from 'react'
import Card from '@mui/material/card'

interface CommentCardProps {
	rating: number
}

const CommentCard = ({ ...props }: CommentCardProps) => {
	return (
		<Card>
			<p>{props.rating}</p>
		</Card>
	)
}

export default CommentCard
