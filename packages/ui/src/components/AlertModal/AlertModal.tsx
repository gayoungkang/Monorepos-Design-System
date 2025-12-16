import { useEffect, useRef } from "react"
import { useAlertStore } from "../../stores/useAlertStore"
import Flex from "../Flex/Flex"
import IconButton from "../IconButton/IconButton"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import Modal from "../Modal/Modal"
import { theme } from "../../tokens/theme"
/**
 * @module AlertModal
 * 전역 상태(`useAlertStore`) 기반으로 동작하는 커스텀 알림 모달 컴포넌트입니다.
 * 알림(alert) 또는 확인(confirm) 타입을 지원하며, 메시지, 타이틀, 버튼 텍스트 등을 커스터마이징할 수 있습니다.
 *
 * - 전역 상태를 통해 모달 열림/닫힘, 타입(alert/confirm), 메시지 및 콜백 핸들링
 * - `Modal`, `Button`, `IconButton`, `Typography`, `Flex` 등의 공통 컴포넌트를 사용
 * - 닫기 버튼 및 하단 버튼 영역을 조건부로 렌더링
 * - alert 타입은 확인 버튼만, confirm 타입은 확인/취소 버튼 모두 표시
 *
 * @props (store로부터 전달됨)
 * - open: 모달 오픈 여부
 * - type: 모달 타입 ('alert' | 'confirm')
 * - title: 모달 타이틀 텍스트
 * - message: 모달 본문 메시지
 * - confirmText: 확인 버튼 텍스트
 * - cancelText: 취소 버튼 텍스트
 * - onConfirm: 확인 버튼 클릭 시 실행되는 콜백
 * - onCancel: 취소 버튼 클릭 시 실행되는 콜백
 * - confirmButtonProps: 확인 버튼에 전달할 추가 props
 * - cancelButtonProps: 취소 버튼에 전달할 추가 props
 * - resetAlert: 모달 상태 초기화 함수
 * - bodySx: 모달 본문 스타일 (optional)
 *
 * @사용법
 * - 전역 상태(useAlertStore)를 통해 AlertModal 제어
 * - 내부적으로 Modal 컴포넌트를 감싸고 있으며, header/footerComponent를 커스터마이징하여 사용
 *
 * @예시
 * const { setAlert } = useAlertStore();
 * setAlert({
 *   open: true,
 *   type: 'confirm',
 *   title: '삭제 확인',
 *   message: '정말 삭제하시겠습니까?',
 *   onConfirm: () => { ... },
 * });
 */

const AlertModal = () => {
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
  const buttonRef = useRef<HTMLButtonElement>(null)

  // * 확인 버튼 클릭 시 알림 초기화 후 확인 실행 핸들러
  const handleConfirm = () => {
    resetAlert()
    onConfirm?.()
  }

  // * 취소 버튼 클릭 시 알림 초기화 후 취소 실행 핸들러 (alert일 경우 확인도 함께 실행)
  const handleCancel = () => {
    resetAlert()
    onCancel?.()
    if (type === "alert") handleConfirm()
  }

  // * 첫 렌더시 ENTER 입력으로 confirm 호출 할 수 있도록 confirm 포커스
  useEffect(() => {
    if (open) buttonRef.current?.focus()
  }, [open, type])

  // * 모달 상단 닫기 버튼 렌더링
  const renderHeader = () => {
    return (
      <Flex justify="flex-end" p="12px 12px 0 12px">
        <IconButton
          disableInteraction
          onClick={handleCancel ?? (() => {})}
          icon="CloseLine"
          iconProps={{ color: theme.colors.grayscale[400] }}
        />
      </Flex>
    )
  }

  // * 모달 하단 버튼 렌더링 (alert 또는 confirm에 따라 다르게 표시)
  const renderFooter = () => {
    if (type === "confirm") {
      return (
        <Flex p="12px">
          <Button
            color="normal"
            variant="text"
            text={cancelText ?? "cancel"}
            onClick={handleCancel}
            {...cancelButtonProps}
          />
          <Button
            ref={buttonRef}
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
          <Button ref={buttonRef} width="100%" text={confirmText ?? "ok"} onClick={handleConfirm} />
        </Flex>
      )
    }

    return null
  }

  if (!open) return null

  return (
    <Modal
      width="320px"
      open={open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      headerComponent={renderHeader()}
      footerComponent={renderFooter()}
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
