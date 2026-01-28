import { ReactNode } from "react"
import { useTheme } from "styled-components"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
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

      // * CheckBoxGroup 형태 (data 배열 보유)
      if ("data" in props && Array.isArray((props as any).data)) {
        return <CheckBoxGroup {...(props as CheckBoxProps)} />
      }

      // * 단일 체크박스 형태(SimpleCheckBoxConfig) → 내부적으로 CheckBoxGroup로 래핑
      const single = props as SimpleCheckBoxConfig
      const value = single.checked ? ["__single__"] : []

      return (
        <CheckBoxGroup
          value={value}
          onChange={(values) => single.onChange(values.length > 0)}
          data={[
            {
              text: single.label,
              value: "__single__",
            },
          ]}
          disabled={single.disabled}
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
 *
 * ! List / ListItem
 *
 * * 아이콘/아바타/체크박스/아이콘버튼/스위치 등의 프리셋 아이템을 조합해 렌더링하는 리스트 UI 컴포넌트
 * * `List`는 items 배열을 순회하며 `ListItem`을 렌더링하고, 필요 시 Divider로 항목 구분선을 자동 삽입
 * * `ListItem`은 startItem/endItem 구성에 따라 좌/우 보조 요소를 배치하고, 선택/비활성/클릭 가능 상태를 표현
 *
 * * 동작 규칙
 *   * 주요 분기 조건 및 처리 우선순위
 *     * `List`는 title이 있으면 상단에 Label을 먼저 렌더링
 *     * `List`는 각 item 렌더링 후, 마지막 항목이 아니고 separator가 활성인 경우에만 Divider를 렌더링
 *       * item.separator가 있으면 해당 값이 우선, 없으면 List의 separator 기본값을 사용
 *     * `ListItem`은 onClick이 있고 disabled가 아니면 clickable로 판단하여 button으로 렌더링
 *       * clickable: as="button" + type="button" + onClick 바인딩
 *       * non-clickable: as="div" + onClick 미바인딩
 *   * 이벤트 처리 방식
 *     * `ListItem`의 onClick은 clickable일 때만 실행(disabled면 실행되지 않음)
 *   * disabled 상태에서 차단되는 동작
 *     * disabled === true이면 clickable이 false가 되어 버튼 렌더링/클릭 동작이 차단됨
 *     * 시각적으로 opacity를 낮추고 텍스트 색상을 disabled 컬러로 전환
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 전체 구조
 *     * `List`는 Flex(column) 기반으로 ul 컨테이너를 구성
 *     * `ListItem`은 Flex(row) 기반으로 startItem / label / endItem을 한 줄에 배치
 *   * padding(dense/disablePadding)
 *     * List: disablePadding이면 0, 아니면 dense에 따라 4px/8px 상하 패딩 적용
 *     * title Label: disablePadding/dense 조합으로 padding 값을 분기 적용
 *   * 선택/호버/포커스
 *     * selected면 배경색을 primary[50]으로 표시
 *     * clickable일 때만 hover 배경색(grayscale[50]) 적용
 *     * focus-visible 시 outline(primary[200])을 적용
 *   * 아이템 렌더링 규칙(renderItem)
 *     * Icon: 기본 size=15, mr=16px, color=inherit
 *     * Avatar: mr=10px
 *     * CheckBox:
 *       * data 배열이 있으면 CheckBoxGroup 그대로 렌더링
 *       * 단일 체크박스(SimpleCheckBoxConfig)는 내부적으로 CheckBoxGroup로 래핑해 동일 UX로 제공
 *     * IconButton / Switch: 해당 컴포넌트를 그대로 렌더링
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택)
 *     * ListProps
 *       * items: 필수(ListItemProps 배열)
 *       * dense/disablePadding/title/separator: 리스트 레이아웃 및 구분선 기본 정책
 *     * ListItemProps
 *       * label: 필수(메인 텍스트)
 *       * startItem/endItem: 좌/우 보조 요소 배열(Icon/Avatar/CheckBox/IconButton/Switch)
 *       * selected/disabled/onClick: 상태/동작 제어
 *       * separator: 해당 아이템의 Divider 렌더링 여부(리스트 기본값 override)
 *   * 내부 계산 로직 요약
 *     * `renderItem`이 ListItemRenderConfig(type)에 따라 렌더링 컴포넌트를 분기
 *     * 단일 체크박스는 value 배열("__single__")을 사용해 CheckBoxGroup 시그니처로 변환
 *     * `clickable = !!onClick && !disabled`로 렌더링 태그(button/div) 및 상호작용 스타일을 결정
 *   * 클라이언트 제어 컴포넌트 (서버 제어 없음)
 *
 * @module List
 * 프리셋 아이템 조합(start/end)과 선택/비활성/구분선 정책을 지원하는 리스트 컴포넌트
 *
 * @usage
 * <List
 *   title="설정"
 *   items={[
 *     { label: "프로필", startItem: [{ type: "Avatar", props: { src: "..."} }] },
 *     { label: "알림", endItem: [{ type: "Switch", props: { checked: true, label: "", onChange: () => {} } }] },
 *   ]}
 * />
 *
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
    <StyledList as="ul" $dense={dense} $disablePadding={disablePadding} role="list" {...others}>
      {title && (
        <Label text={title} p={disablePadding ? "0" : dense ? "4px 16px" : "8px 16px"} mb="8px" />
      )}

      {items.map((item, index) => {
        // * 마지막 아이템 여부에 따라 Divider 렌더링 제어
        const isLast = index === items.length - 1

        return (
          <Box as="li" key={`${item.label}-${index}`} sx={{ listStyle: "none" }}>
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
  const theme = useTheme()

  // * 클릭 가능 여부 판단
  const clickable = !!onClick && !disabled

  return (
    <StyledListItem
      as={clickable ? "button" : "div"}
      type={clickable ? "button" : undefined}
      onClick={clickable ? onClick : undefined}
      $selected={selected}
      $disabled={disabled}
      $clickable={clickable}
      aria-disabled={disabled ? "true" : undefined}
      aria-pressed={clickable ? selected : undefined}
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

const StyledList = styled(Flex)<{ $dense: boolean; $disablePadding: boolean }>`
  flex-direction: column;
  padding: ${({ $disablePadding, $dense }) => ($disablePadding ? "0" : $dense ? "4px 0" : "8px 0")};
  background-color: ${({ theme }) => theme.colors.grayscale[50]};
`

const StyledListItem = styled(Flex)<{
  $selected: boolean
  $disabled: boolean
  $clickable: boolean
}>`
  padding: 12px 16px;
  width: 100%;
  border: none;
  text-align: left;

  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[50] : "transparent"};

  display: flex;
  align-items: center;

  &:hover {
    background-color: ${({ theme, $clickable }) =>
      $clickable ? theme.colors.grayscale[50] : "transparent"};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[200]};
    outline-offset: 2px;
  }
`

const ItemWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`

export default List
