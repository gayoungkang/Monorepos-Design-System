import fs from "fs"
import path from "path"

const svgDir = path.resolve(__dirname, "../packages/ui/src/components/Icon/svgs")

function updateSvg(filePath: string) {
  let svg = fs.readFileSync(filePath, "utf8")

  svg = svg
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
    .replace(/style="[^"]*"/g, "")

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
