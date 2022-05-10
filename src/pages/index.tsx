import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

import Home from './Home/index';
import Nav from './components/nav';
export default function Index() {
  return (
    <>
      <Nav />
      <Home></Home>
    </>
  );
}
