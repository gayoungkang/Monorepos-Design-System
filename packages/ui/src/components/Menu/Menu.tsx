import { forwardRef } from "react"
import type { ForwardedRef, MouseEventHandler } from "react"
import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import type { SizeUiType } from "../../types"
import type { IconName } from "../Icon/icon-loader"
import Icon from "../Icon/Icon"
import type { IconProps } from "../Icon/Icon"
import { Typography } from "../Typography/Typography"
import type { TypographyProps } from "../Typography/Typography"
import Flex from "../Flex/Flex"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"

export type MenuProps = BaseMixinProps & {
  size?: SizeUiType
  text: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  startIcon?: IconName
  endIcon?: IconName
  selected?: boolean
  disabled?: boolean
  iconProps?: Partial<Omit<IconProps, "name">>
  typographyProps?: Partial<TypographyProps>
}
/**---------------------------------------------------------------------------/
 *
 * ! Menu
 *
 * * 드롭다운/리스트 내에서 사용하는 단일 메뉴 항목(button) 컴포넌트
 * * 텍스트와 좌/우 아이콘(startIcon/endIcon), 선택 표시(selected 체크 아이콘)를 조합해 렌더링
 * * disabled/selected 상태에 따라 클릭 가능 여부와 스타일을 제어하며, BaseMixin으로 외부 스타일 확장 지원
 *
 * * 동작 규칙
 *   * 주요 분기 조건 및 처리 우선순위
 *     * 클릭 시 항상 e.stopPropagation()으로 상위 클릭 이벤트 전파를 차단
 *     * disabled === true 이면 클릭을 무시하고 onClick을 호출하지 않음
 *     * disabled === false 이면 onClick?.(e) 호출
 *   * 이벤트 처리 방식
 *     * onClick: handleClick에서 disabled 체크 후 위임
 *   * disabled 상태에서 차단되는 동작
 *     * 클릭 동작(onClick) 차단
 *     * hover/active 시각 효과는 :not(:disabled) 조건으로 제한
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 버튼 레이아웃
 *     * 좌측: startIcon(옵션) + 텍스트 + endIcon(옵션)
 *     * 우측: selected === true 인 경우 체크 아이콘(SelectedIcon) 표시
 *     * justify-content: space-between으로 좌/우 영역 분리
 *   * size(S/M/L)에 따른 규칙
 *     * iconSize: S=12, M=14, L=16
 *     * font-size/padding: StyledMenu에서 size별 분기 적용
 *     * Typography sx의 fontSize도 size별로 분기 적용
 *   * 상태 스타일
 *     * disabled: 배경(grayscale[100]) + 텍스트(text.disabled) + not-allowed 커서
 *     * enabled: hover 시 background.default, active 시 info[500] 컬러 강조
 *     * focus-visible: primary[200] outline 적용
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택)
 *     * text: 필수(메뉴 라벨)
 *     * size: 크기(S/M/L), 기본 "M"
 *     * startIcon/endIcon: 좌/우 아이콘(옵션)
 *     * selected: 선택 상태(체크 아이콘 표시), 기본 false
 *     * disabled: 비활성 상태, 기본 false
 *     * iconProps/typographyProps: 내부 Icon/Typograpy 커스터마이징 확장 포인트
 *   * 내부 계산 로직 요약
 *     * size 기반 iconSize 및 Typography fontSize를 계산
 *     * iconProps.color가 있으면 Icon에 color를 전달하고, 없으면 color를 undefined로 두어 기본(currentColor) 흐름을 유지
 *   * 클라이언트 제어 컴포넌트 (서버 제어 없음)
 *
 * @module Menu
 * 아이콘/선택 상태를 지원하는 메뉴 항목(button) 컴포넌트
 *
 * @usage
 * <Menu
 *   text="설정"
 *   startIcon="Settings"
 *   selected
 *   onClick={() => {}}
 * />
 *
/---------------------------------------------------------------------------**/

const Menu = forwardRef(
  (
    {
      text,
      onClick,
      startIcon,
      endIcon,
      size = "M",
      disabled = false,
      selected = false,
      iconProps,
      typographyProps,
      ...others
    }: MenuProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    // * disabled 상태에서는 클릭을 무시하고, 이벤트 전파는 차단
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
      e.stopPropagation()
      if (disabled) return
      onClick?.(e)
    }

    const iconSize = size === "S" ? 12 : size === "L" ? 16 : 14

    return (
      <StyledMenu
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        $size={size}
        $selected={selected}
        {...others}
      >
        <Flex align="center">
          {startIcon && (
            <Icon
              name={startIcon}
              size={iconSize}
              mr="2px"
              {...iconProps}
              {...(iconProps?.color ? { color: iconProps.color } : { color: undefined })}
            />
          )}

          <Typography
            text={text}
            variant="b2Regular"
            color="currentColor"
            sx={{ fontSize: size === "S" ? "8px" : size === "L" ? "12px" : "10px" }}
            {...typographyProps}
          />

          {endIcon && (
            <Icon
              name={endIcon}
              size={iconSize}
              ml="2px"
              {...iconProps}
              {...(iconProps?.color ? { color: iconProps.color } : { color: undefined })}
            />
          )}
        </Flex>

        {selected && (
          <Icon
            name="CheckLine"
            size={iconSize}
            ml="2px"
            {...iconProps}
            {...(iconProps?.color
              ? { color: iconProps.color }
              : { color: theme.colors.success[500] })}
            sx={{ flexShrink: 0 }}
          />
        )}
      </StyledMenu>
    )
  },
)

Menu.displayName = "Menu"

const StyledMenu = styled.button<
  Omit<MenuProps, "text" | "size" | "selected"> & { $size: SizeUiType; $selected: boolean }
>`
  ${BaseMixin}

  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  width: 100%;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  transition: all 0.2s ease-in-out;

  font-size: ${({ $size }) => ($size === "L" ? "12px" : $size === "M" ? "10px" : "8px")};
  padding: ${({ $size }) => ($size === "L" ? "12px 6px" : $size === "M" ? "8px 4px" : "5px 4px")};

  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.grayscale[100] : theme.colors.grayscale.white};

  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.text.disabled : theme.colors.text.secondary};

  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background.default};
  }

  &:active:not(:disabled) {
    color: ${({ theme }) => theme.colors.info[500]};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[200]};
    outline-offset: 2px;
  }
`

export default Menu
