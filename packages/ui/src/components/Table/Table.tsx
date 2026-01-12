import { JSX, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import Pagination from "../Pagination/Pagination"
import { Typography } from "../Typography/Typography"
import TableBody from "./TableBody"
import { SortDirection, TableProps } from "./@Types/table"
import TableContainer from "./TableContainer"
import TableHead from "./TableHead"
import TableRow from "./TableRow"
import TableTd from "./TableTd"
import TableTh from "./TableTh"
import TableTr from "./TableTr"
import Flex from "../Flex/Flex"
import ScrollBox from "../ScrollBox/ScrollBox"
import { renderCell } from "./TableCell"

/**---------------------------------------------------------------------------/

* ! Table
*
* * 제네릭 데이터(T) 기반의 테이블 렌더링 컴포넌트
* * columnConfig 기반 헤더/바디 구성 및 정렬(sort) UI 연동 지원
* * tableConfig(page/rowsPerPage/totalCount) 기반 페이지네이션 계산 및 표시 지원
* * page / rowsPerPage controlled/uncontrolled 모두 지원 (internal state fallback)
* * Pagination 컴포넌트와 연동하여 RowsPerPage/Table/Basic 타입 렌더링 지원
* * sticky 헤더(TableHead) 옵션 및 ScrollBox 기반 세로 스크롤(height) 지원
* * 데이터 0건일 때 emptyRowText 안내 행 렌더링
* * renderRow 커스터마이징 지원 (미지정 시 TableRow 기본 렌더링)
* * insertRowActive 상태일 때 삽입 행 렌더링 및 renderCell(disabled) 사용
* * innerRef(useImperativeHandle)로 insertRow/saveData imperative API 제공
* * disabled 상태 지원 (정렬/페이지 변경/rowsPerPage 변경/삽입 동작 차단)
*
* @module Table
* 컬럼 설정(columnConfig)과 데이터(data)를 기반으로 표 UI를 렌더링하는 Table 컴포넌트입니다.
* - `tableConfig`로 totalCount, page, rowsPerPage, rowsPerPageOptions를 제어할 수 있습니다.
* - page/rowsPerPage는 외부에서 제어(controlled)하거나 내부 상태로 관리(uncontrolled)할 수 있습니다.
* - 정렬은 각 컬럼의 sort/sortDirection/onSortChange 설정에 따라 TableTh 정렬 토글을 연동합니다.
* - pagination 옵션이 있으면 하단에 Pagination을 렌더링하며, 표 범위(from–to) 라벨을 계산합니다.
* - innerRef를 통해 insertRow()로 임시 입력 행을 노출하고, saveData()로 해제할 수 있습니다.
*
* @usage
* <Table tableKey="t1" columnConfig={cols} data={rows} pagination="Table" />
* <Table tableKey="t2" columnConfig={cols} data={rows} sticky height={400} />
* innerRef.current?.insertRow()

/---------------------------------------------------------------------------**/

const Table = <T extends Record<string, unknown>>({
  tableKey,
  tableConfig,
  columnConfig,
  data = [],
  pagination,
  emptyRowText,
  innerRef,
  sticky = true,
  height = 300,
  renderRow,
  customTableHeader,
  onPageChange,
  onRowsPerPageChange,
  disabled = false,
  ...baseProps
}: TableProps<T> &
  BaseMixinProps & {
    disabled?: boolean
    onPageChange?: (page: number) => void
    onRowsPerPageChange?: (rowsPerPage: number) => void
    height?: number
  }): JSX.Element => {
  const [insertRowActive, setInsertRowActive] = useState(false)

  // * 값을 min~max 범위로 고정
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

  // * 외부 ref로 insertRow/saveData 제어 API 제공
  useImperativeHandle(innerRef, () => ({
    insertRow: () => setInsertRowActive(true),
    saveData: () => setInsertRowActive(false),
  }))

  // * rowsPerPage 옵션 목록 (config 우선)
  const rowsPerPageOptions = useMemo(
    () =>
      tableConfig?.rowsPerPageOptions?.length ? tableConfig.rowsPerPageOptions : [10, 25, 50, 100],
    [tableConfig?.rowsPerPageOptions],
  )

  // * 서버/클라이언트 totalCount 안전값 계산
  const totalCount = useMemo(
    () => Math.max(0, tableConfig?.totalCount ?? data.length ?? 0),
    [tableConfig?.totalCount, data.length],
  )

  const [internalRowsPerPage, setInternalRowsPerPage] = useState<number>(
    Math.max(1, tableConfig?.rowsPerPage ?? rowsPerPageOptions[0] ?? 10),
  )
  const [internalPage, setInternalPage] = useState<number>(Math.max(1, tableConfig?.page ?? 1))

  // * rowsPerPage/page controlled 여부 판단
  const isControlledRowsPerPage = typeof tableConfig?.rowsPerPage === "number"
  const isControlledPage = typeof tableConfig?.page === "number"

  // * 실제 rowsPerPage 값 계산 (controlled 우선)
  const rowsPerPage = useMemo(() => {
    const rp = isControlledRowsPerPage ? (tableConfig?.rowsPerPage as number) : internalRowsPerPage
    return Math.max(1, rp || rowsPerPageOptions[0] || 10)
  }, [isControlledRowsPerPage, tableConfig?.rowsPerPage, internalRowsPerPage, rowsPerPageOptions])

  // * totalCount/rowsPerPage 기반 총 페이지 수 계산
  const pageCount = useMemo(() => {
    if (totalCount <= 0) return 1
    return Math.max(1, Math.ceil(totalCount / rowsPerPage))
  }, [totalCount, rowsPerPage])

  // * 실제 page 값 계산 (controlled 우선, 1~pageCount 보정)
  const page = useMemo(() => {
    const p = isControlledPage ? (tableConfig?.page as number) : internalPage
    return clamp(Math.max(1, p || 1), 1, pageCount)
  }, [isControlledPage, tableConfig?.page, internalPage, pageCount])

  // * pageCount 변경 시 page 범위를 벗어나면 보정
  useEffect(() => {
    const next = clamp(page, 1, pageCount)
    if (next !== page) {
      if (onPageChange) onPageChange(next)
      else setInternalPage(next)
    }
  }, [pageCount])

  // * 컬럼 sort 옵션을 TableTh sort 값으로 변환
  const getSortValue = (
    colSort?: boolean,
    colSortDirection?: SortDirection,
  ): SortDirection | undefined => {
    if (!colSort) return undefined
    return colSortDirection ?? "ASC"
  }

  // * 테이블 헤더 렌더링 (정렬 포함)
  const renderHead = () => (
    <TableHead sticky={sticky} top={"0px"}>
      {customTableHeader?.length ? null : null}

      <TableTr disabled={disabled}>
        {columnConfig.map((col, idx) => {
          const sortValue = getSortValue(col.sort, col.sortDirection)
          const sortEnabled = !disabled && col.sort && col.onSortChange

          return (
            <TableTh
              key={`${tableKey}_th_${String(col.title)}_${idx}`}
              align={col.textAlign}
              sort={sortEnabled ? sortValue : undefined}
              onSortChange={
                sortEnabled
                  ? (nextDirection) => col.onSortChange?.(col.key as keyof T, nextDirection)
                  : undefined
              }
            >
              {col.title}
            </TableTh>
          )
        })}
      </TableTr>
    </TableHead>
  )

  // * 테이블 바디 렌더링 (empty / row / insertRow)
  const renderBody = () => {
    if (data.length === 0) {
      return (
        <TableTr disabled={disabled}>
          <TableTd colSpan={columnConfig.length} align="center" disabled={disabled}>
            <Typography
              text={emptyRowText ?? "검색 결과가 없습니다."}
              align="center"
              sx={{ display: "inline-block" }}
            />
          </TableTd>
        </TableTr>
      )
    }

    return (
      <>
        {data.map((row, ri) =>
          renderRow ? (
            renderRow(row, ri)
          ) : (
            <TableRow
              key={`${tableKey}_row_${ri}`}
              columnConfig={columnConfig}
              data={row}
              index={ri}
              tableKey={tableKey}
              disabled={disabled}
            />
          ),
        )}

        {insertRowActive && (
          <TableTr disabled={disabled}>
            {columnConfig.map((col, ci) => (
              <TableTd key={`${tableKey}_insert_${ci}`} disabled>
                {renderCell(col, {} as T, -1, true)}
              </TableTd>
            ))}
          </TableTr>
        )}
      </>
    )
  }

  // * colgroup 렌더링 (미지정 width는 균등 분배)
  const renderColGroup = () => {
    const noWidthCols = columnConfig.filter((c) => !c.width).length
    const fallbackWidth = noWidthCols > 0 ? `${100 / noWidthCols}%` : undefined

    return (
      <colgroup>
        {columnConfig.map((col, idx) => (
          <col key={`col_${String(col.title)}_${idx}`} width={col.width ?? fallbackWidth} />
        ))}
      </colgroup>
    )
  }

  // * rowsPerPage 변경 처리 (config handler + 내부 상태 + page 리셋)
  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    if (disabled) return

    tableConfig?.handleOnRowsPerPageChange?.({ target: { value: nextRowsPerPage } as any } as any)
    onRowsPerPageChange?.(nextRowsPerPage)

    if (!isControlledRowsPerPage) setInternalRowsPerPage(nextRowsPerPage)
    if (!isControlledPage) setInternalPage(1)
    onPageChange?.(1)
  }

  // * page 변경 처리 (1~pageCount 보정 후 반영)
  const handlePageChange = (nextPage: number) => {
    if (disabled) return

    const safeNext = clamp(nextPage, 1, pageCount)
    onPageChange?.(safeNext)
    if (!isControlledPage) setInternalPage(safeNext)
  }

  return (
    <>
      <ScrollBox maxHeight={height}>
        <TableContainer {...baseProps}>
          {renderColGroup()}
          {renderHead()}
          <TableBody>{renderBody()}</TableBody>
        </TableContainer>
      </ScrollBox>

      {pagination ? (
        <Flex
          width={"100%"}
          align="center"
          justify={pagination === "Basic" ? "center" : "flex-end"}
          mt={5}
        >
          <Pagination
            type={pagination}
            disabled={disabled}
            count={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={handleRowsPerPageChange}
            onPageChange={handlePageChange}
            labelDisplayedRows={(from, to, count) => `${from}–${to} of ${count}`}
            showPrevNextButtons
            showFirstLastButtons
          />
        </Flex>
      ) : null}
    </>
  )
}

export default Table
