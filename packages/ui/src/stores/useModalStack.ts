import { useEffect, useRef, useState } from "react"
import { useModalStackStore } from "./useModalStore"

/**---------------------------------------------------------------------------*
 * @module useModalStack
 *
 * @description
 * 모달 컴포넌트의 포커스 및 키보드 이벤트 처리를 위해
 * 모달 스택 순서를 관리하는 커스텀 훅입니다.
 * - 모달이 열릴 때 고유 ID를 스택에 등록합니다.
 * - 모달이 닫히거나 언마운트될 때 스택에서 제거합니다.
 * - 현재 모달이 스택의 최상단인지 여부(`isTop`)를 반환합니다.
 *
 * @param {boolean} isOpen - 모달 열림 여부
 *
 * @returns {{
 *   isTop: boolean; // 현재 모달이 스택의 최상단인지 여부
 * }}
 *
 * @상세설명
 * 이 훅은 다중 모달 환경에서 ESC, Enter와 같은 키보드 이벤트를
 * 최상단 모달에서만 처리할 수 있도록 돕습니다.
 * 모달 스택은 컴포넌트 내부 state로 관리되므로, 독립적인 모달 간섭을 최소화합니다.
 * 여러 모달이 동시에 떠 있는 경우 `isTop`이 `true`인 모달에서만 이벤트가 동작합니다.
 *
 * @example
 * const { isTop } = useModalStack(open);
 *
 * useEffect(() => {
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if (!isTop) return;
 *     if (e.key === "Escape") onClose?.();
 *   };
 *
 *   if (open) document.addEventListener("keydown", handleKeyDown);
 *   return () => document.removeEventListener("keydown", handleKeyDown);
 * }, [open, isTop]);
 *---------------------------------------------------------------------------**/
export const useModalStack = (isOpen: boolean) => {
  const modalIdRef = useRef(Symbol("modalId"))
  const { stack, push, remove } = useModalStackStore()

  useEffect(() => {
    if (isOpen) {
      push(modalIdRef.current)
    }
    return () => {
      remove(modalIdRef.current)
    }
  }, [isOpen, push, remove])

  const isTop = stack[stack.length - 1] === modalIdRef.current

  return { isTop }
}
