import React, {
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import Icon from "../Icon/Icon"
import { IconName } from "../Icon/icon-loader"
import ToggleButton from "../ToggleButton/ToggleButton"
import Button from "../Button/Button"

export type TreeNodeType = {
  id: string
  label: ReactNode
  children?: TreeNodeType[]
  disabled?: boolean
  icon?: IconName
  onClick?: (id: string, node: TreeNodeType) => void
}

export type TreeViewProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    items?: TreeNodeType[]
    depth?: number
    breadth?: number
    defaultExpandedIds?: string[]
    expandedIds?: string[]
    onExpandedChange?: (expandedIds: string[]) => void
    selectedId?: string | null
    onSelect?: (id: string, node: TreeNodeType) => void
    expandOnLabelClick?: boolean
    showHeaderControls?: boolean
    showFooterButtons?: boolean
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

* ! TreeView
*
* * 계층형 데이터를 트리 구조로 렌더링하는 TreeView 컴포넌트
* * items 미지정 시 depth / breadth 기반 데모 트리 자동 생성
* * expandedIds controlled/uncontrolled 모두 지원 (defaultExpandedIds 포함)
* * expandAll / collapseAll 헤더/푸터 컨트롤 제공 옵션 지원
* * 노드 선택(selectedId) controlled/uncontrolled 흐름 지원 (activeId 내부 포커스 상태)
* * 키보드 네비게이션 지원 (ArrowUp/Down/Left/Right, Enter/Space)
* * 폴더/파일 아이콘 및 확장 토글(chevron) UI 제공
* * expandOnLabelClick 옵션으로 라벨 클릭 시 확장/축소 동작 지원
* * leaf 노드에서만 node.onClick 호출 (기본 클릭은 선택 처리)
* * a11y 속성(role/treeitem, aria-expanded, aria-selected) 및 roving tabIndex 적용
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상, borderRadius, transition 시스템 활용
*
* @module TreeView
* 계층형(Tree) UI를 제공하는 트리 뷰 컴포넌트입니다.
* - `items`를 전달하면 해당 데이터를 렌더링하고, 미전달 시 depth/breadth 기반 샘플 데이터를 생성합니다.
* - 확장 상태는 `expandedIds`(controlled) 또는 내부 상태(uncontrolled)로 관리합니다.
* - 선택 상태는 `selectedId`(controlled) 또는 내부 activeId로 포커스/키보드 이동을 처리합니다.
* - 키보드:
*   - ArrowUp/Down: 이전/다음 가시 노드로 이동
*   - ArrowRight: 확장 또는 첫 자식으로 이동
*   - ArrowLeft: 축소 또는 부모로 이동
*   - Enter/Space: 선택 처리, leaf 노드면 onClick 호출
* - 헤더/푸터 컨트롤로 전체 펼치기/접기 UI를 옵션으로 제공합니다.
*
* @usage
* <TreeView items={items} selectedId={id} onSelect={setId} />
* <TreeView defaultExpandedIds={["a"]} expandOnLabelClick showFooterButtons={false} />

/---------------------------------------------------------------------------**/

const TreeView = ({
  items,
  depth = 3,
  breadth = 4,
  defaultExpandedIds = [],
  expandedIds,
  onExpandedChange,
  selectedId,
  onSelect,
  expandOnLabelClick = false,
  showHeaderControls = true,
  showFooterButtons = true,
  ...baseProps
}: TreeViewProps) => {
  // * expandedIds controlled/uncontrolled 모드 여부 판단
  const isControlledExpanded = expandedIds !== undefined
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<string[]>(defaultExpandedIds)

  // * selectedId controlled 값을 내부 activeId(키보드 포커스/활성)로 동기화
  const [activeId, setActiveId] = useState<string | null>(selectedId ?? null)
  useEffect(() => {
    if (selectedId !== undefined) setActiveId(selectedId ?? null)
  }, [selectedId])

  const rootRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const buildIdRef = useRef(0)

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
                // no-op default
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

  // * 노드 선택 처리 (activeId + 외부 콜백)
  const handleSelect = (id: string, node: TreeNodeType) => {
    setActiveId(id)
    onSelect?.(id, node)
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
      const isSelected = !!selectedId && selectedId === node.id
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
                <Icon name={isExpanded ? "ArrowDown" : "ArrowRight"} size={12} />
              ) : null}
            </ExpandHitArea>

            {node.icon ? (
              <Flex align="center">
                <Icon name={node.icon} size={12} />
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
    <TreeRoot ref={rootRef} role="tree" tabIndex={-1} onKeyDown={onKeyDown} {...baseProps}>
      {showHeaderControls ? (
        <Flex width={"100%"} mb={8} justify="flex-end">
          <ToggleButton
            buttons={[
              { label: "Expand all", value: "expand" },
              { label: "Collapse all", value: "collapse" },
            ]}
            selectedValue={"expand"}
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
