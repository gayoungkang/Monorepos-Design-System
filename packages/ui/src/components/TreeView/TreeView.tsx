import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import Icon from "../Icon/Icon"
import ToggleButton from "../ToggleButton/ToggleButton"
import Button from "../Button/Button"
import type { IconName } from "../Icon/icon-types"
import type { SizeUiType } from "../../types/ui"

export type TreeNodeType = {
  id: string
  label: ReactNode
  children?: TreeNodeType[]
  disabled?: boolean
  icon?: IconName
  onClick?: (id: string, node: TreeNodeType) => void
}

export type TreeViewProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps | "onSelect"> & {
    items?: TreeNodeType[]
    depth?: number
    breadth?: number

    defaultExpandedIds?: string[]
    expandedIds?: string[]
    onExpandedChange?: (expandedIds: string[]) => void

    defaultSelectedId?: string | null
    selectedId?: string | null
    onSelect?: (id: string, node: TreeNodeType) => void

    expandOnLabelClick?: boolean
    showHeaderControls?: boolean
    showFooterButtons?: boolean

    size?: SizeUiType
  }

type FlatNode = {
  id: string
  node: TreeNodeType
  level: number
  parentId: string | null
  hasChildren: boolean
  isExpanded: boolean
  isVisible: boolean
}
/**---------------------------------------------------------------------------/
 *
 * ! TreeView
 *
 * * 트리 구조 데이터를 계층(레벨) 단위로 렌더링하고, 노드 확장/접기 + 단일 선택 + 키보드 탐색(roving tabIndex)을 제공하는 컴포넌트
 * * `items`가 있으면 해당 트리를 렌더링하고, 없으면 `depth`/`breadth` 기반으로 내부에서 기본 트리를 생성하여 렌더링한다
 * * 확장 상태(`expandedIds`)와 선택 상태(`selectedId`)는 각각 controlled / uncontrolled를 지원한다
 * * 키보드 탐색을 위해 선택 상태와 분리된 `activeId`를 유지하며, roving tabIndex 패턴으로 포커스를 제어한다
 *
 * * 동작 규칙
 *   * 확장 상태 관리
 *     * `expandedIds`가 전달되면 controlled 모드로 동작하며 내부 상태는 사용하지 않는다
 *     * uncontrolled 모드에서는 `defaultExpandedIds`로 초기화된 내부 state를 사용한다
 *     * 개별 노드 확장은 Set 기반 토글로 처리되며, 결과는 항상 id 배열 형태로 반영된다
 *     * 전체 펼치기/접기는 트리 전체 id 목록(`allIds`)을 기준으로 일괄 처리된다
 *   * 선택 처리
 *     * 선택 시 항상 `activeId`를 동일 id로 갱신하여 키보드 포커스 기준을 동기화한다
 *     * controlled 모드에서는 `onSelect`만 호출하고 내부 선택 state는 변경하지 않는다
 *     * uncontrolled 모드에서는 내부 선택 state를 갱신한 뒤 `onSelect`를 호출한다
 *   * 클릭 이벤트 우선순위
 *     * disabled 노드는 선택, 확장, leaf 클릭 모두 차단된다
 *     * Row 클릭 시: 선택 처리 → (`expandOnLabelClick` && hasChildren)이면 확장 토글 → leaf 노드일 경우에만 `node.onClick` 호출
 *     * 확장 아이콘 영역 클릭 시: 이벤트 전파를 차단하고, hasChildren인 경우에만 확장 토글을 수행한다
 *   * 키보드 네비게이션
 *     * ArrowUp / ArrowDown: visible 노드 리스트 기준으로 이전/다음 노드로 포커스 이동
 *     * ArrowRight: 닫힌 부모 노드는 확장, 열린 부모 노드는 첫 번째 자식으로 이동
 *     * ArrowLeft: 열린 부모 노드는 접기, 닫힌 노드는 부모로 이동
 *     * Enter / Space: 선택 처리 수행, leaf 노드인 경우에만 `node.onClick` 추가 호출
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 루트는 `role="tree"` + `tabIndex=0`을 가지며, 포커스 진입 시 active 노드로 실제 DOM 포커스를 이동한다
 *   * 각 노드는 `role="treeitem"`을 사용하고 roving tabIndex 패턴으로 활성 노드만 포커스를 허용한다
 *   * 계층 표현은 `level * 16px` padding-left 규칙으로 처리된다
 *   * active 상태는 border, selected 상태는 background로 시각 구분된다
 *   * ChildrenGroup은 max-height / opacity / transform 트랜지션으로 확장·접기 애니메이션을 처리한다
 *
 * * 데이터 처리 규칙
 *   * `items`가 없을 경우에만 `depth` / `breadth` 기반 더미 트리를 내부에서 생성한다
 *   * 전체 노드 탐색 및 키보드 이동을 위해 트리를 flat 구조로 변환하고,
 *     부모의 확장 상태에 따라 `isVisible`을 계산하여 실제 렌더/이동 기준으로 사용한다
 *   * 아이콘 크기는 `size` props를 기준으로 상위(TreeView)에서 계산하여 하위 컴포넌트에 전달한다
 *   * 클라이언트 제어 컴포넌트이며, 서버 상태 동기화 로직은 포함하지 않는다
 *
 * @module TreeView
 * 계층형 트리 데이터를 키보드/마우스 인터랙션과 함께 표시하는 UI 컴포넌트
 *
 * @usage
 * <TreeView
 *   items={items}
 *   expandedIds={expandedIds}
 *   selectedId={selectedId}
 *   onExpandedChange={onExpandedChange}
 *   onSelect={onSelect}
 * />
 *
/---------------------------------------------------------------------------**/

const TreeView = ({
  items,
  depth = 3,
  breadth = 4,

  defaultExpandedIds = [],
  expandedIds,
  onExpandedChange,

  defaultSelectedId = null,
  selectedId,
  onSelect,

  expandOnLabelClick = false,
  showHeaderControls = true,
  showFooterButtons = true,

  size = "M",
  ...baseProps
}: TreeViewProps) => {
  // * expandedIds controlled/uncontrolled 모드 여부 판단
  const isControlledExpanded = expandedIds !== undefined
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<string[]>(defaultExpandedIds)

  // * selectedId controlled/uncontrolled 모드 분리
  const isControlledSelected = selectedId !== undefined
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState<string | null>(
    defaultSelectedId ?? null,
  )

  // * activeId는 roving tabIndex/키보드 포커스용 (selected 동기화)
  const [activeId, setActiveId] = useState<string | null>(
    (isControlledSelected ? selectedId : uncontrolledSelectedId) ?? null,
  )

  const rootRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const buildIdRef = useRef(0)

  // * Icon size는 상위(TreeView)에서 계산해서 전달
  const iconSize = useMemo(() => {
    if (size === "S") return 12
    if (size === "L") return 16
    return 14
  }, [size])

  const chevronSize = useMemo(() => {
    if (size === "S") return 12
    if (size === "L") return 16
    return 14
  }, [size])

  // * depth/breadth 기반 기본 트리 데이터 생성 (items 없을 때만)
  const builtItems = useMemo<TreeNodeType[]>(() => {
    if (items && items.length) return items

    const makeNodes = (d: number, prefix: string): TreeNodeType[] => {
      if (d <= 0) return []

      return Array.from({ length: breadth }).map((_, i) => {
        buildIdRef.current += 1
        const id = `${prefix}-${i + 1}-${buildIdRef.current}`
        const hasChildren = d > 1

        return {
          id,
          label: `Node ${prefix}.${i + 1}`,
          icon: hasChildren ? "Folder" : "File",
          children: hasChildren ? makeNodes(d - 1, `${prefix}.${i + 1}`) : undefined,
          onClick: hasChildren
            ? undefined
            : (clickedId) => {
                void clickedId
              },
        }
      })
    }

    buildIdRef.current = 0
    return makeNodes(depth, "1")
  }, [items, depth, breadth])

  // * 현재 expanded 목록을 controlled/uncontrolled에 맞게 선택
  const expandedList = isControlledExpanded ? (expandedIds as string[]) : uncontrolledExpanded
  const expandedSet = useMemo(() => new Set(expandedList), [expandedList])

  // * expanded 상태 업데이트 (controlled는 콜백, uncontrolled는 내부 state)
  const setExpanded = useCallback(
    (next: string[]) => {
      if (isControlledExpanded) onExpandedChange?.(next)
      else setUncontrolledExpanded(next)
    },
    [isControlledExpanded, onExpandedChange],
  )

  // * 전체 노드 id 목록(Expand all)에 사용
  const allIds = useMemo(() => {
    const result: string[] = []

    const walk = (nodes: TreeNodeType[]) => {
      nodes.forEach((n) => {
        result.push(n.id)
        if (n.children?.length) walk(n.children)
      })
    }

    walk(builtItems)
    return result
  }, [builtItems])

  // * 전체 펼치기/접기
  const expandAll = useCallback(() => setExpanded(allIds), [allIds, setExpanded])
  const collapseAll = useCallback(() => setExpanded([]), [setExpanded])

  // * 헤더 ToggleButton selectedValue는 항상 string을 보장 (undefined 금지)
  const headerSelectedValue = useMemo<"expand" | "collapse">(() => {
    if (!showHeaderControls) return "expand"
    if (expandedList.length === 0) return "collapse"
    if (expandedList.length === allIds.length && allIds.length > 0) return "expand"
    return "expand"
  }, [expandedList.length, allIds.length, showHeaderControls])

  // * 단일 노드 expanded 토글
  const toggleExpanded = useCallback(
    (id: string) => {
      const next = new Set(expandedSet)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setExpanded(Array.from(next))
    },
    [expandedSet, setExpanded],
  )

  // * 트리 구조를 순회하여 flat 리스트 생성 (키보드 탐색/가시성 계산용)
  const flat = useMemo<FlatNode[]>(() => {
    const out: FlatNode[] = []

    const walk = (
      nodes: TreeNodeType[],
      level: number,
      parentId: string | null,
      parentVisible: boolean,
    ) => {
      nodes.forEach((node) => {
        const hasChildren = !!node.children?.length
        const isExpanded = expandedSet.has(node.id)
        const isVisible = parentVisible

        out.push({
          id: node.id,
          node,
          level,
          parentId,
          hasChildren,
          isExpanded,
          isVisible,
        })

        const nextVisible = parentVisible && (!hasChildren || isExpanded)
        if (hasChildren) walk(node.children!, level + 1, node.id, nextVisible)
      })
    }

    walk(builtItems, 0, null, true)
    return out
  }, [builtItems, expandedSet])

  // * 화면에 표시되는 노드만 추출 (키보드 Up/Down 이동 기준)
  const visibleFlat = useMemo(() => flat.filter((n) => n.isVisible), [flat])

  const selectedValue = isControlledSelected ? (selectedId ?? null) : uncontrolledSelectedId

  // * 특정 노드로 포커스 이동
  const focusItem = useCallback((id: string | null) => {
    if (!id) return
    const el = itemRefs.current[id]
    if (!el) return
    el.focus()
  }, [])

  // * 초기 activeId 보정 (선택값이 없을 때 첫 visible 노드를 활성화)
  useEffect(() => {
    if (!activeId && visibleFlat.length) setActiveId(visibleFlat[0].id)
  }, [activeId, visibleFlat])

  // * activeId 변경 시 실제 DOM 포커스 동기화
  useEffect(() => {
    if (!activeId) return
    focusItem(activeId)
  }, [activeId, focusItem])

  // * selected 변경 시 activeId 동기화
  useEffect(() => {
    const nextSelected = selectedValue ?? null
    if (nextSelected !== null) setActiveId(nextSelected)
  }, [selectedValue])

  // * activeId의 visibleFlat index 계산
  const getFlatIndex = (id: string | null) => {
    if (!id) return -1
    return visibleFlat.findIndex((n) => n.id === id)
  }

  // * flat에서 특정 id 노드 조회
  const getNodeById = (id: string) => flat.find((n) => n.id === id)

  // * 부모 id 조회
  const getParentId = (id: string) => {
    const n = getNodeById(id)
    return n?.parentId ?? null
  }

  // * 현재 노드의 첫번째 자식 id 조회 (expanded 이동용)
  const getFirstChildId = (id: string) => {
    const idx = flat.findIndex((n) => n.id === id)
    if (idx < 0) return null

    const base = flat[idx]
    const next = flat[idx + 1]
    if (!next) return null

    if (next.level === base.level + 1 && next.parentId === id) return next.id
    return null
  }

  // * 노드 선택 처리 (selected + activeId + 외부 콜백)
  const handleSelect = (id: string, node: TreeNodeType) => {
    setActiveId(id)
    if (isControlledSelected) onSelect?.(id, node)
    else {
      setUncontrolledSelectedId(id)
      onSelect?.(id, node)
    }
  }

  // * Arrow/Enter 기반 트리 키보드 네비게이션
  const onKeyDown = (e: React.KeyboardEvent) => {
    const currentIdx = getFlatIndex(activeId)
    if (currentIdx < 0) return

    const current = visibleFlat[currentIdx]
    const currentId = current.id

    if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = visibleFlat[currentIdx + 1]
      if (next) setActiveId(next.id)
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      const prev = visibleFlat[currentIdx - 1]
      if (prev) setActiveId(prev.id)
      return
    }

    if (e.key === "ArrowRight") {
      e.preventDefault()
      if (current.hasChildren && !current.isExpanded) {
        toggleExpanded(currentId)
        return
      }
      const child = getFirstChildId(currentId)
      if (child) setActiveId(child)
      return
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault()
      if (current.hasChildren && current.isExpanded) {
        toggleExpanded(currentId)
        return
      }
      const parentId = getParentId(currentId)
      if (parentId) setActiveId(parentId)
      return
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (current.node.disabled) return

      handleSelect(currentId, current.node)

      // * leaf-only onClick
      if (!current.hasChildren) {
        current.node.onClick?.(currentId, current.node)
      }
      return
    }
  }

  const onRootFocus = () => {
    if (!activeId && visibleFlat.length) {
      setActiveId(visibleFlat[0].id)
      return
    }
    focusItem(activeId)
  }

  // * label 렌더링 (string이면 Typography 적용)
  const renderLabel = (label: ReactNode, isSelected: boolean, isDisabled: boolean) => {
    if (typeof label === "string") {
      return (
        <Typography
          variant="b1Bold"
          color={
            isDisabled
              ? theme.colors.text.disabled
              : isSelected
                ? theme.colors.primary[400]
                : theme.colors.text.primary
          }
          text={label}
          sx={{ userSelect: "none", lineHeight: 0 }}
        />
      )
    }
    return label
  }

  // * 트리 구조 렌더링 (재귀)
  const renderTree = (nodes: TreeNodeType[], level: number) => {
    return nodes.map((node) => {
      const hasChildren = !!node.children?.length
      const isExpanded = expandedSet.has(node.id)
      const isSelected = !!selectedValue && selectedValue === node.id
      const isActive = activeId === node.id
      const isDisabled = !!node.disabled

      // * row 클릭 시 선택/확장/leaf onClick 처리
      const handleRowClick = () => {
        if (isDisabled) return

        handleSelect(node.id, node)

        if (expandOnLabelClick && hasChildren) {
          toggleExpanded(node.id)
          return
        }

        // * leaf-only onClick
        if (!hasChildren) node.onClick?.(node.id, node)
      }

      return (
        <NodeWrap key={node.id} $level={level} role="none">
          <NodeRow
            ref={(el) => {
              itemRefs.current[node.id] = el
            }}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected ? true : undefined}
            aria-disabled={isDisabled ? true : undefined}
            aria-level={level + 1}
            tabIndex={isActive ? 0 : -1}
            $selected={isSelected}
            $active={isActive}
            $disabled={isDisabled}
            $leafClickable={!hasChildren && !!node.onClick && !isDisabled}
            onClick={handleRowClick}
          >
            <ExpandHitArea
              type="button"
              $visible={hasChildren}
              $disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation()
                if (isDisabled) return
                if (!hasChildren) return
                toggleExpanded(node.id)
              }}
              aria-label={isExpanded ? "collapse" : "expand"}
            >
              {hasChildren ? (
                <Icon name={isExpanded ? "ArrowDown" : "ArrowRight"} size={chevronSize} />
              ) : null}
            </ExpandHitArea>

            {node.icon ? (
              <Flex align="center">
                <Icon name={node.icon} size={iconSize} />
              </Flex>
            ) : null}

            {renderLabel(node.label, isSelected, isDisabled)}
          </NodeRow>

          <ChildrenGroup $open={hasChildren && isExpanded} role="group">
            {hasChildren && isExpanded ? renderTree(node.children!, level + 1) : null}
          </ChildrenGroup>
        </NodeWrap>
      )
    })
  }

  return (
    <TreeRoot
      ref={rootRef}
      role="tree"
      tabIndex={0}
      onFocus={onRootFocus}
      onKeyDown={onKeyDown}
      {...baseProps}
    >
      {showHeaderControls ? (
        <Flex width={"100%"} mb={8} justify="flex-end">
          <ToggleButton
            buttons={[
              { label: "Expand all", value: "expand" },
              { label: "Collapse all", value: "collapse" },
            ]}
            selectedValue={headerSelectedValue}
            onClick={(v) => {
              if (v === "expand") expandAll()
              if (v === "collapse") collapseAll()
            }}
            size="S"
          />
        </Flex>
      ) : null}

      <Flex width={"100%"} direction="column" gap={2}>
        {renderTree(builtItems, 0)}
      </Flex>

      {showFooterButtons ? (
        <Flex width={"100%"} justify="flex-end" gap={8} mt={10}>
          <Button
            text="Expand all"
            variant="outlined"
            color="normal"
            size="S"
            onClick={() => expandAll()}
          />
          <Button
            text="Collapse all"
            variant="outlined"
            color="normal"
            size="S"
            onClick={() => collapseAll()}
          />
        </Flex>
      ) : null}
    </TreeRoot>
  )
}

const TreeRoot = styled.div<BaseMixinProps>`
  ${BaseMixin}
  width: 100%;
  outline: none;
`

const NodeWrap = styled.div<{ $level: number }>`
  width: 100%;
  padding-left: ${({ $level }) => `${$level * 16}px`};
`

const NodeRow = styled.div<{
  $selected: boolean
  $active: boolean
  $disabled: boolean
  $leafClickable: boolean
}>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;

  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary[200] : "transparent")};
  border-radius: ${({ theme }) => theme.borderRadius[8]};
  background: ${({ $selected }) => ($selected ? theme.colors.primary[50] : "transparent")};

  padding: 6px 8px;

  cursor: ${({ $disabled, $leafClickable }) =>
    $disabled ? "not-allowed" : $leafClickable ? "pointer" : "default"};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.08s ease;

  &:hover {
    background: ${({ $selected, $disabled }) =>
      $disabled
        ? "transparent"
        : $selected
          ? theme.colors.primary[50]
          : theme.colors.background.default};
  }

  &:active {
    transform: ${({ $disabled }) => ($disabled ? "none" : "translateY(0.5px)")};
  }
`

const ExpandHitArea = styled.button<{ $visible: boolean; $disabled: boolean }>`
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: none;
  background: transparent;
  padding: 0;
  margin: 0;

  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};

  transition:
    transform 0.18s ease,
    opacity 0.18s ease;

  &:active {
    transform: ${({ $disabled }) => ($disabled ? "none" : "scale(0.96)")};
  }
`

const ChildrenGroup = styled.div<{ $open: boolean }>`
  width: 100%;
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? "999px" : "0px")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) => ($open ? "translateY(0px)" : "translateY(-2px)")};
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease,
    transform 0.18s ease;
`

TreeView.displayName = "TreeView"
export default TreeView
