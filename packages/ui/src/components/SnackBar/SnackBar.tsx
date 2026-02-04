import { forwardRef, useEffect, useMemo, useState } from "react"
import type { ForwardRefExoticComponent, RefAttributes, CSSProperties } from "react"
import { theme } from "../../tokens/theme"
import { useSnackBarStore } from "../../stores/useSnackBarStore"
import Flex from "../Flex/Flex"
import { SNACKBAR_ZINDEX } from "../../types/zindex"
import Icon from "../Icon/Icon"
import { Typography } from "../Typography/Typography"
import IconButton from "../IconButton/IconButton"
import { createPortal } from "react-dom"
import { canUseDOM } from "../../utils/canUseDOM"
import type { StatusUiType } from "../../types/status"
import type { DirectionalPlacement } from "../../types/placement"
import type { IconName } from "../Icon/icon-types"

export type SnackBarProps = {
  id: string
  message: string
  status?: StatusUiType
  autoHideDuration?: number
  placement?: DirectionalPlacement
  iconSize?: number | string
  closeIconSize?: number | string
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

/**---------------------------------------------------------------------------/
 *
 * ! SnackBar
 *
 * * 전역 스토어(Zustand) 기반으로 상태 메시지를 화면에 띄우는 스낵바 컴포넌트입니다.
 * * 단일 스낵바(`SnackBar`)는 메시지/상태에 따른 아이콘·색상 렌더링과 수동/자동 닫기를 지원합니다.
 * * `SnackBar.List`는 전역 스낵바 배열을 placement 기준으로 그룹핑하여, 포탈(snackbar-root)에 다중 스낵바를 묶어 렌더링합니다.
 * * placement에 따라 화면의 다양한 위치(top/bottom/left/right 및 start/end 조합)에 고정 배치됩니다.
 *
 * * 동작 규칙
 *   * 상태(status) 처리:
 *     * `resolvedStatus = status ?? "info"`로 기본 상태를 보정합니다.
 *     * 상태별 아이콘(statusIcons)과 색상(statusColors)을 매핑하여 표시합니다.
 *   * 자동 닫기(autoHideDuration):
 *     * `autoHideDuration`이 0 이하 또는 미지정이면 자동 닫기를 수행하지 않습니다(외부/스토어 제어 유지).
 *     * 지정된 경우 setTimeout으로 `closeSnackbar(id)`를 예약하고,
 *       언마운트/의존성 변경 시 타이머를 clear하여 중복/누수를 방지합니다.
 *   * 수동 닫기:
 *     * 닫기 버튼 클릭 시 타이머가 있으면 clear 후 `closeSnackbar(id)`를 호출합니다.
 *   * 포인터 이벤트:
 *     * 스낵바 컨테이너는 `pointerEvents: "auto"`로 클릭 가능하게 유지합니다.
 *     * placement 컨테이너는 `pointerEvents: "none"`으로 배경 영역 클릭 간섭을 최소화합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 단일 스낵바(SnackBarBase):
 *     * Flex 래퍼로 배경(grayscale[800]) + borderRadius + elevation shadow를 적용합니다.
 *     * 내부는 좌측(상태 아이콘 + 메시지) / 우측(닫기 버튼)으로 정렬됩니다.
 *     * 메시지는 wordBreak/minWidth/maxWidth로 줄바꿈 및 폭을 제한합니다.
 *     * zIndex는 SNACKBAR_ZINDEX로 레이어 우선순위를 보장합니다.
 *   * placement 그룹 컨테이너(getPlacementStyle):
 *     * position: fixed + flex column + gap으로 동일 위치의 스낵바를 세로 스택으로 배치합니다.
 *     * top/bottom은 가운데 정렬(translateX), left/right는 세로 가운데 정렬(translateY)을 기본으로 합니다.
 *     * start/end 조합(top-start/top-end/bottom-start/bottom-end 등)은 각 코너/엣지 기준으로 정렬됩니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(SnackBarProps):
 *     * `id`/`message`는 필수이며, `status/autoHideDuration/placement`는 선택입니다.
 *     * `iconSize/closeIconSize`는 상위에서 계산된 크기를 전달받아 Icon/IconButton에 적용합니다.
 *   * 내부 계산:
 *     * 상태별 아이콘/색상은 정적 매핑 테이블로 결정됩니다.
 *     * List는 전역 `snackbars`를 placement 단위로 reduce하여 그룹핑합니다.
 *   * 서버/클라이언트 제어:
 *     * 표시/제거는 전역 스토어(useSnackBarStore)의 상태를 단일 소스로 사용합니다.
 *
 * @module SnackBar
 * 전역 스낵바를 portal로 렌더링하며, 상태별 아이콘/색상, 자동 닫기, placement 기반 다중 배치를 지원합니다.
 *
 * @usage
 * <SnackBar.List />
 *
/---------------------------------------------------------------------------**/

const SnackBarBase = forwardRef<HTMLDivElement, SnackBarProps>(
  ({ id, message, status, iconSize = 16, closeIconSize = 16 }, ref) => {
    const { closeSnackbar } = useSnackBarStore()
    const resolvedStatus: StatusUiType = status ?? "info"
    const icon = statusIcons[resolvedStatus]
    const color = statusColors[resolvedStatus]

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
            <Icon size={iconSize} name={icon} color={color} />
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
            size={closeIconSize}
            iconProps={{ color: theme.colors.grayscale[500] }}
            p="0"
            ml={8}
            disableInteraction
          />
        </Flex>
      </Flex>
    )
  },
)
SnackBarBase.displayName = "SnackBar"

// * placement에 따라 포지션 스타일 반환
const getPlacementStyle = (placement: DirectionalPlacement): CSSProperties => {
  const base: CSSProperties = {
    position: "fixed",
    zIndex: SNACKBAR_ZINDEX,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    pointerEvents: "none",
  }

  const placements: Record<DirectionalPlacement, CSSProperties> = {
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
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null)

  // * 전역 포탈 컨테이너 보장(준비 시 리렌더 보장)
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
    setPortalEl(container)
  }, [])

  const grouped = useMemo(() => {
    return snackbars.reduce<Record<DirectionalPlacement, SnackBarProps[]>>(
      (acc, snackbar) => {
        const placement = snackbar.placement ?? "top-end"
        if (!acc[placement]) acc[placement] = []
        acc[placement].push(snackbar)
        return acc
      },
      {} as Record<DirectionalPlacement, SnackBarProps[]>,
    )
  }, [snackbars])

  if (!portalEl) return null

  // * SSR/테스트 안전 처리
  if (!canUseDOM()) return null

  return createPortal(
    <>
      {Object.entries(grouped).map(([placement, list]) => (
        <div key={placement} style={getPlacementStyle(placement as DirectionalPlacement)}>
          {list.map((snackbar) => (
            <SnackBar key={snackbar.id} {...snackbar} />
          ))}
        </div>
      ))}
    </>,
    portalEl,
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
