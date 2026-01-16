// import { useImperativeHandle, useMemo, useState } from "react"
// import { InfiniteTableProps } from "./@Types/table"
// import { useIntersect } from "./@hooks/useIntersect"
// import ScrollBox from "../ScrollBox/ScrollBox"
// import Progress from "../Progress/Progress"
// import TableTd from "./_internal/TableTd"
// import TableTr from "./_internal/TableTr"
// import { renderCell } from "./_internal/TableCell"
// import Flex from "../Flex/Flex"
// import TableTotalRows from "./_internal/TableTotalRows"

// const InfiniteTable = <T extends Record<string, unknown>>({
//   loading,
//   hasMore,
//   loadMore,
//   top = "0",
//   tableKey,
//   tableConfig,
//   columnConfig,
//   data = [],
//   emptyRowText,
//   innerRef,
//   sticky = true,
//   height = 300,
//   renderRow,
//   customTableHeader,
//   disabled = false,
//   ...baseProps
// }: InfiniteTableProps<T>) => {
//   const [insertRowActive, setInsertRowActive] = useState(false)

//   // * 외부에서 insertRow와 saveData 메서드를 호출할 수 있도록 핸들러를 노출
//   useImperativeHandle(innerRef, () => ({
//     insertRow: () => setInsertRowActive(true),
//     saveData: () => setInsertRowActive(false),
//   }))

//   // * 요소가 뷰포트에 진입했을 때 로딩 상태가 아니라면 loadMore를 실행
//   const ref = useIntersect((entry, observer) => {
//     observer.unobserve(entry.target)
//     if (hasMore && !loading) loadMore()
//   })

//     const totalCount = useMemo(
//       () => Math.max(0, tableConfig?.totalCount ?? data.length ?? 0),
//       [tableConfig?.totalCount, data.length],
//     )

//   // * 컬럼 설정에 따라 colgroup(열의 너비 설정 포함)을 렌더링
//   const renderColGroup = () => (
//     <colgroup>
//       {columnConfig.map((col, idx) => (
//         <col
//           key={`col_${col.title}_${idx}`}
//           width={col.width ?? `${100 / columnConfig.filter((c) => !c.width).length}%`}
//         />
//       ))}
//     </colgroup>
//   )

//   // * 테이블의 본문을 렌더링 및 데이터가 없을 경우 빈 행 또는 지정된 텍스트를 표시함
//   const renderTableBody = () => {
//     if (data.length === 0) {
//       if (renderTableEmptyRow) {
//         return renderTableEmptyRow
//       } else {
//         return (
//           <TableTr style={{ border: 0 }}>
//             <TableTd colSpan={columnConfig.length} style={{ border: 0 }}>
//               <Box
//                 $flexDirection="column"
//                 $alignItems="center"
//                 $padding={`${ClampSizeMap["40px"]} 0 `}
//               >
//                 <SvgIcon $defaultColor={theme.colors.text.disabled} icon={<Empty />} />
//                 <Typography
//                   text={emptyRowText ?? t("constants.emptyRowText")}
//                   $textAlign="center"
//                   $variant="label1"
//                   color={theme.colors.text.disabled}
//                   $marginTop={ClampSizeMap["8px"]}
//                 />
//               </Box>
//             </TableTd>
//           </TableTr>
//         )
//       }
//     }

//     return (
//       <>
//         {data.map((row, idx) =>
//           renderRow ? (
//             renderRow(row, idx)
//           ) : (
//             <TableRow<T>
//               key={`${tableKey}_row_${idx}_${row.id}`}
//               columnConfig={columnConfig}
//               data={row}
//               index={idx}
//               tableKey={tableKey}
//               onDoubleClick={() => onDoubleClick?.(row, idx)}
//               onRowSelect={onRowSelectChange ? handleRowSelect : undefined}
//               $isSelected={selectedRowIndex === idx}
//               $disabled={!!(row as any).disabled}
//             />
//           ),
//         )}

//         {insertRowActive && (
//           <TableTr disabled={disabled}>
//             {columnConfig.map((col, ci) => (
//               <TableTd key={`${tableKey}_insert_${ci}`} disabled>
//                 {renderCell(col, {} as T, -1, true)}
//               </TableTd>
//             ))}
//           </TableTr>
//         )}
//         {hasMore && loading && (
//           <TableTr>
//             <TableTd colSpan={columnConfig.length}>
//               <Progress type="Circular" variant="indeterminate" />
//             </TableTd>
//           </TableTr>
//         )}

//         {hasMore && (
//           <TableTr>
//             <TableTd ref={ref as React.RefObject<HTMLTableCellElement>} />
//           </TableTr>
//         )}
//       </>
//     )
//   }

//   return (
//     <>
//       <ScrollBox
//         overflow={data.length === 0 ? "hidden" : "auto"}
//         maxHeight={height}
//         pb={hasMore ? "80px" : "0px"}
//       >
//         <TableContainer>
//           {renderColGroup()}
//           <TableHead $stickyHeader={stickyHeader} top={top}>
//             <TableTr>
//               {columnConfig.map((col, inx) => (
//                 <TableTh
//                   key={`${tableKey}_head_${col.title}_${inx}`}
//                   $textAlign={col.textAlign}
//                   sort={!!col.sort}
//                   sortDirection={col.sortDirection}
//                   onClick={(nextDirection) => col.onSortChange?.(col.key as keyof T, nextDirection)}
//                 >
//                   {col.title}
//                 </TableTh>
//               ))}
//             </TableTr>
//           </TableHead>

//           <TableBody>{renderTableBody()}</TableBody>
//         </TableContainer>
//       </ScrollBox>
//       <Flex align="center" gap={4}>

//           {totalRows && <TableTotalRows ml={4} totalRows={totalCount} />}
//         </Flex>
//     </>
//   )
// }

// export default InfiniteTable
