// @refresh reset
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SchoolIcon from '@mui/icons-material/School';

interface NavBarProps {};

interface NavLinkProps {
	linkTo: string,
	linkTitle: string
};

const LINK_DATA: NavLinkProps[] = [
	{
		linkTo: '/',
		linkTitle: "Home"
	},
	{
		linkTo: '/about',
		linkTitle: "About"
	}
];

export const NavBar = ({ ...props }: NavBarProps) => {
	return (
		<AppBar
			position='static'
			color='default'
			elevation={0}
			sx={{
				bgcolor: (theme) => `${theme.palette.primary.main}`,
				boxShadow: `0 5px 15px 0 ${grey[200]}`
			}}
			{...props}
		>
			<Toolbar sx={{ flexWrap: 'wrap', height: "100%" }}>
				<SchoolIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
				<Typography variant='h6' color='inherit' noWrap sx={{ flexGrow: 1 }}>
					OMSHub
				</Typography>
				<nav style={{ marginLeft: "auto" }}>
					{
						LINK_DATA.map((data: NavLinkProps) => <Button
							key={`NavbarLinkTo${data.linkTitle}`}
							variant="contained"
							href={data.linkTo}
							sx={{
								bgcolor: (theme) => `${theme.palette.primary.main}`,
								'&:hover': {
									background: (theme) => `${theme.palette.primary.light}`,
								},
								minWidth: "75px",
								textDecoration: "none",
								height: "10%",
								border: "0px",
								boxShadow: "none"
							}}
							>
							{data.linkTitle}
						</Button>)
					}
					<Button href='#todo' variant='contained' sx={{ my: 1, mx: 1.5 }}>
						Login
					</Button>
				</nav>
			</Toolbar>
		</AppBar>
	)
};
