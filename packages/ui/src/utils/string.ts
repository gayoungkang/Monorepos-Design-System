export const formatWithComma = (value: number | string): string => {
  const str = String(value).replace(/,/g, "")
  if (!str || isNaN(Number(str))) return String(value)
  return Number(str).toLocaleString()
}

// * number | string 값을 CSS에서 사용할 수 있는 값으로 정규화
export const cssValue = (v: string | number) => (typeof v === "number" ? toCssValue(v) : v)

export const toCssValue = (value?: string | number): string | undefined => {
  if (value === undefined) return undefined
  return typeof value === "number" ? `${value}px` : value
}
