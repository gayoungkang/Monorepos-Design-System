import React from "react";
import styled from "styled-components";
import { ButtonGroup } from "../../molecules/ButtonGroup/ButtonGroup";

const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  background-color: #0f172a;
  color: white;
`;

const Logo = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
`;

export const Header: React.FC = () => {
  return (
    <HeaderWrapper>
      <Logo>ACME Design System</Logo>
      <ButtonGroup
        buttons={[
          { label: "Docs", variant: "ghost" },
          { label: "Components", variant: "ghost" },
          { label: "GitHub", variant: "primary" }
        ]}
      />
    </HeaderWrapper>
  );
};
