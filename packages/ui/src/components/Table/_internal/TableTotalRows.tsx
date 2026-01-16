import { BaseMixinProps } from "../../../tokens/baseMixin"
import { Typography } from "../../Typography/Typography"
import { formatWithComma } from "../../../utils/string"

type TableTotalRows = BaseMixinProps & {
  totalRows?: string | number
}
/**---------------------------------------------------------------------------/

* ! TableTotalRows
*
* * 테이블 전체 데이터 건수를 표시하는 보조 컴포넌트
* * totalRows 값을 받아 숫자에 콤마 포맷 적용 후 텍스트로 렌더링
* * totalRows 미지정 또는 falsy 값일 경우 "0"으로 처리
* * Typography 컴포넌트를 사용해 텍스트 스타일 일관성 유지
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableTotalRows
* 테이블 상/하단 등에 전체 데이터 개수를 표시하기 위한 컴포넌트입니다.
* - 숫자 또는 문자열 형태의 totalRows를 받아 포맷 후 출력합니다.
* - "전체 데이터 수 : N개" 형식의 고정 문구를 사용합니다.
*
* @usage
* <TableTotalRows totalRows={1200} />
* <TableTotalRows totalRows="34567" />

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
