import fs from "node:fs"
import path from "node:path"
import { optimize } from "svgo"

const svgDir = path.resolve(__dirname, "../packages/ui/src/components/Icon/svgs")
const outFile = path.resolve(__dirname, "../packages/ui/src/components/Icon/icon-sprite.svg")
/**---------------------------------------------------------------------------/
 *
 * ! iconSpriteGenerator
 *
 * * 개별 SVG 아이콘 파일들을 단일 SVG sprite 파일로 병합·생성하는 빌드용 유틸 스크립트
 * * 지정된 SVG 디렉토리 내 파일들을 모두 읽어 symbol 형태로 변환한 뒤 sprite 파일로 출력한다
 * * 스크립트 실행 시점에만 동작하며, 런타임 UI 로직이나 상태를 포함하지 않는다
 * * SVGO를 사용해 아이콘 SVG를 최적화한 후 Icon 컴포넌트에서 참조 가능한 구조로 정규화한다
 *
 * * 동작 규칙
 *   * svgDir 경로 하위의 `.svg` 확장자 파일만 대상에 포함된다
 *   * SVG 파일이 하나도 없을 경우 즉시 에러를 throw 하여 실행을 중단한다
 *   * 각 SVG 파일은 파일명을 기준으로 `icon-{name}` 형태의 symbol id를 생성한다
 *   * 최적화 과정에서 multipass 옵션을 사용하며, fill/stroke 속성은 제거된다
 *   * 최종 sprite 파일은 항상 새로 생성되어 기존 파일을 덮어쓴다
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 개별 SVG의 viewBox 값을 추출해 symbol의 viewBox로 그대로 사용한다
 *   * viewBox가 없는 SVG의 경우 기본값 `0 0 24 24`를 fallback으로 적용한다
 *   * sprite 루트 SVG는 display:none 스타일로 정의되어 직접 렌더링되지 않는다
 *
 * * 데이터 처리 규칙
 *   * 입력 데이터는 로컬 파일 시스템(svgDir)의 SVG 파일들로 제한된다
 *   * SVG 외곽 `<svg>` 태그는 제거하고 내부 path/group 요소만 symbol 내부에 포함한다
 *   * 출력 결과는 단일 icon-sprite.svg 파일로 직렬화된다
 *   * 서버 제어 로직은 없으며, 빌드/개발 단계에서 클라이언트 자산을 생성하는 스크립트이다
 *
 * @module iconSpriteGenerator
 * 디자인 시스템 Icon 컴포넌트에서 사용하는 SVG 아이콘들을 단일 sprite로 생성하여,
 * 빌드 시점에 아이콘 참조 비용과 관리 복잡도를 줄이기 위한 전처리 스크립트
 *
 * @usage
 * node iconSpriteGenerator
 *
/---------------------------------------------------------------------------**/

const readSvgFiles = () =>
  fs
    .readdirSync(svgDir)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => ({ file: f, full: path.join(svgDir, f) }))

const extractViewBox = (svg: string) => {
  const m = svg.match(/viewBox="([^"]+)"/)
  return m?.[1] ?? "0 0 24 24"
}

const extractInner = (svg: string) => {
  const start = svg.indexOf(">")
  const end = svg.lastIndexOf("</svg>")
  if (start < 0 || end < 0) return svg
  return svg.slice(start + 1, end)
}

const main = () => {
  const files = readSvgFiles()
  if (!files.length) throw new Error(`No svg files found: ${svgDir}`)

  const symbols = files.map(({ file, full }) => {
    const raw = fs.readFileSync(full, "utf-8")
    const name = file.replace(".svg", "")

    const optimized = optimize(raw, {
      multipass: true,
      plugins: [
        "preset-default",
        // 필요 시 fill/stroke 제거(Icon 컴포넌트가 currentColor로 칠함)
        { name: "removeAttrs", params: { attrs: "(fill|stroke)" } },
      ],
    })

    const svg = typeof optimized.data === "string" ? optimized.data : raw
    const viewBox = extractViewBox(svg)
    const inner = extractInner(svg)

    return `<symbol id="icon-${name}" viewBox="${viewBox}">${inner}</symbol>`
  })

  const sprite = [
    `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">`,
    ...symbols,
    `</svg>`,
    "",
  ].join("\n")

  fs.writeFileSync(outFile, sprite, "utf-8")
  console.log(`✅ icon sprite generated: ${outFile} (${files.length} icons)`)
}

main()
