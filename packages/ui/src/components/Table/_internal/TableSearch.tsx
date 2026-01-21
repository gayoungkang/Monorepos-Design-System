import { useEffect, useRef, useState } from "react"
import Divider from "../../Divider/Divider"
import IconButton from "../../IconButton/IconButton"
import TextField from "../../TextField/TextField"
import { styled } from "../../../tokens/customStyled"

export type TableSearchProps = {
  disabled?: boolean
  searchEnabled?: boolean
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  onBeforeOpen?: () => void
}
/**---------------------------------------------------------------------------/
 *
 * ! TableSearch
 *
 * * 테이블 툴바에서 검색 입력 UI를 토글로 제공하는 컴포넌트
 * * searchEnabled=false 인 경우 렌더링하지 않음(null 반환)
 * * IconButton 클릭으로 검색 입력 영역(SearchSlot)을 열고/닫음
 * * 열림 시 onBeforeOpen 훅을 1회 호출(닫힘→열림 전환 시점)
 * * open 상태일 때 requestAnimationFrame 기반으로 입력 포커스 처리
 *   (disabled 상태에서는 포커스/오픈 동작을 차단)
 * * 외부 제어값(searchValue) 기반 controlled 입력을 사용하며
 *   onSearchChange로 입력 문자열을 상위로 전달
 *
 * * 애니메이션 레이아웃
 *   * SearchSlot: width(0px ↔ 280px) 트랜지션으로 슬롯 확장/축소
 *   * SearchInner: scaleX/opacity 트랜지션으로 부드러운 등장 효과
 *
 * @module TableSearch
 * 테이블 검색을 위한 토글형 입력 영역을 제공합니다.
 * - 검색 버튼 클릭 시 입력 필드가 확장되며, 자동 포커스를 적용합니다.
 * - 값은 searchValue로 제어하고, 변경은 onSearchChange로 전달합니다.
 *
 * @usage
 * <TableSearch
 *   searchEnabled
 *   searchValue={q}
 *   onSearchChange={setQ}
 *   onBeforeOpen={() => closeOtherPanels()}
 * />
 *
 * <TableSearch disabled searchEnabled />
 *
/---------------------------------------------------------------------------**/

const TableSearch = ({
  disabled,
  searchEnabled = true,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onBeforeOpen,
}: TableSearchProps) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  // * 검색창 오픈 시(비활성 제외) 다음 프레임에 입력 포커스 적용
  useEffect(() => {
    if (!searchOpen || disabled) return
    const id = requestAnimationFrame(() => {
      ;(searchInputRef.current as any)?.focus?.()
    })
    return () => cancelAnimationFrame(id)
  }, [searchOpen, disabled])

  // * disabled=true 또는 searchEnabled=false 시 검색 UI 비노출
  if (!searchEnabled || disabled) return null

  return (
    <>
      <Divider direction="vertical" height={17} thickness="1px" />
      <IconButton
        icon="SearchLine"
        disabled={disabled}
        disableInteraction={false}
        toolTip="검색"
        onClick={() => {
          if (disabled) return
          if (!searchOpen) onBeforeOpen?.()
          setSearchOpen((v) => !v)
        }}
      />

      <SearchSlot $open={searchOpen}>
        <SearchInner $open={searchOpen}>
          <TextField
            ref={searchInputRef as any}
            autoFocus={searchOpen}
            disabled={disabled}
            value={searchValue ?? ""}
            placeholder={searchPlaceholder ?? "검색"}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{ width: 280 }}
          />
        </SearchInner>
      </SearchSlot>
    </>
  )
}

const SearchSlot = styled.div<{ $open: boolean }>`
  width: ${({ $open }) => ($open ? "280px" : "0px")};
  overflow: hidden;
  transition: width 200ms cubic-bezier(0.2, 0.9, 0.2, 1);
  will-change: width;
`

const SearchInner = styled.div<{ $open: boolean }>`
  transform-origin: left center;
  transform: ${({ $open }) => ($open ? "scaleX(1)" : "scaleX(0.92)")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition:
    transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 140ms ease;
  will-change: transform, opacity;
`

export default TableSearch
