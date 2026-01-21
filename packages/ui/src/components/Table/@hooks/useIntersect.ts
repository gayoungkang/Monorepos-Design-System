import { useEffect, useRef, useState } from "react"

const useIntersect = (onIntersect: () => void) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onIntersect()
    })

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [enabled, onIntersect])

  return { ref, enabled, setEnabled }
}

export default useIntersect
