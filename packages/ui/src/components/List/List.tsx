import { ReactNode } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import Divider from "../Divider/Divider"
import Icon from "../Icon/Icon"
import { IconName } from "../Icon/icon-loader"
import CheckBoxGroup, { CheckBoxProps } from "../CheckBoxGroup/CheckBoxGroup"
import Avatar, { AvatarProps } from "../Avatar/Avatar"
import IconButton, { IconButtonProps } from "../IconButton/IconButton"
import SwitchButton from "../SwitchButton/SwitchButton"
import Label from "../Label/Label"

type IconItem = {
  type: "Icon"
  props: {
    name: IconName
    size?: number | string
    color?: string
  }
}

type AvatarItem = {
  type: "Avatar"
  props: AvatarProps
}

type SimpleCheckBoxConfig = {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  disabled?: boolean
}

type CheckBoxItem = {
  type: "CheckBox"
  props: CheckBoxProps | SimpleCheckBoxConfig
}

type IconButtonItem = {
  type: "IconButton"
  props: IconButtonProps
}

type SwitchItem = {
  type: "Switch"
  props: {
    checked: boolean
    label: string
    disabled?: boolean
    onChange: () => void
  }
}

type ListItemRenderConfig = IconItem | AvatarItem | CheckBoxItem | IconButtonItem | SwitchItem

export type ListItemProps = BaseMixinProps & {
  label: string
  startItem?: ListItemRenderConfig[]
  endItem?: ListItemRenderConfig[]
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  separator?: boolean
}

export type ListProps = BaseMixinProps & {
  items: ListItemProps[]
  dense?: boolean
  disablePadding?: boolean
  title?: string
  separator?: boolean
}

// * ListItemRenderConfig 타입에 따라 실제 렌더링 컴포넌트를 분기
const renderItem = (item: ListItemRenderConfig): ReactNode => {
  switch (item.type) {
    case "Icon":
      return <Icon size={15} mr="16px" color="inherit" {...item.props} />

    case "Avatar":
      return <Avatar mr="10px" {...item.props} />

    case "CheckBox": {
      const props = item.props

      if ("data" in props) {
        return <CheckBoxGroup {...props} />
      }

      const value = props.checked ? ["__single__"] : []

      return (
        <CheckBoxGroup
          value={value}
          onChange={(values) => props.onChange(values.length > 0)}
          data={[
            {
              text: props.label,
              value: "__single__",
            },
          ]}
          disabled={props.disabled}
        />
      )
    }

    case "IconButton":
      return <IconButton {...item.props} />

    case "Switch":
      return <SwitchButton {...item.props} />

    default:
      return null
  }
}
/**---------------------------------------------------------------------------/

* ! List
*
* * 다양한 UI 요소를 조합하여 렌더링하는 리스트 컴포넌트
* * 아이템 단위(ListItem)로 구성되며 start / end 영역 확장 지원
* * Icon, Avatar, CheckBox, IconButton, Switch 등 복합 렌더링 지원
* * items 배열 기반 렌더링 구조
* * dense / disablePadding 옵션으로 리스트 밀도 및 여백 제어
* * 리스트 타이틀(label) 표시 지원
* * 아이템 단위 선택 상태(selected) 및 비활성화(disabled) 처리
* * 클릭 가능 아이템에 hover / cursor 스타일 적용
* * 아이템 사이 Divider 분리선 옵션 제공
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상, 간격, 상태 스타일 시스템 활용

* @module List
* 복합적인 메뉴, 설정 목록, 선택 리스트 등을 구성하기 위한 리스트 컴포넌트입니다.
* - List는 전체 컨테이너 역할, ListItem은 개별 항목 역할
* - startItem / endItem을 통해 아이콘, 컨트롤 UI 자유 조합
* - separator 옵션으로 항목 간 구분선 제어
* - 렌더러 패턴을 사용해 아이템 타입별 UI 분기 처리
*
* @usage
* <List items={items} />
* <List items={items} dense title="Settings" />
* <List items={items} separator={false} />

/---------------------------------------------------------------------------**/

export const List = ({
  items,
  dense = false,
  disablePadding = false,
  title,
  separator = true,
  ...others
}: ListProps) => {
  return (
    <StyledList dense={dense} disablePadding={disablePadding} {...others}>
      {title && (
        <Label text={title} p={disablePadding ? "0" : dense ? "4px 16px" : "8px 16px"} mb="8px" />
      )}

      {items.map((item, index) => {
        // * 마지막 아이템 여부에 따라 Divider 렌더링 제어
        const isLast = index === items.length - 1

        return (
          <Box key={`${item.label}-${index}`}>
            <ListItem {...item} />
            {!isLast && (item.separator ?? separator) && <Divider />}
          </Box>
        )
      })}
    </StyledList>
  )
}

export const ListItem = ({
  label,
  startItem,
  endItem,
  selected = false,
  disabled = false,
  onClick,
  ...others
}: ListItemProps) => {
  // * 클릭 가능 여부 판단
  const clickable = !!onClick && !disabled

  return (
    <StyledListItem
      selected={selected}
      disabled={disabled}
      clickable={clickable}
      onClick={clickable ? onClick : undefined}
      {...others}
    >
      {startItem && (
        <Flex align="center" gap="8px">
          {startItem.map((item, index) => (
            <ItemWrapper key={index}>{renderItem(item)}</ItemWrapper>
          ))}
        </Flex>
      )}

      <Typography
        text={label}
        variant="h1"
        color={disabled ? theme.colors.text.disabled : theme.colors.text.primary}
        sx={{ flex: 1 }}
      />

      {endItem && (
        <Flex align="center" gap="8px">
          {endItem.map((item, index) => (
            <ItemWrapper key={index}>{renderItem(item)}</ItemWrapper>
          ))}
        </Flex>
      )}
    </StyledListItem>
  )
}

const StyledList = styled(Flex)<{ dense: boolean; disablePadding: boolean }>`
  flex-direction: column;
  padding: ${({ disablePadding, dense }) => (disablePadding ? "0" : dense ? "4px 0" : "8px 0")};
  background-color: ${({ theme }) => theme.colors.grayscale[50]};
`

const StyledListItem = styled(Flex)<{
  selected: boolean
  disabled: boolean
  clickable: boolean
}>`
  padding: 12px 16px;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  background-color: ${({ selected }) => (selected ? theme.colors.primary[50] : "transparent")};
  align-items: center;

  &:hover {
    background-color: ${({ clickable }) =>
      clickable ? theme.colors.grayscale[50] : "transparent"};
  }
`

const ItemWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`

export default List
