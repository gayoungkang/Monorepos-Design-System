import { JSX } from "react"
import Button from "../../Button/Button"
import TextField from "../../TextField/TextField"
import { Typography } from "../../Typography/Typography"
import type { ColumnProps } from "../@Types/table"
import { theme } from "../../../tokens/theme"
import { CheckBox } from "../../CheckBoxGroup/CheckBoxGroup"
/**---------------------------------------------------------------------------/
 *
 * ! TableCell(Renderers)
 *
 * * Table 컬럼 정의(ColumnProps)를 기반으로 셀 컨텐츠를 일관된 규칙으로 렌더링하는 유틸 모음
 * * 렌더 우선순위: Custom Renderer → Disabled Renderer → type(TextField/CheckBox/Button/Default)
 *
 * * renderDisabledCell
 *   * disabled 상태에서 값을 읽기 전용 텍스트로 표시
 *   * 값이 없으면 "-"로 대체하고, disabled 컬러를 적용
 *
 * * getColumnTypeSafe
 *   * column.type이 undefined인 케이스를 보정하여 "Default"로 폴백
 *   * ColumnProps<T>["type"]를 NonNullable로 안전하게 반환
 *
 * * getCustomRenderer
 *   * 컬럼별 커스텀 셀 렌더러를 유연하게 탐색
 *   * 우선순위: renderCustomCell → render → renderCell
 *   * (타입 정의가 달라서 생기는 호환 이슈를 흡수하기 위해 any 캐스팅을 사용)
 *
 * * renderCustomCell
 *   * 커스텀 렌더러가 존재하면 호출하고, 없으면 null 반환
 *   * (data, index, disabled?) 시그니처를 통일해 전달
 *
 * * renderCell
 *   * 최종 셀 렌더 진입점
 *   * rowIndex를 숫자로 보정(Number.isFinite)하여 안정적으로 onChange에 전달
 *   * custom 렌더가 있으면 최우선 반환
 *   * disabled=true 이면 renderDisabledCell로 강제 렌더(입력 컴포넌트/액션 차단)
 *   * type 분기:
 *     - TextField: value 문자열 보정 후 column.onChange로 변경 값 전달
 *     - CheckBox: Boolean 값 보정 후 column.onChange로 변경 값 전달
 *     - Button: 표시 텍스트 폴백("Action") 및 column.onClick 호출 위임
 *     - Default: 일반 텍스트 렌더("-" 폴백)
 *
 * @module TableCell
 * 컬럼 정의 기반 셀 렌더링 규칙을 제공하며, 커스텀 렌더/disabled 처리/type 분기를 표준화합니다.
 *
/---------------------------------------------------------------------------**/

export const renderDisabledCell = (value: any): JSX.Element => {
  return (
    <Typography
      variant="b1Regular"
      text={value ? String(value) : "-"}
      color={theme.colors.text.disabled}
    />
  )
}

// * ColumnProps.type이 undefined일 수 있는 케이스를 안전하게 Default로 보정
const getColumnTypeSafe = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
): NonNullable<ColumnProps<T>["type"]> => {
  return (column.type ?? "Default") as NonNullable<ColumnProps<T>["type"]>
}

// * 커스텀 렌더 함수 키를 유연하게 지원(renderCustomCell/render/renderCell 우선순위)
const getCustomRenderer = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
): ((data: T, index: number, disabled?: boolean) => JSX.Element | null) | null => {
  const anyCol = column as any
  const fn =
    (typeof anyCol.renderCustomCell === "function" && anyCol.renderCustomCell) ||
    (typeof anyCol.render === "function" && anyCol.render) ||
    (typeof anyCol.renderCell === "function" && anyCol.renderCell)

  return typeof fn === "function" ? fn : null
}

// * column에 정의된 커스텀 렌더러가 있으면 우선 적용
export const renderCustomCell = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
  data: T,
  index: number,
  disabled?: boolean,
): JSX.Element | null => {
  const renderer = getCustomRenderer(column)
  if (!renderer) return null
  return renderer(data, index, disabled)
}

export const renderCell = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
  data: T,
  index: number,
  disabled?: boolean,
): JSX.Element => {
  const rowIndex = Number.isFinite(index) ? index : 0
  const type = getColumnTypeSafe(column)

  // * custom render 우선
  const custom = renderCustomCell(column, data, rowIndex, disabled)
  if (custom) return custom

  // * disabled cell 렌더(입력 컴포넌트 대신 텍스트로 고정)
  if (disabled) return renderDisabledCell((data as any)[column.key as any])

  // * type 분기
  if (type === "TextField") {
    return (
      <TextField
        value={String((data as any)[column.key as any] ?? "")}
        onChange={(e) =>
          column.onChange?.({
            key: column.key as any,
            rowIndex,
            type,
            changeValue: e.target.value,
          } as any)
        }
      />
    )
  }

  if (type === "CheckBox") {
    return (
      <CheckBox
        checked={Boolean((data as any)[column.key as any])}
        onChange={(checked) =>
          column.onChange?.({
            key: column.key as any,
            rowIndex,
            type,
            changeValue: checked,
          } as any)
        }
      />
    )
  }

  if (type === "Button") {
    return (
      <Button
        text={String((data as any)[column.key as any] ?? "Action")}
        onClick={() => (column as any).onClick?.(data, rowIndex)}
        disabled={disabled}
        variant="text"
        color="primary"
      />
    )
  }

  // * Default 및 기타 타입은 텍스트로 표시
  return <Typography variant="b1Regular" text={String((data as any)[column.key as any] ?? "-")} />
}
