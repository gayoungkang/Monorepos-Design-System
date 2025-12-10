import React from "react"
import styled from "styled-components"
import { BaseLayout } from "../../templates/BaseLayout/BaseLayout"
import { Button } from "../../Button/Button"

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`

const Description = styled.p`
  max-width: 40rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  color: #94a3b8;
`

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`

export const HomePage: React.FC = () => {
  return (
    <BaseLayout>
      <Title>Atomic Design System with Monorepo</Title>
      <Description>
        이 페이지는 monorepo 환경에서 Atomic Design 패턴과 styled-components를 사용한 Design
        System의 예시입니다.
      </Description>
      <Actions>
        <Button>시작하기</Button>
        <Button variant="secondary">스토리 보기</Button>
      </Actions>
    </BaseLayout>
  )
}
