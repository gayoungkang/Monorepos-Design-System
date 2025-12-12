import fs from "fs"
import path from "path"

const svgDir = path.resolve(__dirname, "../packages/ui/src/components/Icon/svgs")
const outFile = path.resolve(__dirname, "../packages/ui/src/components/Icon/icon-types.ts")

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
