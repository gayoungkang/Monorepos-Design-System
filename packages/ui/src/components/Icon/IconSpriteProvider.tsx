import { useEffect } from "react"

export type IconSpriteProviderProps = {
  spriteUrl: string
  elementId?: string
}

const DEFAULT_ID = "acme-ui-icon-sprite"

export const IconSpriteProvider = ({
  spriteUrl,
  elementId = DEFAULT_ID,
}: IconSpriteProviderProps) => {
  useEffect(() => {
    if (typeof document === "undefined") return
    if (document.getElementById(elementId)) return

    const run = async () => {
      const res = await fetch(spriteUrl)
      const text = await res.text()

      const wrap = document.createElement("div")
      wrap.id = elementId
      wrap.style.display = "none"
      wrap.innerHTML = text

      document.body.prepend(wrap)
    }

    run()
  }, [spriteUrl, elementId])

  return null
}
