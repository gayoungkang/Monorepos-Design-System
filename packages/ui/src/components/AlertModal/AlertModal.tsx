import { useEffect, useMemo, useRef } from "react"
import { useTheme } from "styled-components"
import { useAlertStore } from "../../stores/useAlertStore"
import Flex from "../Flex/Flex"
import IconButton from "../IconButton/IconButton"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import Modal from "../Modal/Modal"
/**---------------------------------------------------------------------------/
 *
 * ! AlertModal
 *
 * * 전역 Alert Store(useAlertStore) 상태를 기반으로 alert/confirm 모달을 렌더링하는 컴포넌트
 * * `open`이 true일 때만 렌더링되며, 닫힘 시에는 DOM을 만들지 않고 null을 반환
 * * alert/confirm 타입에 따라 “닫기 동작(onClose/X 버튼)”과 “하단 버튼 구성”이 달라짐
 *
 * * 동작 규칙
 *   * 렌더 조건
 *     * `open`이 false면 즉시 null 반환(모달 미렌더)
 *   * 닫기 공통 처리
 *     * `close()`는 `resetAlert()`을 호출하여 스토어 상태를 초기화(닫기 동작의 단일 진입점)
 *   * 확인/취소 흐름
 *     * 확인: `handleConfirm` → close → `onConfirm?.()`
 *     * 취소: `handleCancel` → close → `onCancel?.()`
 *   * 상단 X / 모달 onClose 매핑
 *     * `type === "alert"`이면 닫기 동작을 “확인”으로 처리(= handleConfirm)
 *     * 그 외(confirm)은 닫기 동작을 “취소”로 처리(= handleCancel)
 *     * `handleCloseByType`는 useMemo로 타입에 따라 위 동작을 선택
 *   * 포커스 처리
 *     * 모달 오픈 시 confirm 버튼에 focus를 주어 Enter 키로 확인 동작을 유도
 *
 * * 레이아웃/스타일 관련 규칙
 *   * headerComponent
 *     * 우측 정렬 X 버튼(IconButton)을 제공하며, 클릭 시 `handleCloseByType` 실행
 *   * footerComponent
 *     * confirm 타입: “취소(text/normal) + 확인(기본)” 2버튼 구성
 *     * alert 타입: “확인” 단일 버튼 구성
 *     * 그 외 타입: null
 *   * body
 *     * title은 Typography(h2)로 중앙 정렬
 *     * message는 중앙 정렬 + 줄바꿈/긴 문자열 대응(wordBreak/overflowWrap) 적용
 *     * bodySx는 스토어에서 주입 가능하며 기본값을 제공
 *
 * * 데이터 처리 규칙
 *   * 입력(스토어) 계약
 *     * `open/type/message/title` 등 표시 데이터는 store에서 가져오며, 컴포넌트 내부에서는 가공 최소화
 *     * `confirmButtonProps/cancelButtonProps`를 통해 하단 버튼 props 확장 가능
 *     * confirm/cancel 텍스트가 없으면 각각 "ok"/"cancel"로 fallback
 *   * 내부 계산 로직
 *     * `handleCloseByType`는 타입에 따라 close 동작을 confirm 또는 cancel로 라우팅
 *     * confirm 버튼 ref를 공유하여 alert/confirm 모두 동일한 포커스 정책을 적용
 *
 * @module AlertModal
 * 전역 상태 기반 alert/confirm 모달(닫기 라우팅/버튼 구성/포커스 정책)을 제공하는 컴포넌트
 *
 * @usage
 * // useAlertStore에서 open/type/message 등을 set한 뒤 <AlertModal />을 앱 루트에 상시 렌더링
 * <AlertModal />
 *
/---------------------------------------------------------------------------**/

const AlertModal = () => {
  const theme = useTheme()

  const {
    open,
    type,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    resetAlert,
    confirmButtonProps,
    cancelButtonProps,
    title,
    bodySx = { p: "4px 0px 10px 0px" },
  } = useAlertStore()

  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // * 모달 상태를 닫는 공통 처리(resetAlert은 1회만 실행)
  const close = () => {
    resetAlert()
  }

  // * 확인 버튼 클릭 시: 닫기 → 확인 콜백 실행
  const handleConfirm = () => {
    close()
    onConfirm?.()
  }

  // * 취소 버튼 클릭 시: 닫기 → 취소 콜백 실행
  const handleCancel = () => {
    close()
    onCancel?.()
  }

  // * 상단 X / onClose 등 "닫기" 동작은 타입에 따라 매핑
  const handleCloseByType = useMemo(() => {
    if (type === "alert") return handleConfirm
    return handleCancel
  }, [type, onConfirm, onCancel])

  // * 모달 오픈 시 Enter 입력으로 confirm 호출 가능하도록 confirm 버튼에 포커스
  useEffect(() => {
    if (open) confirmButtonRef.current?.focus()
  }, [open])

  // * 모달 상단 닫기 버튼 렌더링
  const headerComponent = (
    <Flex justify="flex-end" p="12px 12px 0 12px">
      <IconButton
        disableInteraction
        onClick={handleCloseByType}
        icon="CloseLine"
        iconProps={{ color: theme.colors.grayscale[400] as `#${string}` }}
      />
    </Flex>
  )

  // * 모달 하단 버튼 렌더링 (alert 또는 confirm에 따라 다르게 표시)
  const footerComponent = (() => {
    if (type === "confirm") {
      return (
        <Flex p="12px" gap="8px">
          <Button
            color="normal"
            variant="text"
            text={cancelText ?? "cancel"}
            onClick={handleCancel}
            {...cancelButtonProps}
          />
          <Button
            ref={confirmButtonRef}
            width="100%"
            text={confirmText ?? "ok"}
            onClick={handleConfirm}
            {...confirmButtonProps}
          />
        </Flex>
      )
    }

    if (type === "alert") {
      return (
        <Flex p="12px">
          <Button
            ref={confirmButtonRef}
            width="100%"
            text={confirmText ?? "ok"}
            onClick={handleConfirm}
            {...confirmButtonProps}
          />
        </Flex>
      )
    }

    return null
  })()

  if (!open) return null

  return (
    <Modal
      width="320px"
      open={open}
      onClose={handleCloseByType}
      onConfirm={handleConfirm}
      headerComponent={headerComponent}
      footerComponent={footerComponent}
      bodySx={bodySx}
    >
      <Flex direction="column" align="center" justify="center" sx={{ minHeight: "50px" }}>
        <Typography variant="h2" text={title ?? ""} mb={8} />

        <Typography
          text={message ?? ""}
          variant="b2Regular"
          color={theme.colors.text.tertiary}
          width="100%"
          px="12px"
          sx={{
            textAlign: "center",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        />
      </Flex>
    </Modal>
  )
}

export default AlertModal
