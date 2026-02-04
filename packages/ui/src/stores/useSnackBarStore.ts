import { create } from "zustand"
import type { SnackBarProps } from "../components/SnackBar/SnackBar"

type EnqueueOptions = Omit<SnackBarProps, "id" | "message">

type SnackBarStore = {
  snackbars: SnackBarProps[]
  enqueueSnackbar: (message: string, options?: EnqueueOptions) => string
  closeSnackbar: (id: string) => void
}

let idCounter = 0
/**
 * @module useSnackBarStore
 * Zustand 기반의 글로벌 스낵바 상태 관리 스토어입니다.
 * `enqueueSnackbar`로 메시지를 추가하고, 자동 또는 수동으로 제거할 수 있습니다.
 *
 * - 전역 스낵바 큐 관리
 * - 메시지 자동 사라짐 처리 (`autoHideDuration` 기반)
 * - 중복 방지를 위한 고유 ID 생성
 * - 다양한 위치(`placement`) 및 상태(`status`) 지원
 *
 * @state
 * - snackbars: 현재 화면에 표시 중인 스낵바 목록
 *
 * @methods
 * - enqueueSnackbar(message, options): 스낵바 메시지를 추가하고, 지정된 시간 후 자동 제거
 * - closeSnackbar(id): 해당 ID의 스낵바를 수동 제거
 *
 * @사용법
 * const { enqueueSnackbar, closeSnackbar } = useSnackBarStore();
 * enqueueSnackbar("성공적으로 저장되었습니다.", { status: "success" });
 */

export const useSnackBarStore = create<SnackBarStore>((set) => ({
  snackbars: [],
  enqueueSnackbar: (message, options) => {
    const id = `snackbar-${++idCounter}`
    const { autoHideDuration = 3000, placement = "top", ...rest } = options ?? {}

    const newSnackbar: SnackBarProps = {
      id,
      message,
      placement,
      autoHideDuration,
      ...rest,
    }

    set((state) => ({
      snackbars: [...state.snackbars, newSnackbar],
    }))

    setTimeout(() => {
      set((state) => {
        const exists = state.snackbars.some((s) => s.id === id)
        if (!exists) return state
        return {
          snackbars: state.snackbars.filter((s) => s.id !== id),
        }
      })
    }, autoHideDuration)

    return id
  },
  closeSnackbar: (id) =>
    set((state) => ({
      snackbars: state.snackbars.filter((s) => s.id !== id),
    })),
}))
