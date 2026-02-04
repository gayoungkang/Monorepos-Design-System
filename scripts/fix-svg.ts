import fs from "fs"
import path from "path"

const svgDir = path.resolve(__dirname, "../packages/ui/src/components/Icon/svgs")
/**---------------------------------------------------------------------------/
 *
 * ! svgColorNormalizer
 *
 * * 아이콘 SVG 파일들의 색상 및 스타일 속성을 정규화하여 Icon 컴포넌트의 currentColor 기반 렌더링 규칙을 보장하는 전처리 스크립트
 * * 지정된 SVG 디렉토리(하위 포함)를 재귀적으로 순회하며 `.svg` 파일을 직접 수정한다
 * * 실행 시점에만 동작하는 파일 시스템 유틸 스크립트로, 런타임 UI 로직이나 상태는 포함하지 않는다
 * * 개별 SVG에 분산된 fill/stroke/style 정의를 제거하고 루트 SVG 기준 색상 규칙을 통일한다
 *
 * * 동작 규칙
 *   * svgDir 하위의 모든 디렉토리를 재귀 탐색하며 `.svg` 확장자 파일만 처리한다
 *   * 각 SVG 파일은 읽기 → 문자열 치환 → 동일 경로 덮어쓰기 방식으로 처리된다
 *   * 파일 단위 처리 완료 시 로그를 출력하고, 전체 작업 종료 후 최종 완료 로그를 출력한다
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 모든 `style="..."` 속성은 무조건 제거된다
 *   * `fill="none"`은 의미 보존을 위해 임시 데이터 속성으로 치환 후 복원된다
 *   * 모든 `fill="..."`, `stroke="..."` 속성은 제거 대상이며, 잔여 속성도 추가 정규식으로 클린업된다
 *   * 루트 `<svg>` 태그에는 `fill="currentColor" stroke="currentColor"`가 강제로 주입된다
 *
 * * 데이터 처리 규칙
 *   * 입력 데이터는 로컬 파일 시스템(svgDir)의 SVG 파일 텍스트 내용이다
 *   * SVG 파서 없이 정규식 기반 문자열 치환만으로 변환을 수행한다
 *   * 서버 제어 로직은 없으며, 빌드/개발 단계에서 클라이언트 아이콘 자산을 일괄 정리하기 위한 스크립트이다
 *
 * @module svgColorNormalizer
 * 디자인 시스템 Icon 컴포넌트가 currentColor 기준으로 일관된 색상 제어를 수행할 수 있도록,
 * SVG 아이콘 자산의 색상 관련 속성을 사전에 정규화하는 파일 처리 스크립트
 *
 * @usage
 * node svgColorNormalizer
 *
/---------------------------------------------------------------------------**/

function updateSvg(filePath: string) {
  let svg = fs.readFileSync(filePath, "utf8")

  // style 제거
  svg = svg.replace(/style="[^"]*"/g, "")

  // fill="none" 은 유지해야 하므로 임시 치환
  svg = svg.replace(/fill="none"/g, 'data-fill-none="true"')

  // 모든 fill/stroke 제거
  svg = svg.replace(/fill="[^"]*"/g, "")
  svg = svg.replace(/stroke="[^"]*"/g, "")

  // 모든 group, path 등에 남은 fill/stroke 속성을 클린업
  svg = svg.replace(/\s(fill|stroke)="[^"]*"/g, "")

  // fill="none" 복원
  svg = svg.replace(/data-fill-none="true"/g, 'fill="none"')

  // svg 태그에 기본 색 적용
  svg = svg.replace(/<svg([^>]*)>/, `<svg$1 fill="currentColor" stroke="currentColor">`)

  fs.writeFileSync(filePath, svg)
  console.log(`✓ fixed: ${filePath}`)
}

function walk(dir: string) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file)

    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath)
    } else if (file.endsWith(".svg")) {
      updateSvg(filepath)
    }
  })
}

walk(svgDir)
console.log("SVG fixed complete!")
