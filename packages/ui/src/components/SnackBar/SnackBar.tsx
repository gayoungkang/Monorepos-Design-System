import {
  forwardRef,
  useEffect,
  useRef,
  ForwardRefExoticComponent,
  RefAttributes,
  CSSProperties,
} from "react"
import { Placement, StatusUiType } from "../../types"
import { IconName } from "../Icon/icon-loader"
import { theme } from "../../tokens/theme"
import { useSnackBarStore } from "../../stores/useSnackBarStore"
import Flex from "../Flex/Flex"
import { SNACKBAR_ZINDEX } from "../../types/zindex"
import Icon from "../Icon/Icon"
import { Typography } from "../Typography/Typography"
import IconButton from "../IconButton/IconButton"
import { createPortal } from "react-dom"

export type SnackBarProps = {
  id: string
  message: string
  status?: StatusUiType
  autoHideDuration?: number
  placement?: Placement
}

const SNACKBAR_PORTAL_ID = "snackbar-root"

const statusIcons: Record<StatusUiType, IconName> = {
  error: "StatusError",
  success: "StatusSuccess",
  warning: "StatusWarning",
  info: "StatusInfo",
}

const statusColors: Record<StatusUiType, string> = {
  error: theme.colors.error[500],
  success: theme.colors.success[500],
  warning: theme.colors.warning[500],
  info: theme.colors.info[500],
}

/**
 * @module SnackBar
 * 화면의 다양한 위치에 상태 메시지를 표시하는 커스텀 스낵바(Snackbar) 컴포넌트입니다.
 * `SnackBar.List`를 통해 여러 메시지를 포탈로 그룹 렌더링하며, 상태에 따른 색상/아이콘, 자동 닫기 및 위치 지정이 가능합니다.
 *
 * - 상태(status)에 따른 색상 및 아이콘 자동 설정
 * - 위치(placement)에 따라 상단/하단/좌우 및 시작/끝 정렬 가능
 * - `SnackBar.List`를 통해 다중 메시지를 포탈로 그룹 렌더링
 * - 전역 상태 기반 제어 (Zustand 스토어 사용)
 * - 자동 제거를 위한 외부 타이머 로직과 함께 사용 가능
 *
 * @props
 * - id: 스낵바 고유 ID (닫기용)
 * - message: 표시할 메시지 텍스트
 * - status: 메시지 상태 ('success' | 'error' | 'warning' | 'info')
 * - autoHideDuration: 자동 사라짐 시간(ms)
 * - placement: 스낵바 위치 설정 (top, bottom, top-start 등 12가지 위치)
 *
 * @사용법
 * <SnackBar.List />
 *
 * // 메시지 띄우기 예시 (store 사용)
 * useSnackBarStore.getState().openSnackbar({
 *   id: nanoid(),
 *   message: "저장이 완료되었습니다.",
 *   status: "success",
 *   placement: "bottom-end",
 * });
 */
const SnackBarBase = forwardRef<HTMLDivElement, SnackBarProps>(({ id, message, status }, ref) => {
  const { closeSnackbar } = useSnackBarStore()
  const icon = statusIcons[status ?? "info"]
  const color = statusColors[status ?? "info"]

  return (
    <Flex
      ref={ref}
      p="8px 12px"
      mb={8}
      wrap="wrap"
      sx={{
        pointerEvents: "auto",
        position: "relative",
        backgroundColor: theme.colors.grayscale[800],
        borderRadius: theme.borderRadius[4],
        boxShadow: theme.shadows.elevation[10],
        zIndex: SNACKBAR_ZINDEX,
      }}
    >
      <Flex width="100%" justify="space-between" align="center">
        <Flex gap="8px" align="center">
          <Icon size={16} name={icon} color={color} />
          <Typography
            text={message}
            variant="b1Regular"
            color={theme.colors.grayscale.white}
            sx={{
              fontSize: "1.1rem",
              wordBreak: "break-word",
              minWidth: "240px",
              maxWidth: "40vw",
            }}
          />
        </Flex>
        <IconButton
          onClick={() => closeSnackbar(id)}
          icon="CloseLine"
          size={16}
          iconProps={{ color: theme.colors.grayscale[500] }}
          p="0"
          ml={8}
          disableInteraction
        />
      </Flex>
    </Flex>
  )
})
SnackBarBase.displayName = "SnackBar"

// * placement에 따라 포지션 스타일 반환
const getPlacementStyle = (placement: Placement): CSSProperties => {
  const base: CSSProperties = {
    position: "fixed",
    zIndex: SNACKBAR_ZINDEX,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    pointerEvents: "none",
  }

  const placements: Record<Placement, CSSProperties> = {
    top: {
      top: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      alignItems: "center",
    },
    bottom: {
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      alignItems: "center",
    },
    left: {
      top: "50%",
      left: "16px",
      transform: "translateY(-50%)",
      alignItems: "flex-start",
    },
    right: {
      top: "50%",
      right: "16px",
      transform: "translateY(-50%)",
      alignItems: "flex-end",
    },
    "top-start": {
      top: "16px",
      left: "16px",
      alignItems: "flex-start",
    },
    "top-end": {
      top: "16px",
      right: "16px",
      alignItems: "flex-end",
    },
    "bottom-start": {
      bottom: "16px",
      left: "16px",
      alignItems: "flex-start",
    },
    "bottom-end": {
      bottom: "16px",
      right: "16px",
      alignItems: "flex-end",
    },
    "left-start": {
      top: "16px",
      left: "16px",
      alignItems: "flex-start",
    },
    "left-end": {
      bottom: "16px",
      left: "16px",
      alignItems: "flex-start",
    },
    "right-start": {
      top: "16px",
      right: "16px",
      alignItems: "flex-end",
    },
    "right-end": {
      bottom: "16px",
      right: "16px",
      alignItems: "flex-end",
    },
  }

  return { ...base, ...(placements[placement] ?? placements["top-end"]) }
}

/**
 * @module SnackBarList
 * 전역 스낵바 리스트를 portal로 렌더링하는 컴포넌트
 */
const SnackBarList = () => {
  const { snackbars } = useSnackBarStore()
  const containerRef = useRef<HTMLElement | null>(null)

  // * 전역 포탈 컨테이너 보장
  useEffect(() => {
    let container = document.getElementById(SNACKBAR_PORTAL_ID)
    if (!container) {
      container = document.createElement("div")
      container.id = SNACKBAR_PORTAL_ID

      const root =
        document.getElementById("root") ||
        document.getElementById("storybook-root") ||
        document.body

      root.appendChild(container)
    }
    containerRef.current = container
  }, [])

  if (!containerRef.current) return null

  const grouped = snackbars.reduce<Record<Placement, SnackBarProps[]>>(
    (acc, snackbar) => {
      const placement = snackbar.placement ?? "top-end"
      if (!acc[placement]) acc[placement] = []
      acc[placement].push(snackbar)
      return acc
    },
    {} as Record<Placement, SnackBarProps[]>,
  )

  return createPortal(
    <>
      {Object.entries(grouped).map(([placement, list]) => (
        <div key={placement} style={getPlacementStyle(placement as Placement)}>
          {list.map((snackbar) => (
            <SnackBar key={snackbar.id} {...snackbar} />
          ))}
        </div>
      ))}
    </>,
    containerRef.current,
  )
}

// * SnackBar 컴포넌트에 List 확장 속성 추가
type SnackBarComponent = ForwardRefExoticComponent<
  SnackBarProps & RefAttributes<HTMLDivElement>
> & {
  List: typeof SnackBarList
}

const SnackBar = SnackBarBase as SnackBarComponent
SnackBar.List = SnackBarList

export default SnackBar
