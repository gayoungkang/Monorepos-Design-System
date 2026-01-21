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
  defaultExportTypes?: DefaultExportType[]
  excludeExportTypes?: ExportType<TExtraExportType>[]
  onExport?: (type: ExportType<TExtraExportType>) => void
  onBeforeOpen?: () => void
}

const DEFAULT_ITEMS: ExportItem<DefaultExportType>[] = [
  { type: "excel", label: "Excel" },
  { type: "csv", label: "CSV" },
  { type: "pdf", label: "PDF" },
  { type: "print", label: "Print" },
]
/**---------------------------------------------------------------------------/
 *
 * ! TableExport
 *
 * * 테이블 툴바에서 내보내기(Export) 메뉴를 Popper로 제공하는 컴포넌트
 * * exportEnabled=false 인 경우 렌더링하지 않음(null 반환)
 * * IconButton(Download) 클릭으로 Popper 메뉴를 열고/닫음
 * * 열림 시 onBeforeOpen 훅을 1회 호출(닫힘→열림 전환 시점)
 * * disabled=true 인 경우 오픈/클릭/내보내기 동작을 모두 차단
 *
 * * Export 아이템 구성 규칙
 *   * exportItems가 존재하면 해당 목록을 그대로 사용
 *   * 없으면 DEFAULT_ITEMS에서 defaultExportTypes에 포함된 타입만 허용
 *   * excludeExportTypes가 있으면 최종 목록에서 제외 처리
 *
 * * 동작
 *   * 항목 클릭 시 onExport(type) 호출 후 Popper를 닫음(setOpen(false))
 *   * Popper는 anchorRef를 기준으로 bottom-end에 표시
 *
 * * UI 구성
 *   * Trigger: IconButton (Download)
 *   * Panel: Popper 내부 Flex(column)
 *     - 제목(Typography) + 항목 리스트(Button: text/normal)
 *
 * @module TableExport
 * 테이블 데이터 내보내기 메뉴를 제공합니다.
 * - 기본 타입(excel/csv/pdf/print)을 지원하며, 커스텀 타입 확장이 가능합니다.
 * - 항목 구성은 exportItems 또는 defaultExportTypes/excludeExportTypes로 제어합니다.
 *
 * @usage
 * <TableExport
 *   exportEnabled
 *   onExport={(type) => console.log(type)}
 *   onBeforeOpen={() => closeOtherPanels()}
 * />
 *
 * <TableExport
 *   defaultExportTypes={["excel", "csv"]}
 *   excludeExportTypes={["csv"]}
 * />
 *
/---------------------------------------------------------------------------**/

const TableExport = <TExtraExportType extends string = never>({
  disabled,
  exportEnabled = true,
  exportItems,
  defaultExportTypes = ["excel", "csv", "pdf", "print"],
  excludeExportTypes,
  onExport,
  onBeforeOpen,
}: TableExportProps<TExtraExportType>) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  // * exportItems 우선, 없으면 defaultExportTypes 기준으로 DEFAULT_ITEMS 필터링
  const items = useMemo(() => {
    if (exportItems?.length) return exportItems
    const allow = new Set(defaultExportTypes)
    return DEFAULT_ITEMS.filter((it) => allow.has(it.type))
  }, [exportItems, defaultExportTypes])

  // * excludeExportTypes가 있으면 최종 items에서 제외 처리
  const filteredItems = useMemo(() => {
    if (!excludeExportTypes?.length) return items
    const ex = new Set(excludeExportTypes)
    return items.filter((it) => !ex.has(it.type as any))
  }, [items, excludeExportTypes])

  // * exportEnabled 비활성 시 컴포넌트 렌더링 제거
  if (!exportEnabled) return null

  // * Export Popper 토글 핸들러(열기 직전 onBeforeOpen 실행)
  const toggle = () => {
    if (disabled) return
    if (!open) onBeforeOpen?.()
    setOpen((v) => !v)
  }

  // * Export 아이템 클릭 핸들러(콜백 실행 후 Popper 닫기)
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
