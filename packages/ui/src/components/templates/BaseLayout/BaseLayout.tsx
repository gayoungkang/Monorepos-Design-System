import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Header } from "../../organisms/Header/Header";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    background-color: #020617;
    color: #e2e8f0;
  }
`;

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem 1.5rem;
`;

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Layout>
      <GlobalStyle />
      <Header />
      <Main>{children}</Main>
    </Layout>
  );
};
