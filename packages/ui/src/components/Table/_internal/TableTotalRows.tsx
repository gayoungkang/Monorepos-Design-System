import { BaseMixinProps } from "../../../tokens/baseMixin"
import { Typography } from "../../Typography/Typography"
import { formatWithComma } from "../../../utils/string"

type TableTotalRows = BaseMixinProps & {
  totalRows?: string | number
}
/**---------------------------------------------------------------------------/
 *
 * ! TableTotalRows
 *
 * * 테이블 하단/상단에 전체 데이터 개수를 텍스트로 표시하는 보조 컴포넌트
 * * totalRows 값이 string | number 모두 가능하도록 허용
 * * 값이 존재하면 formatWithComma 유틸을 통해 천 단위 콤마 포맷 적용
 * * totalRows가 없거나 falsy 값이면 기본값으로 "0개"를 표시
 *
 * * Typography 기반 렌더링
 *   * variant="b1Medium" 고정 사용
 *   * BaseMixinProps를 그대로 전달하여 여백, 색상, 정렬 등 스타일 확장 가능
 *
 * @module TableTotalRows
 * 테이블의 전체 데이터 건수를 표시합니다.
 * - 숫자/문자열 입력을 모두 허용하며, 숫자 표기 시 자동 콤마 포맷을 적용합니다.
 *
 * @usage
 * <TableTotalRows totalRows={1234} />
 * <TableTotalRows totalRows="56789" mt={8} />
 *
/---------------------------------------------------------------------------**/

const TableTotalRows = ({ totalRows, ...others }: TableTotalRows) => {
  return (
    <Typography
      variant="b1Medium"
      text={`전체 데이터 수: ${
        totalRows ? (formatWithComma(totalRows) as unknown as string) : "0"
      }개`}
      {...others}
    />
  )
}

export default TableTotalRows
