const modules = import.meta.glob("./svgs/**/*.svg", { eager: true })

export const IconNames = Object.keys(modules).map((path) => {
  const name = path.split("/").pop()!.replace(".svg", "")
  return name
})

export type IconName = (typeof IconNames)[number]
