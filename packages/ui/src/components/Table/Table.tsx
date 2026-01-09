import { JSX, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import Pagination from "../Pagination/Pagination"
import { Typography } from "../Typography/Typography"
import TableBody from "./TableBody"
import { renderDisabledCell } from "./TableCell"
import { SortDirection, TableProps } from "./@Types/table"
import TableContainer from "./TableContainer"
import TableHead from "./TableHead"
import TableRow from "./TableRow"
import TableTd from "./TableTd"
import TableTh from "./TableTh"
import TableTr from "./TableTr"
import Flex from "../Flex/Flex"
import ScrollBox from "../ScrollBox/ScrollBox"

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

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
}: TableProps<T> & BaseMixinProps & { disabled?: boolean }): JSX.Element => {
  const [insertRowActive, setInsertRowActive] = useState(false)

  useImperativeHandle(innerRef, () => ({
    insertRow: () => setInsertRowActive(true),
    saveData: () => setInsertRowActive(false),
  }))

  const rowsPerPageOptions = useMemo(
    () =>
      tableConfig?.rowsPerPageOptions?.length ? tableConfig.rowsPerPageOptions : [10, 25, 50, 100],
    [tableConfig?.rowsPerPageOptions],
  )

  const totalCount = useMemo(
    () => Math.max(0, tableConfig?.totalCount ?? data.length ?? 0),
    [tableConfig?.totalCount, data.length],
  )

  const [internalRowsPerPage, setInternalRowsPerPage] = useState<number>(
    Math.max(1, tableConfig?.rowsPerPage ?? rowsPerPageOptions[0] ?? 10),
  )
  const [internalPage, setInternalPage] = useState<number>(Math.max(1, tableConfig?.page ?? 1))

  const isControlledRowsPerPage = typeof tableConfig?.rowsPerPage === "number"
  const isControlledPage = typeof tableConfig?.page === "number"

  const rowsPerPage = useMemo(() => {
    const rp = isControlledRowsPerPage ? (tableConfig?.rowsPerPage as number) : internalRowsPerPage
    return Math.max(1, rp || rowsPerPageOptions[0] || 10)
  }, [isControlledRowsPerPage, tableConfig?.rowsPerPage, internalRowsPerPage, rowsPerPageOptions])

  const pageCount = useMemo(() => {
    if (totalCount <= 0) return 1
    return Math.max(1, Math.ceil(totalCount / rowsPerPage))
  }, [totalCount, rowsPerPage])

  const page = useMemo(() => {
    const p = isControlledPage ? (tableConfig?.page as number) : internalPage
    return clamp(Math.max(1, p || 1), 1, pageCount)
  }, [isControlledPage, tableConfig?.page, internalPage, pageCount])

  useEffect(() => {
    const next = clamp(page, 1, pageCount)
    if (next !== page) {
      if (onPageChange) onPageChange(next)
      else setInternalPage(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount])

  const getSortValue = (
    colSort?: boolean,
    colSortDirection?: SortDirection,
  ): SortDirection | undefined => {
    if (!colSort) return undefined
    return colSortDirection ?? "ASC"
  }

  const renderHead = () => (
    <TableHead sticky={sticky} top={0}>
      {customTableHeader?.length ? null : null}

      <TableTr>
        {columnConfig.map((col, idx) => {
          const sortValue = getSortValue(col.sort, col.sortDirection)

          return (
            <TableTh
              key={`${tableKey}_th_${String(col.title)}_${idx}`}
              align={col.textAlign}
              sort={sortValue}
              onSortChange={
                disabled
                  ? undefined
                  : col.sort && col.onSortChange
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

  const renderBody = () => {
    if (data.length === 0) {
      return (
        <TableTr>
          <TableTd colSpan={columnConfig.length} align="center">
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
          <TableTr>
            {columnConfig.map((col, ci) => (
              <TableTd key={`${tableKey}_insert_${ci}`}>{renderDisabledCell(col)}</TableTd>
            ))}
          </TableTr>
        )}
      </>
    )
  }

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

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    if (disabled) return

    tableConfig?.handleOnRowsPerPageChange?.({ target: { value: nextRowsPerPage } as any } as any)
    onRowsPerPageChange?.(nextRowsPerPage)

    if (!isControlledRowsPerPage) setInternalRowsPerPage(nextRowsPerPage)
    if (!isControlledPage) setInternalPage(1)
    onPageChange?.(1)
  }

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
