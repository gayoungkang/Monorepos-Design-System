import fs from "fs"
import path from "path"

const svgDir = path.resolve(__dirname, "../packages/ui/src/components/Icon/svgs")
const outFile = path.resolve(__dirname, "../packages/ui/src/components/Icon/icon-types.ts")
/**---------------------------------------------------------------------------/
 *
 * ! iconTypeGenerator
 *
 * * SVG 아이콘 파일 목록을 기반으로 IconName 타입 정의 파일을 자동 생성하는 빌드 보조 스크립트
 * * 아이콘 디렉토리 내 SVG 파일명을 수집해 타입 안정성을 보장하는 상수/타입을 출력한다
 * * 실행 시점에만 동작하며, 런타임 컴포넌트 로직이나 상태를 포함하지 않는다
 * * Icon 컴포넌트에서 허용 가능한 아이콘 이름 집합을 컴파일 타임에 고정하기 위한 목적이다
 *
 * * 동작 규칙
 *   * svgDir 경로 하위의 `.svg` 확장자 파일만 아이콘 대상으로 포함한다
 *   * 파일명에서 확장자를 제거한 문자열을 아이콘 이름으로 사용한다
 *   * 아이콘 목록은 배열 리터럴 형태의 상수(`IconNames`)로 생성된다
 *   * 생성된 타입 파일은 항상 새로 작성되며 기존 파일을 덮어쓴다
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 해당 없음 (UI 렌더링, 스타일 계산, 레이아웃 로직을 포함하지 않음)
 *
 * * 데이터 처리 규칙
 *   * 입력 데이터는 로컬 파일 시스템(svgDir)의 SVG 파일명 목록이다
 *   * 출력 데이터는 `as const`가 적용된 아이콘 이름 배열과,
 *     해당 배열을 기반으로 한 유니온 타입(`IconName`)이다
 *   * 서버 제어 로직은 없으며, 빌드/개발 단계에서 타입 정의를 생성하는 스크립트이다
 *
 * @module iconTypeGenerator
 * 디자인 시스템 Icon 컴포넌트에서 사용 가능한 아이콘 이름을
 * 타입 레벨에서 강제하기 위해 자동 생성되는 타입 정의 파일을 만드는 유틸 스크립트
 *
 * @usage
 * node iconTypeGenerator
 *
/---------------------------------------------------------------------------**/

function getIconNames() {
  const files = fs.readdirSync(svgDir)
  return files.filter((file) => file.endsWith(".svg")).map((file) => file.replace(".svg", ""))
}

function generateTypeFile() {
  const icons = getIconNames()

  const content = `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
export const IconNames = ${JSON.stringify(icons, null, 2)} as const;

export type IconName = typeof IconNames[number];
`

  fs.writeFileSync(outFile, content)
  console.log(`✓ Icon types generated: ${icons.length} icons`)
}

generateTypeFile()
