import { ReactNode, useCallback, useState } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { fadeInUp } from "../../tokens/keyframes"
import { theme } from "../../tokens/theme"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import Icon from "../Icon/Icon"

export type AccordionProps = BaseMixinProps & {
  expanded?: boolean
  defaultExpanded?: boolean
  disabled?: boolean
  onChange?: (expanded: boolean) => void
  summary: ReactNode
  children: ReactNode
}
/**---------------------------------------------------------------------------/

* ! Accordion
*
* * 콘텐츠를 접고 펼칠 수 있는 아코디언 컴포넌트
* * controlled / uncontrolled 확장 상태 모두 지원
* * 기본 확장 여부 설정 가능 (defaultExpanded)
* * 비활성화 상태 지원 (disabled)
* * 헤더(summary) 클릭 시 확장 상태 토글
* * 확장 상태 변경 시 onChange 콜백 호출
* * summary 문자열/ReactNode 모두 지원
* * 아이콘 회전을 통한 확장 상태 시각화
* * 펼침 영역에 fadeInUp 애니메이션 적용
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상, border, radius 시스템 활용

* @module Accordion
* 콘텐츠 그룹을 접고 펼쳐 정보를 단계적으로 노출하기 위한 컴포넌트입니다.
* - expanded prop 제공 시 controlled 방식으로 동작
* - 내부 상태를 사용하는 uncontrolled 방식도 지원
* - disabled 상태에서는 인터랙션 및 스타일 제한
* - summary 영역과 details 영역으로 구조 분리
*
* @usage
* <Accordion summary="Title">Content</Accordion>
* <Accordion expanded={open} onChange={setOpen} summary={<CustomHeader />} />

/---------------------------------------------------------------------------**/

const Accordion = ({
  expanded,
  defaultExpanded = false,
  disabled = false,
  onChange,
  summary,
  children,
  ...others
}: AccordionProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)

  // * expanded prop 존재 여부로 controlled / uncontrolled 모드 판별
  const isControlled = expanded !== undefined

  // * 현재 아코디언 열림 상태 계산
  const isExpanded = isControlled ? expanded : internalExpanded

  // * 클릭 시 아코디언 열림 상태를 토글하고 상태 변경을 외부로 알림
  const handleToggle = useCallback(() => {
    if (disabled) return

    const next = !isExpanded
    if (!isControlled) setInternalExpanded(next)
    onChange?.(next)
  }, [disabled, isExpanded, isControlled, onChange])

  return (
    <Root disabled={disabled} {...others}>
      <Summary onClick={handleToggle} disabled={disabled}>
        <Flex align="center" justify="space-between" width="100%">
          {typeof summary === "string" ? (
            <Typography
              text={summary}
              variant="h1"
              color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
            />
          ) : (
            summary
          )}
          <Icon
            name="ArrowDown"
            size={16}
            color={disabled ? theme.colors.text.disabled : theme.colors.grayscale[500]}
            sx={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </Flex>
      </Summary>
      {isExpanded && <Details>{children}</Details>}
    </Root>
  )
}

const Root = styled(Box)<{ disabled?: boolean }>`
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius[4]};
  background-color: ${({ disabled }) =>
    disabled ? theme.colors.grayscale[100] : theme.colors.grayscale.white};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

const Summary = styled.div<{ disabled?: boolean }>`
  padding: 12px 16px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  user-select: none;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "transparent" : theme.colors.grayscale[50])};
  }
`

const Details = styled.div`
  padding: 12px 16px;
  animation: ${fadeInUp} 0.2s ease;
  border-top: 1px solid ${theme.colors.border.default};
`

export default Accordion
