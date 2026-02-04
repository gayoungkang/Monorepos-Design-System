import { create } from "zustand"
import type { ButtonProps } from "../components/Button/Button"
import type { BaseMixinProps } from "../tokens/baseMixin"

export type AlertType = "confirm" | "alert"

export type AlertState = {
  open: boolean
  type?: AlertType
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  title?: string
  confirmButtonProps?: Partial<ButtonProps>
  cancelButtonProps?: Partial<ButtonProps>
  bodySx?: BaseMixinProps
}
/**
 * @module useAlertStore
 * 전역 상태로 알림(Alert/Confirm) 모달의 동작을 관리하는 Zustand 기반 커스텀 상태 관리 훅입니다.
 * 모달의 열림 상태, 메시지, 버튼 텍스트, 콜백 함수 등을 중앙에서 관리합니다.
 *
 * - Zustand로 구성된 lightweight 전역 상태 관리
 * - `AlertModal` 컴포넌트와 함께 사용됨
 * - `showAlert()`을 통해 모달 오픈
 * - `resetAlert()`으로 모달 상태 초기화
 *
 * @types
 * - AlertType: 'alert' | 'confirm' 타입 지원
 * - AlertState: 모달 관련 상태 정의
 *   - open: 모달 표시 여부
 *   - type: 알림 또는 확인 타입
 *   - message: 메시지 텍스트 또는 ReactNode
 *   - confirmText: 확인 버튼 텍스트
 *   - cancelText: 취소 버튼 텍스트
 *   - onConfirm: 확인 버튼 클릭 콜백
 *   - onCancel: 취소 버튼 클릭 콜백
 *   - title: 모달 제목
 *   - confirmButtonProps: 확인 버튼 커스텀 props
 *   - cancelButtonProps: 취소 버튼 커스텀 props
 *   - bodySx: 모달 body 영역 스타일(BaseMixin 기반)
 *
 * @methods
 * - showAlert(state: Omit<AlertState, "open">): 모달 상태를 설정하고 open 상태로 만듦
 * - resetAlert(): 초기값으로 상태를 리셋하고 모달을 닫음
 *
 * @사용법
 * const { showAlert, resetAlert } = useAlertStore();
 * showAlert({
 *   type: 'confirm',
 *   title: '삭제 확인',
 *   message: '정말 삭제하시겠습니까?',
 *   onConfirm: () => { ... },
 *   onCancel: () => { ... },
 * });
 */

type AlertStore = AlertState & {
  showAlert: (state: Omit<AlertState, "open">) => void
  resetAlert: () => void
}

export const useAlertStore = create<AlertStore>((set) => ({
  open: false,
  type: "alert",
  message: "",
  confirmText: "ok",
  cancelText: "cancel",
  onConfirm: undefined,
  onCancel: undefined,
  showAlert: (state) =>
    set({
      ...state,
      open: true,
    }),
  resetAlert: () =>
    set({
      open: false,
      type: "alert",
      message: "",
      confirmText: "ok",
      cancelText: "cancel",
      onConfirm: undefined,
      onCancel: undefined,
    }),
}))
