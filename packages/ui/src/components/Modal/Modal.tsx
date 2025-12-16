import { ReactNode, Suspense, useEffect, useRef } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import Button, { ButtonProps } from "../Button/Button"
import { useModalStack } from "../../stores/useModalStack"
import ReactDOM from "react-dom"
import Flex from "../Flex/Flex"
import { theme } from "../../tokens/theme"
import { MODAL_ZINDEX } from "../../types/zindex"
import Box from "../Box/Box"
import { fadeInUp } from "../../tokens/keyframes"
import { Typography } from "../Typography/Typography"
import IconButton from "../IconButton/IconButton"
import Divider from "../Divider/Divider"
import Progress from "../Progress/Progress"
import { styled } from "../../tokens/customStyled"
import { css } from "styled-components"

export type BasicModalProps = BaseMixinProps & {
  width?: string
  open: boolean
  title?: string
  children?: ReactNode
  footerComponent?: ReactNode
  headerComponent?: ReactNode
  onConfirm?: () => void
  onClose?: () => void
  confirmText?: string
  confirmButtonProps?: Partial<ButtonProps>
  closeButtonProps?: Partial<ButtonProps>
  closeText?: string
  allowBackdrop?: boolean
  bodySx?: BaseMixinProps
}
/**
 * @module Modal
 * 재사용 가능한 기본 모달 컴포넌트로, 포털을 이용해 화면 중앙에 고정된 모달 창을 띄웁니다.
 *
 * - 열림/닫힘(open) 상태 관리
 * - 타이틀 또는 커스텀 헤더(headerComponent) 지원
 * - 백드롭 클릭 시 닫기 기능(allowBackdrop)
 * - ESC 키로 닫기, ENTER 키로 확인(onConfirm) 동작 지원
 * - 스크롤 잠금 및 키보드 이벤트 등록/해제 자동 처리
 * - 본문(children)을 Suspense로 감싸 로딩 대기 UI 제공
 * - 푸터 영역에 커스텀 컴포넌트(footerComponent) 삽입 가능
 * - 너비(width) 기본값 420px, 스타일 커스터마이징 가능
 *
 * @props
 * - open : 모달 열림 여부
 * - title : 기본 헤더에 표시할 제목 텍스트
 * - children : 모달 본문 내용
 * - footerComponent : 모달 푸터에 렌더링할 컴포넌트
 * - headerComponent : 기본 헤더 대신 렌더링할 커스텀 헤더
 * - onClose : 모달 닫기 이벤트 핸들러
 * - onConfirm : 확인(Enter 키) 이벤트 핸들러
 * - width : 모달 너비 (기본 420px)
 * - allowBackdrop : 백드롭 클릭 시 모달 닫기 허용 여부
 * - bodySx : 모달 children 영역 스타일 커스텀마이징 가능
 *
 * @usage
 * <Modal open={isOpen} title="알림" onClose={handleClose} onConfirm={handleConfirm}>
 *   모달 본문 내용
 * </Modal>
 */

const Modal = ({
  open,
  title,
  children,
  footerComponent,
  headerComponent,
  onClose,
  onConfirm,
  confirmText,
  confirmButtonProps,
  closeText,
  closeButtonProps,
  width = "420px",
  allowBackdrop = false,
  bodySx,
  ...others
}: BasicModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { isTop } = useModalStack(open)

  // * 키보드 이벤트 핸들러: ESC 시 onClose
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isTop) return
    if (e.key === "Escape") onClose?.()
  }

  // * 첫 렌더시 ENTER 입력으로 confirm 호출 할 수 있도록 confirm 포커스
  useEffect(() => {
    buttonRef.current?.focus()
  }, [buttonRef.current])

  // * open 상태에 따른 키 이벤트 등록 및 스크롤 잠금 처리
  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, isTop])

  if (!open) return null

  return ReactDOM.createPortal(
    <Flex
      onClick={() => allowBackdrop && onClose?.()}
      direction="column"
      justify="center"
      align="center"
      sx={{
        position: "fixed",
        height: "100vh",
        inset: 0,
        backgroundColor: theme.colors.dim.default,
        zIndex: MODAL_ZINDEX,
      }}
    >
      <AnimatedBox>
        <Flex
          direction="column"
          ref={modalRef}
          width={width}
          onClick={(e) => e.stopPropagation()}
          sx={{
            maxHeight: "90vh",
            overflow: "hidden",
            borderRadius: theme.borderRadius[8],
            backgroundColor: theme.colors.grayscale.white,
            boxShadow: theme.shadows.elevation[10],
          }}
          {...others}
        >
          {headerComponent ? (
            <>{headerComponent}</>
          ) : (
            title && (
              <>
                <Flex justify="space-between" align="center" p="9px 20px">
                  <Typography variant="h2" text={title} />
                  <IconButton
                    disableInteraction
                    onClick={onClose ?? (() => {})}
                    icon="CloseLine"
                    iconProps={{ color: theme.colors.grayscale[400] }}
                  />
                </Flex>
                <Divider />
              </>
            )
          )}

          <Box p="20px" sx={{ flex: 1, overflowY: "auto" }} {...bodySx}>
            <Suspense fallback={<Progress type="Circular" variant="indeterminate" size="30px" />}>
              {children}
            </Suspense>
          </Box>

          {footerComponent ? (
            <>{footerComponent}</>
          ) : (
            <>
              <Divider />
              <Flex justify="flex-end" align="center" p="12px 16px" gap="8px">
                <Button
                  color="normal"
                  variant="text"
                  text={closeText ?? "취소"}
                  onClick={onClose ?? (() => {})}
                  {...closeButtonProps}
                />
                <Button
                  ref={buttonRef}
                  text={confirmText ?? "확인"}
                  onClick={onConfirm ?? (() => {})}
                  {...confirmButtonProps}
                />
              </Flex>
            </>
          )}
        </Flex>
      </AnimatedBox>
    </Flex>,
    document.body,
  )
}

const AnimatedBox = styled(Box)`
  animation: ${css`
    ${fadeInUp} 0.2s ease forwards
  `};
`

export default Modal
