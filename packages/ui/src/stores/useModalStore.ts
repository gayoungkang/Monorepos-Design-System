import { create } from "zustand"

type ModalStackState = {
  stack: symbol[]
  push: (id: symbol) => void
  remove: (id: symbol) => void
}

/**---------------------------------------------------------------------------*
 * @module useModalStackStore
 *
 * @description
 * 전역 모달 스택 상태를 관리하는 Zustand 스토어입니다.
 * - 여러 모달이 동시에 열릴 때, 렌더링 순서를 전역적으로 관리합니다.
 * - `push`를 통해 모달 ID를 스택에 추가합니다.
 * - `remove`를 통해 모달 ID를 스택에서 제거합니다.
 * - 최상단 모달 여부 판단 시 `stack[stack.length - 1]`와 비교하여 사용합니다.
 *
 * @example
 * const { stack, push, remove } = useModalStackStore();
 *
 * // 모달 열릴 때
 * const id = Symbol("modalId");
 * push(id);
 *
 * // 모달 닫힐 때
 * remove(id);
 *
 * // 최상위 여부 체크
 * const isTop = stack[stack.length - 1] === id;
 *
 * @returns {{
 *   stack: symbol[];             // 현재 열린 모달들의 ID 스택 (순서 보장)
 *   push: (id: symbol) => void;  // 스택에 모달 ID 추가
 *   remove: (id: symbol) => void;// 스택에서 모달 ID 제거
 * }}
 *---------------------------------------------------------------------------**/
export const useModalStackStore = create<ModalStackState>((set) => ({
  stack: [],
  push: (id) =>
    set((state) => ({
      stack: [...state.stack, id],
    })),
  remove: (id) =>
    set((state) => ({
      stack: state.stack.filter((stackId) => stackId !== id),
    })),
}))
