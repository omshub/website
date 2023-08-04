import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@src/Link';
import type { NextPage } from 'next';

const About: NextPage = () => (
  <Container maxWidth='lg'>
    <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant='h4' component='h1' gutterBottom>
        Welcome to OMSHub!
      </Typography>
      <Typography variant='subtitle1' paragraph color='primary' marginTop={2}>
        About this project
      </Typography>
      <Typography variant='body2' paragraph marginTop={1} align='center'>
        This is an open-source, community-driven project. The goal of this site
        is to facilitate current and prospective Georgia Tech OMSx students with
        effective determination their own courses selection, guided by the
        advice and wisdom of their peers.
      </Typography>
      <Typography variant='body2' paragraph marginTop={1} align='center'>
        To request a feature or to report an issue, visit our&nbsp;
        <Link href='https://github.com/omshub'>GitHub organization</Link>.
      </Typography>
      <Typography variant='body2' paragraph marginTop={1} align='center'>
        To engage with the community regarding this project, join our&nbsp;
        <Link href='https://discord.gg/DtdV4Qg3WY'>Discord server</Link>.
      </Typography>
      <Typography variant='subtitle1' paragraph color='primary' marginTop={2}>
        Terms of Use & Privacy
      </Typography>
      <Typography variant='body2' paragraph marginTop={1} align='center'>
        We are currently in the process of esablishing a non-profit organization
        and charter to govern this project via decentralized ownership.
      </Typography>
      <Typography variant='body2' paragraph marginTop={1} align='center'>
        We are still working out the appropriate &quot;legalese&quot;, however,
        the basic premise is simple: You own your own data on this platform, and
        this is a strictly non-profit venture (i.e., you data is a contribution
        to the community, NOT a for-profit product).
      </Typography>
    </Box>
  </Container>
);

export default About;
