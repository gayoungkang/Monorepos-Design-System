import { create } from '@storybook/theming';

export const lightTheme = create({
  base: 'light',
  brandTitle: 'ACME UI',
  brandUrl: 'https://acme.com',
  brandImage: 'https://dummyimage.com/120x40/000/fff&text=ACME',

  colorPrimary: '#007bff',
  colorSecondary: '#00c2a8',

  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#eee',
  appBorderRadius: 8,
});


export const darkTheme = create({
    base: 'dark',
    brandTitle: 'ACME UI (Dark)',
    brandUrl: 'https://acme.com',
    brandImage: 'https://dummyimage.com/120x40/fff/000&text=ACME',
  
    colorPrimary: '#00c2a8',
    colorSecondary: '#007bff',
  
    appBg: '#111',
    appContentBg: '#181818',
  });
  