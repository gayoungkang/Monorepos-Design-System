import { JSX, ReactNode, useRef, useState } from "react"
import { Typography } from "../../Typography/Typography"
import type { ColumnProps } from "../@Types/table"
import { theme } from "../../../tokens/theme"
import { Tooltip } from "../../Tooltip/Tooltip"

/**---------------------------------------------------------------------------/
 *
 * ! TableCell (renderCell / OverflowTooltipText)
 *
 * * 셀 텍스트가 overflow(ellipsis)로 잘릴 때만 Tooltip으로 전체 값을 노출하는 렌더 유틸
 * * 기본 렌더는 OverflowTooltipText를 사용해 단일 라인 ellipsis 처리
 * * 마우스 진입 시(scrollWidth/Height vs clientWidth/Height)로 overflow 여부를 계산해
 *   overflow인 경우에만 Tooltip을 open 상태로 렌더링
 *
 * * OverflowTooltipText
 *   * ref로 span 엘리먼트 치수를 측정하여 overflow 여부 판단
 *   * open=true일 때만 Tooltip(content=text)로 감싸 렌더(불필요한 Tooltip 최소화)
 *   * Typography는 block + ellipsis 스타일로 단일 라인 잘림 처리
 *   * disabled=true면 텍스트 컬러를 disabled 컬러로 렌더
 *
 * * renderDisabledCell
 *   * 값이 undefined/null/"" 이면 "-"로 치환
 *   * disabled 스타일(색상) + overflow 시 Tooltip 노출을 동일하게 적용
 *
 * * renderCell
 *   * index 안전 처리(Number.isFinite 기반)로 rowIndex 보정
 *   * column.render(data, rowIndex, { disabled }) 커스텀 렌더가 있으면 우선 사용
 *   * 커스텀 렌더가 없으면 row[column.key] 값을 문자열로 변환 후 "-" 치환
 *   * disabled=true면 renderDisabledCell, 아니면 기본 OverflowTooltipText로 렌더
 *
 * @module TableCell
 * 테이블 셀의 기본 텍스트 렌더링을 제공하며, ellipsis 발생 시에만 Tooltip으로 전체 값을 노출합니다.
 *
 * @usage
 * // 기본
 * renderCell(column, row, index, disabled)
 *
 * // 커스텀
 * column.render = (row, idx, ctx) => <Custom disabled={ctx.disabled} />
 *
/---------------------------------------------------------------------------**/

type OverflowTooltipTextProps = {
  text: string
  disabled?: boolean
}

const OverflowTooltipText = ({ text, disabled }: OverflowTooltipTextProps): JSX.Element => {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [open, setOpen] = useState(false)

  // * 마우스 진입 시 실제 overflow 여부를 계산해 Tooltip 오픈 상태를 갱신
  const onEnter = () => {
    const el = ref.current
    if (!el) return
    const isOverflow = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1
    setOpen(isOverflow)
  }

  // * 마우스 이탈 시 Tooltip을 닫음
  const onLeave = () => setOpen(false)

  const content = (
    <Typography
      variant="b1Regular"
      text={text}
      color={disabled ? theme.colors.text.disabled : theme.colors.text.primary}
      sx={{
        display: "block",
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    />
  )

  return (
    <span
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ display: "block", width: "100%", minWidth: 0, maxWidth: "100%" }}
    >
      {open ? <Tooltip content={text}>{content}</Tooltip> : content}
    </span>
  )
}

// * disabled 셀 전용: 값이 비어있으면 "-"로 치환 후 overflow-tooltip 텍스트로 렌더
export const renderDisabledCell = (value: any): JSX.Element => {
  const txt = value === undefined || value === null || value === "" ? "-" : String(value)
  return <OverflowTooltipText text={txt} disabled />
}

export const renderCell = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
  data: T,
  index: number,
  disabled?: boolean,
): JSX.Element => {
  const rowIndex = Number.isFinite(index) ? index : 0
  const isDisabled = Boolean(disabled)

  // * column.render(커스텀 렌더)가 있으면 우선 적용(값이 null/undefined가 아니면 그대로 사용)
  const custom = column.render?.(data, rowIndex, { disabled: isDisabled }) as ReactNode
  if (custom !== undefined && custom !== null) {
    return <>{custom}</>
  }

  // * 기본 값 렌더: undefined/null/빈문자열은 "-"로 정규화
  const raw = (data as any)?.[column.key as any]
  const text = raw === undefined || raw === null || raw === "" ? "-" : String(raw)

  // * disabled 셀은 비활성 컬러로, 그 외는 기본 컬러로 overflow-tooltip 텍스트 렌더
  if (isDisabled) return renderDisabledCell(text)
  return <OverflowTooltipText text={text} disabled={false} />
}
