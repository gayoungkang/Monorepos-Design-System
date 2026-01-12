import { ReactNode } from "react"
import { ColumnProps } from "./@Types/table"
import Button from "../Button/Button"
import TextField from "../TextField/TextField"
import { CheckBox } from "../CheckBoxGroup/CheckBoxGroup"
import Link from "../Link/Link"
import Accordion from "../Accordion/Accordion"
/**---------------------------------------------------------------------------/

* ! renderCell
*
* * 테이블 셀 렌더링을 담당하는 공통 유틸 함수
* * ColumnProps 설정(type / key / disabled / onChange 등)에 따라 셀 UI 분기 처리
* * rowIndex 기반으로 변경 이벤트 정보 구성 및 전달
* * disabled 상태는 테이블/컬럼 단위 조건을 병합하여 계산
*
* * 지원 타입
*   * Button      : Button 컴포넌트 렌더링
*   * TextField   : 문자열 값 편집 및 onChange 이벤트 전달
*   * CheckBox    : boolean 값 토글 및 onChange 이벤트 전달
*   * Accordion   : summary/details 렌더링 및 기본 확장 옵션 지원
*
* * 우선순위
*   * column.renderCustomCell 존재 시 최우선 렌더링
*   * column.type 기반 컴포넌트 렌더링
*   * key === "custom" && onClick 존재 시 Link 렌더링
*   * 그 외 기본 값(value) 또는 "-" 표시
*
* * 이벤트 처리
*   * disabled 상태에서는 onChange / onClick 콜백 차단
*   * TextField / CheckBox 변경 시 rowIndex, key, type, changeValue 포함 payload 전달
*
* @module TableCell
* 테이블 컬럼 정의(ColumnProps)에 따라 각 셀의 UI와 동작을 결정하는 렌더링 유틸입니다.
*
* @usage
* renderCell(column, rowData, rowIndex, disabled)
*
/---------------------------------------------------------------------------**/

export const renderCell = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
  d: T,
  rowIndex?: number,
  disabled?: boolean,
): ReactNode => {
  const key = column.key
  const value = d[key as keyof T]
  const safeRowIndex = rowIndex ?? 0

  // * 컬럼 단위 disabled 조건(function | boolean)을 row 데이터 기준으로 계산
  const columnDisabled =
    typeof column.disabled === "function" ? column.disabled(d) : Boolean(column.disabled)

  // * 외부 disabled + 컬럼 disabled를 병합
  const isDisabled = Boolean(disabled || columnDisabled)

  // * 컬럼에서 커스텀 셀 렌더러를 제공한 경우 최우선 사용
  if (column.renderCustomCell) return column.renderCustomCell(d)

  // * 컬럼 타입에 따른 기본 셀 렌더링 분기
  switch (column.type) {
    case "Button":
      return <Button text={column.title} disabled={isDisabled} />

    case "TextField":
      return (
        <TextField
          disabled={isDisabled}
          value={typeof value === "string" ? value : ""}
          onChange={
            isDisabled
              ? undefined
              : (event) =>
                  column.onChange?.({
                    rowIndex: safeRowIndex,
                    type: "TextField",
                    changeValue: event.target.value,
                    key: key as keyof T,
                  })
          }
        />
      )

    case "CheckBox": {
      const checked = Boolean(value)
      return (
        <CheckBox
          disabled={isDisabled}
          checked={checked}
          onChange={
            isDisabled
              ? undefined
              : (next: boolean) =>
                  column.onChange?.({
                    rowIndex: safeRowIndex,
                    type: "CheckBox",
                    changeValue: next,
                    key: key as keyof T,
                  })
          }
        />
      )
    }

    case "Accordion": {
      const summary = column.renderAccordionSummary?.(d) ?? "-"
      const details = column.renderAccordionDetails?.(d) ?? null

      return (
        <Accordion
          summary={summary}
          disabled={isDisabled}
          defaultExpanded={Boolean(column.accordionDefaultExpanded)}
        >
          {details}
        </Accordion>
      )
    }
  }

  // * custom 컬럼 + onClick 조합일 경우 링크 셀로 렌더링
  if (key === "custom" && column.onClick) {
    return (
      <Link
        disabled={isDisabled}
        children={column.renderCellTitle ? column.renderCellTitle : column.title}
        onClick={
          isDisabled
            ? undefined
            : () => {
                column.onClick?.(d, safeRowIndex)
              }
        }
      />
    )
  }

  // * 기본 fallback: 값이 있으면 그대로, 없으면 "-"
  return <>{(value as ReactNode) || "-"}</>
}
