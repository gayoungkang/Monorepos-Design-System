import fs from "node:fs"
import path from "node:path"

/**---------------------------------------------------------------------------/
 *
 * ! iconSpriteCopy
 *
 * * UI 패키지에 포함된 SVG 아이콘 스프라이트 파일을 웹 앱의 public 디렉토리로 복사하는 빌드 보조 스크립트
 * * 스크립트 실행 시 항상 단일 소스(src)의 아이콘 스프라이트를 기준으로 대상 앱의 정적 자산을 동기화한다
 * * 런타임 상태나 옵션 없이, 실행 즉시 파일 시스템 작업을 수행하는 단발성 유틸 스크립트
 * * 외부 훅이나 콜백 없이 Node.js 파일 시스템 API를 직접 호출해 처리한다
 *
 * * 동작 규칙
 *   * src 경로는 ui 패키지의 Icon 컴포넌트에서 사용하는 icon-sprite.svg로 고정된다
 *   * destDir 경로가 존재하지 않으면 recursive 옵션으로 디렉토리를 먼저 생성한다
 *   * 대상 파일이 이미 존재하더라도 copyFileSync로 항상 덮어쓴다
 *   * 파일 복사가 완료되면 콘솔에 성공 로그를 출력한다
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 해당 없음 (UI 렌더링, 스타일 계산, 레이아웃 로직을 포함하지 않음)
 *
 * * 데이터 처리 규칙
 *   * 입력값은 외부 인자 없이 코드 내부에 하드코딩된 파일 경로만 사용한다
 *   * 경로 계산은 __dirname 기준으로 path.resolve / path.join을 사용해 OS 독립적으로 처리한다
 *   * 서버 제어 로직은 없으며, 빌드/개발 환경에서 클라이언트 정적 자산을 준비하기 위한 스크립트이다
 *
 * @module iconSpriteCopy
 * 디자인 시스템에서 사용하는 SVG 아이콘 스프라이트를 웹 애플리케이션의 public 영역으로 복사해,
 * 런타임에서 아이콘 참조가 가능하도록 보장하는 파일 동기화 스크립트
 *
 * @usage
 * node iconSpriteCopy
 *
/---------------------------------------------------------------------------**/

const src = path.resolve(__dirname, "../packages/ui/src/components/Icon/icon-sprite.svg")

const destDir = path.resolve(__dirname, "../apps/web/public")
const dest = path.join(destDir, "acme-ui-icon-sprite.svg")

fs.mkdirSync(destDir, { recursive: true })
fs.copyFileSync(src, dest)
console.log(`✅ copied: ${dest}`)
