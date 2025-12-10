
import {
  FocusEventHandler,
  MouseEventHandler,
  useState,
  MouseEvent,
} from "react";
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin";
import { IconName } from "../Icon/icon-loader";
import { VariantUiType } from "@acme/ui/types";
import Icon, { IconProps } from "../Icon/Icon";
import { DefaultTheme } from "styled-components";
import { styled } from "../../tokens/customStyled";
import { theme } from "../../tokens/theme";

export type IconButtonProps = BaseMixinProps & {
  icon: IconName;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: number | string;
  variant?: VariantUiType;
  disabled?: boolean;
  iconProps?: Partial<Omit<IconProps, "name">>;
  disableInteraction?: boolean;
  onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void;
  onMouseUp?: (e: MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * @module IconButton
 * 재사용 가능한 아이콘 전용 버튼 컴포넌트입니다. 다양한 스타일(variant), 크기(size), 상태(disabled/hover/active),
 * 및 커스텀 아이콘 렌더링을 지원합니다.
 *
 * - `BaseMixin` 기반 공통 스타일 사용
 * - `contained`, `outlined` variant 지원
 * - hover 및 active 상태 색상 변화
 * - `disableInteraction` 옵션으로 hover/active 비활성화 가능
 * - 외부 onMouseDown, onMouseUp, onMouseLeave 핸들러 통합 지원
 *
 * @사용법
 * <IconButton
 *   icon="ArrowLeft"
 *   onClick={handleClick}
 *   onMouseDown={() => holdStart()}
 *   onMouseUp={holdEnd}
 *   onMouseLeave={holdEnd}
 * />
 */

const IconButton = ({
  icon,
  onClick,
  disabled = false,
  disableInteraction = false,
  size = 16,
  variant = "contained",
  iconProps,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...others
}: IconButtonProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // * 클릭 핸들러
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (e.detail === 0) return;
    e.preventDefault();
    if (!disabled) onClick?.(e);
  };

  // * 마우스 hover 상태 제어
  const handleHover =
    (hover: boolean) => (e: MouseEvent<HTMLButtonElement>) => {
      if (!disableInteraction) setIsHover(hover);
      if (!hover) onMouseLeave?.(e);
    };

  // * 마우스 active 상태 제어
  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsActive(true);
    onMouseDown?.(e);
  };

  // * 마우스 active 상태 제어
  const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsActive(false);
    onMouseUp?.(e);
  };

  // * 포커스 해제 시 active 상태 초기화
  const handleBlur: FocusEventHandler<HTMLButtonElement> = () =>
    setIsActive(false);

  // * variant, 상태에 따른 아이콘 컬러 계산
  const getIconColorFromVariant = (
    variant: VariantUiType,
    theme: DefaultTheme,
    disabled: boolean,
    isHover: boolean,
    isActive: boolean
  ): string => {
    if (disabled) return theme.colors.grayscale[200];
    if (isActive) return theme.colors.grayscale[500];
    if (variant === "outlined" && isHover) return theme.colors.grayscale[200];
    return theme.colors.grayscale[500];
  };

  return (
    <IconButtonStyle
      disabled={disabled}
      disableInteraction={disableInteraction}
      onClick={handleClick}
      onMouseEnter={handleHover(true)}
      onMouseLeave={handleHover(false)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onBlur={handleBlur}
      variant={variant}
      p={"4px"}
      {...others}
    >
      <Icon
        color={
          getIconColorFromVariant(
            variant,
            theme,
            disabled,
            isHover,
            isActive
          ) as `#${string}`
        }
        name={icon}
        size={size}
        {...iconProps}
      />
    </IconButtonStyle>
  );
};

export const IconButtonStyle = styled.button<
  Omit<IconButtonProps, "icon" | "onClick">
>`
  ${BaseMixin}

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  transition: all 0.2s ease-in-out;

  ${({ theme, disabled }) => `
    cursor: ${disabled ? "no-drop" : "pointer"};
  `}

  ${({ theme, disableInteraction }) =>
    !disableInteraction &&
    `
      &:hover {
        background-color: ${theme.colors.background.default};
      }
      &:active {
        background-color: ${theme.colors.background.dark};
      }
    `}

  ${({ variant, theme, disabled }) => variantStyle({ variant, theme, disabled })}
`;

const variantStyle = ({
  variant,
  theme,
  disabled,
}: {
  variant?: VariantUiType;
  theme: DefaultTheme;
  disabled?: boolean;
}) => {
  if (variant === "outlined")
    return `
      background-color: ${
        disabled ? theme.colors.background.dark : "transparent"
      };
      border: 1px solid ${
        disabled ? theme.colors.background.dark : theme.colors.border.default
      };
    `;
  return `
    background-color: transparent;
  `;
};


export default IconButton;
