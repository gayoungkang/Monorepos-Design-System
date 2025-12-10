import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyle = createGlobalStyle`
  /* 기본 태그 초기화 */
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed, 
  figure, figcaption, footer, header, hgroup, 
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
  }

  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure, 
  footer, header, hgroup, menu, nav, section {
    display: block;
  }

  /* 글로벌 공통 */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f5f5f5;
  }
  html {
    font-family: 'Pretendard', sans-serif;
    font-size: 10px;
    background-color: ${theme.colors.background.default};
  }
  
  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    min-width: 1000px;
    position: relative;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* 요소별 초기화 */
  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
    background: transparent;
    border: none;
    padding: 0;
    appearance: none;
    box-shadow: none;
    outline: none;
  }

  button {
    cursor: pointer;
  }

  select {
    background: none;
  }

  ul, ol {
    list-style: none;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  blockquote, q {
    quotes: none;
  }
  blockquote::before, blockquote::after,
  q::before, q::after {
    content: '';
    content: none;
  }

  /* Chrome/Safari/Edge - search input */
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    display: none;
  }

  /* Firefox - search input */
  input[type='search']::-moz-search-clear-button,
  input[type='search']::-moz-search-cancel-button {
    display: none;
  }

  /* Number input spin 제거 */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Date/Time input 달력 제거 */
  input[type='date']::-webkit-calendar-picker-indicator,
  input[type='time']::-webkit-calendar-picker-indicator,
  input[type='datetime-local']::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
  }

`;

export default GlobalStyle;
