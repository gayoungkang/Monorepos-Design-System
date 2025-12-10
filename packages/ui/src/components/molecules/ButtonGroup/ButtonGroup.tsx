import React from "react"
import styled from "styled-components"
import { Button, ButtonProps } from "../../Button/Button"

const Group = styled.div`
  display: inline-flex;
  gap: 0.5rem;
`

export interface ButtonGroupProps {
  buttons: Array<ButtonProps & { label: string }>
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons }) => {
  return (
    <Group>
      {buttons.map(({ label, ...btnProps }) => (
        <Button key={label} {...btnProps}>
          {label}
        </Button>
      ))}
    </Group>
  )
}
