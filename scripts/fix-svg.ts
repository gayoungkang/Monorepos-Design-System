import fs from "fs"
import path from "path"

const svgDir = path.resolve(__dirname, "../packages/ui/src/components/Icon/svgs")

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
