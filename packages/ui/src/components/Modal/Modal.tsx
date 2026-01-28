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
  container?: HTMLElement
}
/**---------------------------------------------------------------------------/
 *
 * ! Modal
 *
 * * 포털(Portal) 기반의 기본 모달 다이얼로그 컴포넌트
 * * open 상태일 때만 렌더링되며, 모달 스택에서 최상단(isTop) 모달에 한해 ESC 닫기/스크롤 잠금/포커스 처리를 수행
 * * header/footer를 커스텀 컴포넌트로 대체할 수 있으며, 기본 UI는 title/confirm/close 조합으로 제공
 * * children은 Suspense로 감싸 지연 로딩 시 로딩 인디케이터를 표시
 *
 * * 동작 규칙
 *   * 주요 분기 조건 및 처리 우선순위
 *     * open === false 이면 null 반환(렌더링/이벤트 모두 없음)
 *     * open === true 이고 isTop === true 인 경우에만:
 *       * ESC 키 입력 시 onClose 호출
 *       * document.body overflow를 hidden으로 설정하여 스크롤 잠금
 *       * confirm 버튼(buttonRef)에 포커스 부여(queueMicrotask로 렌더 이후 보장)
 *     * allowBackdrop === true 인 경우에만 오버레이 클릭으로 onClose 호출
 *     * headerComponent/footComponent가 제공되면 기본 헤더/푸터 대신 해당 컴포넌트를 우선 렌더링
 *   * 이벤트 처리 방식
 *     * overlay onClick: allowBackdrop가 true일 때만 onClose 실행
 *     * modal 컨텐츠 onClick: e.stopPropagation()으로 overlay 클릭 버블링 차단
 *     * ESC keydown: isTop 모달일 때만 onClose 실행
 *   * disabled 상태에서 차단되는 동작
 *     * 해당 없음(기본 모달 자체는 disabled 플래그를 가지지 않음)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Portal로 container(기본 document.body)에 렌더링
 *   * overlay는 fixed + inset:0 + dim 배경 + zIndex(MODAL_ZINDEX) 적용
 *   * 모달 본문은 maxHeight(90vh) + overflow hidden, body 영역(Box)는 overflowY:auto로 스크롤 처리
 *   * AnimatedBox에 fadeInUp 애니메이션을 적용해 진입 모션 제공
 *   * 기본 헤더: title 렌더 + 우측 닫기(IconButton) + Divider
 *   * 기본 푸터: close/confirm 버튼 + Divider
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택)
 *     * open: 필수(모달 표시 여부)
 *     * width: 모달 너비(기본 "420px")
 *     * title: 기본 헤더 사용 시 제목 문자열(옵션)
 *     * headerComponent/footerComponent: 기본 헤더/푸터 대체용(옵션, 제공 시 우선)
 *     * onClose/onConfirm: 기본 버튼/ESC/백드롭에서 호출되는 콜백(옵션)
 *     * confirmText/closeText + confirmButtonProps/closeButtonProps: 기본 버튼 문구/옵션 확장
 *     * allowBackdrop: true일 때만 overlay 클릭 닫기 허용
 *     * bodySx: 본문(Box) 영역 BaseMixinProps 확장(패딩/스타일 오버라이드)
 *     * container: Portal 대상 엘리먼트(기본 document.body)
 *   * 내부 계산 로직 요약
 *     * useModalStack(open)으로 최상단 여부를 판단해 전역 이벤트/스크롤 잠금 적용 범위를 제한
 *     * Suspense fallback으로 Circular Progress를 기본 로딩 표시로 사용
 *   * 클라이언트 제어 컴포넌트 (DOM 이벤트/Portal 기반, 서버 제어 없음)
 *
 * @module Modal
 * 모달 스택과 연동되는 기본 Portal 모달 컴포넌트
 *
 * @usage
 * <Modal
 *   open={open}
 *   title="확인"
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleConfirm}
 * >
 *   {children}
 * </Modal>
 *
/---------------------------------------------------------------------------**/

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
  container,
  ...others
}: BasicModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { isTop } = useModalStack(open)

  // * open + 최상단 모달일 때만: ESC 닫기 + body 스크롤 잠금 + confirm 버튼 포커스
  useEffect(() => {
    if (!open || !isTop) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.()
    }

    document.addEventListener("keydown", handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // 포커스는 DOM이 렌더된 이후에 보장
    queueMicrotask(() => {
      buttonRef.current?.focus()
    })

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, isTop, onClose])

  if (!open) return null

  const overlay = (
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
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "modal"}
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
    </Flex>
  )

  return ReactDOM.createPortal(overlay, container ?? document.body)
}

const AnimatedBox = styled(Box)`
  animation: ${css`
    ${fadeInUp} 0.2s ease forwards
  `};
`

export default Modal
