import { useMemo, useRef, useState } from "react"
import Flex from "../../Flex/Flex"
import Popper from "../../Popper/Popper"
import IconButton from "../../IconButton/IconButton"
import Menu from "../../Menu/Menu"

export type DefaultExportType = "excel" | "csv" | "pdf" | "print"
export type ExportType<TExtra extends string = never> = DefaultExportType | TExtra

export type ExportItem<TType extends string = DefaultExportType> = {
  type: TType
  label: string
  disabled?: boolean
}

export type TableExportProps<TExtraExportType extends string = never> = {
  disabled?: boolean

  exportEnabled?: boolean
  exportItems?: ExportItem<ExportType<TExtraExportType>>[]
  defaultExportTypes?: DefaultExportType[]
  excludeExportTypes?: ExportType<TExtraExportType>[]
  onExport?: (type: ExportType<TExtraExportType>) => void

  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void

  toolTip?: string
  icon?: any

  onBeforeOpen?: () => void
}

const DEFAULT_EXPORT_ITEMS: ExportItem<DefaultExportType>[] = [
  { type: "excel", label: "Excel 다운로드" },
  { type: "csv", label: "CSV 다운로드" },
  { type: "pdf", label: "PDF 다운로드" },
  { type: "print", label: "프린트" },
]
/**---------------------------------------------------------------------------/

* ! TableExport
*
* * 테이블 데이터 내보내기(export) 메뉴를 제공하는 툴바용 컴포넌트
* * IconButton 클릭 시 Popper 기반 드롭다운 메뉴를 토글하여 export 타입 선택 지원
* * excel/csv/pdf/print 기본 타입(DefaultExportType) 및 추가 타입(제네릭) 확장 지원
* * exportItems를 직접 전달하거나, defaultExportTypes/excludeExportTypes 조합으로 기본 목록 필터링 지원
*
* * open 상태 제어
*   * open prop 제공 시 controlled 모드로 동작
*   * open prop 미제공 시 내부 상태(uncontrolledOpen)로 동작
*   * defaultOpen으로 uncontrolled 초기값 설정
*   * onOpenChange로 상태 변경 이벤트 외부 통지
*
* * 활성화 조건
*   * exportEnabled && onExport 존재 && !disabled 인 경우에만 메뉴 오픈 가능
*   * canExportOpen=false이면 toggle/setOpenSafe가 모두 무시됨
*
* * 메뉴 아이템 구성
*   * exportItems가 있으면 그대로 사용
*   * 없으면 DEFAULT_EXPORT_ITEMS에서 defaultExportTypes(허용) + excludeExportTypes(제외)로 필터링
*   * 아이템 자체 disabled=true면 클릭 동작 차단
*
* * 오픈 훅
*   * onBeforeOpen: 메뉴를 열기 직전에 외부 팝오버/드로어 등을 닫기 위한 훅 제공
*
* * UI 구성
*   * IconButton을 anchorRef로 참조하여 Popper 위치 기준으로 사용
*   * placement="bottom-end", offsetY=8로 메뉴 위치 고정
*   * Menu 클릭 시 onExport(type) 호출 후 close 처리
*
* @module TableExport
* 테이블 내보내기 기능을 위한 아이콘 버튼 + 팝오버 메뉴 컴포넌트입니다.
* - export 타입을 선택하면 onExport 콜백으로 선택된 타입을 전달합니다.
* - controlled/uncontrolled 오픈 상태를 모두 지원합니다.
*
* @usage
* <TableExport onExport={(type) => ...} />
* <TableExport exportItems={[{ type:"excel", label:"Excel" }]} excludeExportTypes={["pdf"]} />
* <TableExport open={open} onOpenChange={setOpen} onBeforeOpen={closeOther} />

/---------------------------------------------------------------------------**/
const TableExport = <TExtraExportType extends string = never>({
  disabled,

  exportEnabled = true,
  exportItems,
  defaultExportTypes = ["excel", "csv", "pdf", "print"],
  excludeExportTypes,
  onExport,

  open,
  defaultOpen = false,
  onOpenChange,

  toolTip = "내보내기",
  icon = "Download",

  onBeforeOpen,
}: TableExportProps<TExtraExportType>) => {
  // * open prop 유무로 controlled/uncontrolled 모드 결정
  const isControlled = open !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const effectiveOpen = isControlled ? Boolean(open) : uncontrolledOpen

  // * Popper anchor로 사용할 버튼 ref
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  // * 내보내기 메뉴를 열 수 있는 조건(exportEnabled + onExport 존재 + disabled 아님)
  const canExportOpen = useMemo(
    () => Boolean(exportEnabled && onExport && !disabled),
    [exportEnabled, onExport, disabled],
  )

  // * exportItems가 없으면 defaultExportTypes/excludeExportTypes 기반으로 기본 아이템 생성
  const exportMenuItems = useMemo(() => {
    if (exportItems && exportItems.length) return exportItems

    const allow = new Set<DefaultExportType>(defaultExportTypes ?? ["excel", "csv", "pdf", "print"])
    const excluded = new Set<ExportType<TExtraExportType>>(excludeExportTypes ?? [])
    return DEFAULT_EXPORT_ITEMS.filter((it) => allow.has(it.type) && !excluded.has(it.type as any))
  }, [exportItems, defaultExportTypes, excludeExportTypes])

  // * open 상태 변경을 controlled/uncontrolled 모두에서 안전하게 처리
  const setOpenSafe = (next: boolean) => {
    if (!canExportOpen) return
    if (isControlled) {
      onOpenChange?.(next)
      return
    }
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  // * 버튼 클릭 시 open 토글(열릴 때 onBeforeOpen 호출)
  const toggle = () => {
    if (!canExportOpen) return
    if (!effectiveOpen) onBeforeOpen?.()
    setOpenSafe(!effectiveOpen)
  }

  // * 메뉴 닫기 헬퍼
  const close = () => setOpenSafe(false)

  return (
    <Flex align="center" gap={6}>
      <IconButton
        icon={icon}
        disabled={disabled}
        disableInteraction={false}
        toolTip={toolTip}
        onClick={toggle}
        ref={(node: any) => {
          anchorRef.current = node
        }}
      />

      {effectiveOpen && !!anchorRef.current && (
        <Popper open anchorRef={anchorRef as any} placement="bottom-end" offsetY={8}>
          {exportMenuItems.map((it) => (
            <Menu
              key={String(it.type)}
              text={it.label}
              onClick={() => {
                // * 비활성/disabled 항목은 실행하지 않고, 실행 후에는 메뉴를 닫음
                if (!canExportOpen) return
                if (it.disabled) return
                onExport?.(it.type as any)
                close()
              }}
            />
          ))}
        </Popper>
      )}
    </Flex>
  )
}

export default TableExport
