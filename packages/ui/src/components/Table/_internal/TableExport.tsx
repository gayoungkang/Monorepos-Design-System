import { useMemo, useRef, useState } from "react"
import IconButton from "../../IconButton/IconButton"
import Popper from "../../Popper/Popper"
import Flex from "../../Flex/Flex"
import { Typography } from "../../Typography/Typography"
import Button from "../../Button/Button"
import { theme } from "../../../tokens/theme"

export type DefaultExportType = "excel" | "csv" | "pdf" | "print"
export type ExportType<TExtraExportType extends string = never> =
  | DefaultExportType
  | TExtraExportType

export type ExportItem<T extends string> = {
  type: T
  label: string
  icon?: string
}

export type TableExportProps<TExtraExportType extends string = never> = {
  disabled?: boolean
  exportEnabled?: boolean
  exportItems?: ExportItem<ExportType<TExtraExportType>>[]
  excludeExportTypes?: ExportType<TExtraExportType>[]
  onExport?: (type: ExportType<TExtraExportType>) => void
  onBeforeOpen?: () => void
}
/**---------------------------------------------------------------------------/
 *
 * ! TableExport
 *
 * * 테이블 툴바에서 내보내기(export) 메뉴를 Popper로 제공하는 컴포넌트
 * * exportEnabled=false 이면 렌더링하지 않음(null 반환)
 * * onExport가 없으면(인터랙션 불가) 렌더링하지 않음(null 반환)
 * * exportItems가 없거나(또는 필터링 결과가 비어 있으면) 렌더링하지 않음(null 반환)
 *
 * * 아이템 필터링
 *   * exportItems를 기준으로 excludeExportTypes 목록을 제외하여 filteredItems 생성
 *   * excludeExportTypes가 없으면 exportItems 그대로 사용
 *
 * * 토글 동작
 *   * IconButton(Download) 클릭 시 open 상태를 토글
 *   * 닫힘 → 열림 전환 시점에 onBeforeOpen 훅을 1회 호출
 *   * disabled=true 이면 토글 및 내보내기 실행을 차단
 *
 * * 내보내기 실행
 *   * 메뉴 버튼 클릭 시 onExport(type) 호출 후 Popper 닫기(open=false)
 *   * disabled=true 이면 실행을 차단
 *
 * * UI 구성
 *   * IconButton: 내보내기 트리거(앵커)
 *   * Popper: bottom-end 위치로 메뉴 표시
 *   * Button 리스트: filteredItems 기반으로 렌더(좌측 정렬 + 패딩 적용)
 *
 * @module TableExport
 * 툴바에서 내보내기 메뉴를 제공하며, 제외 타입 필터링 및 disabled/가드 조건을 포함합니다.
 *
 * @usage
 * <TableExport
 *   exportEnabled
 *   exportItems={[{ type: "csv", label: "CSV" }, { type: "excel", label: "Excel" }]}
 *   excludeExportTypes={["pdf"]}
 *   onExport={(type) => exportByType(type)}
 *   onBeforeOpen={() => closeOtherPanels()}
 * />
 *
/---------------------------------------------------------------------------**/

const TableExport = <TExtraExportType extends string = never>({
  disabled,
  exportEnabled = true,
  exportItems,
  excludeExportTypes,
  onExport,
  onBeforeOpen,
}: TableExportProps<TExtraExportType>) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  // * excludeExportTypes 기준으로 exportItems를 필터링하여 실제 노출 항목을 계산
  const filteredItems = useMemo(() => {
    const items = exportItems ?? []
    if (!excludeExportTypes?.length) return items
    const ex = new Set(excludeExportTypes)
    return items.filter((it) => !ex.has(it.type as any))
  }, [exportItems, excludeExportTypes])

  // * 내보내기 자체가 비활성/핸들러 없음/노출 항목 없음이면 렌더링하지 않음
  if (!exportEnabled) return null
  if (!onExport) return null
  if (!filteredItems.length) return null

  // * 버튼 클릭 시 팝오버를 토글하며, 열리는 순간에만 onBeforeOpen 훅을 호출
  const toggle = () => {
    if (disabled) return
    if (!open) onBeforeOpen?.()
    setOpen((v) => !v)
  }

  // * 항목 클릭 시 export 이벤트를 호출하고 팝오버를 닫음
  const handleExport = (type: ExportType<TExtraExportType>) => {
    if (disabled) return
    onExport?.(type)
    setOpen(false)
  }

  return (
    <Flex align="center" gap={6}>
      <IconButton
        ref={anchorRef as any}
        icon="Download"
        disabled={disabled}
        disableInteraction={false}
        toolTip="내보내기"
        onClick={toggle}
      />

      <Popper anchorRef={anchorRef} open={open} placement="bottom-end" width="auto" height="340px">
        <Flex
          direction="column"
          gap={10}
          p={12}
          sx={{ width: 220, background: theme.colors.grayscale.white }}
        >
          <Typography variant="b1Bold" text="내보내기" />

          <Flex direction="column" gap={8}>
            {filteredItems.map((it) => (
              <Button
                key={`export_${String(it.type)}`}
                text={it.label}
                variant="text"
                color="normal"
                onClick={() => handleExport(it.type)}
                sx={{ justifyContent: "flex-start", padding: "8px 10px" }}
              />
            ))}
          </Flex>
        </Flex>
      </Popper>
    </Flex>
  )
}

export default TableExport
