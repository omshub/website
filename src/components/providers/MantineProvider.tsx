'use client';

import { MantineProvider, createTheme, MantineColorsTuple, rem, CSSVariablesResolver } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

// CSS Variables resolver for WCAG-compliant colors
const resolver: CSSVariablesResolver = (_theme) => ({
  variables: {
    // Override dimmed color for 4.5:1 contrast on white backgrounds
    '--mantine-color-dimmed': '#636c76',
    // Override placeholder color for WCAG compliance (4.5:1 contrast)
    '--mantine-color-placeholder': '#767676',
  },
  light: {
    '--mantine-color-dimmed': '#636c76',
    '--mantine-color-placeholder': '#767676',
  },
  dark: {
    '--mantine-color-dimmed': '#a6a7ab',
    '--mantine-color-placeholder': '#a6a7ab',
  },
});

/**
 * Georgia Tech Official Brand Colors
 * Source: https://brand.gatech.edu/our-look/colors
 */

// Primary: Tech Gold - #B3A369
const techGold: MantineColorsTuple = [
  '#F9F6E5', // Diploma (official GT color)
  '#F0EBD4',
  '#E5DDB8',
  '#D9CF9C',
  '#CCBF80',
  '#B3A369', // Tech Gold (primary)
  '#A4925A', // Tech Medium Gold (accessible for large headlines)
  '#857437', // Tech Dark Gold (accessible for small bold text)
  '#6B5D2C',
  '#514621',
];

// Primary: Navy Blue - #003057
const navy: MantineColorsTuple = [
  '#E6EEF4',
  '#CCDDE9',
  '#99BBCE',
  '#6699B3',
  '#337798',
  '#003057', // Navy Blue (primary)
  '#002847',
  '#002038',
  '#001829',
  '#00101A',
];

// Secondary: Buzz Gold - #EAAA00
const buzzGold: MantineColorsTuple = [
  '#FFF8E6',
  '#FFEFC2',
  '#FFE08A',
  '#FFD152',
  '#FFC21A',
  '#EAAA00', // Buzz Gold
  '#CC9500',
  '#A87800',
  '#855F00',
  '#614500',
];

// Secondary: Gray Matter - #54585A
const grayMatter: MantineColorsTuple = [
  '#F4F4F5',
  '#E8E9EA',
  '#D1D3D4',
  '#BABCBE',
  '#A3A6A8',
  '#54585A', // Gray Matter
  '#484B4D',
  '#3C3E40',
  '#303233',
  '#242526',
];

// Tertiary: Bold Blue - #3A5DAE
const boldBlue: MantineColorsTuple = [
  '#EEF1F8',
  '#DCE3F1',
  '#B9C7E3',
  '#96ABD5',
  '#738FC7',
  '#3A5DAE', // Bold Blue
  '#314F94',
  '#28417A',
  '#1F3360',
  '#162546',
];

// Tertiary: Olympic Teal - #008C95
const olympicTeal: MantineColorsTuple = [
  '#E6F5F6',
  '#CCEBEC',
  '#99D7D9',
  '#66C3C6',
  '#33AFB3',
  '#008C95', // Olympic Teal
  '#00777F',
  '#006269',
  '#004D53',
  '#00383D',
];

// Tertiary: New Horizon (Red/Orange) - #E04F39
const newHorizon: MantineColorsTuple = [
  '#FDEDEA',
  '#FBDAD5',
  '#F7B5AB',
  '#F39081',
  '#EF6B57',
  '#E04F39', // New Horizon
  '#C04431',
  '#A03929',
  '#802E21',
  '#602319',
];

// Tertiary: Impact Purple - #5F249F
const impactPurple: MantineColorsTuple = [
  '#F2ECF8',
  '#E5D9F1',
  '#CBB3E3',
  '#B18DD5',
  '#9767C7',
  '#5F249F', // Impact Purple
  '#511F87',
  '#431A6F',
  '#351557',
  '#27103F',
];

// Tertiary: Canopy Lime - #A4D233
const canopyLime: MantineColorsTuple = [
  '#F5FAE8',
  '#EBF5D1',
  '#D7EBA3',
  '#C3E175',
  '#AFD747',
  '#A4D233', // Canopy Lime
  '#8CB32C',
  '#749425',
  '#5C751E',
  '#445617',
];

// Dark mode colors (inspired by MUI's dark theme - #0f1214)
const dark: MantineColorsTuple = [
  '#C1C2C5', // Text color
  '#A6A7AB',
  '#909296',
  '#5C5F66',
  '#373A40',
  '#2C2E33',
  '#25262B', // Card/paper background
  '#1A1B1E', // Slightly elevated surfaces
  '#141517', // Default background
  '#0f1214', // Deepest background (MUI dark)
];

// Custom gray palette with WCAG-compliant dimmed color (4.5:1 contrast on white)
const gray: MantineColorsTuple = [
  '#f8f9fa',
  '#f1f3f5',
  '#e9ecef',
  '#dee2e6',
  '#ced4da',
  '#adb5bd',
  '#636c76', // Dimmed - WCAG compliant (4.54:1 contrast on white)
  '#495057',
  '#343a40',
  '#212529',
];

const theme = createTheme({
  primaryColor: 'techGold',
  colors: {
    techGold,
    navy,
    buzzGold,
    grayMatter,
    boldBlue,
    olympicTeal,
    newHorizon,
    impactPurple,
    canopyLime,
    dark,
    gray,
  },
  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  white: '#FFFFFF',
  black: '#003057', // Use Navy as black for better brand consistency
  primaryShade: { light: 5, dark: 4 },
  other: {
    // Store exact brand colors for easy reference
    brand: {
      techGold: '#B3A369',
      techMediumGold: '#A4925A',
      techDarkGold: '#857437',
      navy: '#003057',
      buzzGold: '#EAAA00',
      grayMatter: '#54585A',
      piMile: '#D6DBD4',
      diploma: '#F9F6E5',
      // Tertiary (use sparingly - max 10%)
      impactPurple: '#5F249F',
      boldBlue: '#3A5DAE',
      olympicTeal: '#008C95',
      electricBlue: '#64CCC9',
      canopyLime: '#A4D233',
      ratCap: '#FFCD00',
      newHorizon: '#E04F39',
    },
  },
  autoContrast: true,
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Anchor: {
      defaultProps: {
        c: 'boldBlue',
      },
    },
  },
});

interface MantineThemeProviderProps {
  children: React.ReactNode;
}

export default function MantineThemeProvider({ children }: MantineThemeProviderProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto" cssVariablesResolver={resolver}>
      <Notifications
        position="top-left"
        autoClose={4000}
        containerWidth={380}
        notificationMaxHeight={200}
        limit={5}
        zIndex={1100}
        styles={{
          root: {
            top: rem(80),
            left: rem(16),
            right: 'unset',
            pointerEvents: 'none', // Allow clicks to pass through container
          },
          notification: {
            pointerEvents: 'auto', // But notifications themselves are clickable
          },
        }}
      />
      {children}
    </MantineProvider>
  );
}
