import { useEffect, useRef, useState } from "react"
/**---------------------------------------------------------------------------/
 *
 * ! useIntersect
 *
 * * 특정 DOM 요소가 뷰포트에 교차(intersect)되는 시점을 감지해 콜백을 실행하는 커스텀 훅
 * * IntersectionObserver를 내부에서 직접 생성·관리하며, 단일 ref 기준으로 동작
 *
 * * 동작 규칙
 *   * `enabled === true`이고 `ref.current`가 존재할 때만 observer를 생성
 *   * 관측 대상이 viewport에 진입(`entry.isIntersecting === true`)하면 `onIntersect` 콜백 호출
 *   * effect cleanup 시 observer를 disconnect하여 중복 관측/메모리 누수 방지
 *
 * * 제어 방식
 *   * enabled
 *     * 내부 state로 관리되며, false로 설정 시 관측 로직 자체를 중단
 *     * 무한 스크롤 등에서 “1회 트리거 후 비활성화” 패턴을 위해 외부에서 제어 가능
 *   * ref
 *     * 관측 대상 DOM에 직접 바인딩하는 ref
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `onIntersect`는 교차 시 실행할 콜백 함수(의존성 배열에 포함됨)
 *   * 내부 계산 로직
 *     * IntersectionObserver 엔트리는 첫 번째 요소만 사용(단일 타겟 전제)
 *
 * @module useIntersect
 * 뷰포트 교차 시점을 감지해 외부 로직을 트리거하는 범용 IntersectionObserver 훅
 *
 * @usage
 * const { ref, enabled, setEnabled } = useIntersect(() => {
 *   loadMore()
 * })
 *
 * <div ref={ref} />
 *
/---------------------------------------------------------------------------**/
const useIntersect = (onIntersect: () => void) => {
  // * IntersectionObserver가 관찰할 대상 ref
  const ref = useRef<HTMLDivElement | null>(null)

  // * observer 동작 여부를 제어하기 위한 enable 플래그
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    // * 비활성 상태이거나 ref가 아직 없으면 observer 생성하지 않음
    if (!enabled || !ref.current) return

    // * 대상 요소가 viewport에 진입했을 때 콜백 실행
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onIntersect()
    })

    observer.observe(ref.current)

    // * observer 정리
    return () => observer.disconnect()
  }, [enabled, onIntersect])

  return { ref, enabled, setEnabled }
}

export default useIntersect
