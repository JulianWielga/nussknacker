import React, {useMemo, useEffect, EffectCallback, memo, useState} from "react"
import {DragDropContext, DropResult} from "react-beautiful-dnd"
import {ToolbarsSide} from "../../../reducers/toolbars"
import {useDispatch} from "react-redux"
import {moveToolbar, registerToolbars} from "../../../actions/nk/toolbars"
import {ToolbarsPanel} from "./ToolbarsPanel"
import cn from "classnames"

import styles from "./ToolbarsLayer.styl"
import {Toolbar} from "../Toolbars"
import {ScrollToggleSidePanel} from "./ScrollToggleSidePanel"

function useMemoizedIds<T extends { id: string }>(array: T[]): string {
  return useMemo(() => array.map(v => v.id).join(), [array])
}

function useIdsEffect<T extends { id: string }>(effect: EffectCallback, array) {
  const [hash] = useMemoizedIds(array)
  return useEffect(effect, [hash])
}

export const ToolbarDraggableType = "TOOLBAR"

function ToolbarsLayer(props: { toolbars: Toolbar[] }) {
  const dispatch = useDispatch()
  const {toolbars} = props

  const [isDragging, setIsDragging] = useState(false)

  useIdsEffect(() => {dispatch(registerToolbars(toolbars))}, toolbars)

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false)
    const {destination, type, reason, source} = result
    if (reason === "DROP" && type === ToolbarDraggableType && destination) {
      dispatch(moveToolbar(
        [source.droppableId, source.index],
        [destination.droppableId, destination.index],
      ))
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={() => {setIsDragging(true)}}>

      <ScrollToggleSidePanel isDragging={isDragging} side="LEFT">
        <ToolbarsPanel
          availableToolbars={toolbars}
          side={ToolbarsSide.TopLeft}
          className={cn(styles.top)}
        />
        <ToolbarsPanel
          availableToolbars={toolbars}
          side={ToolbarsSide.BottomLeft}
          className={cn(styles.bottom)}
        />
      </ScrollToggleSidePanel>

      <ScrollToggleSidePanel isDragging={isDragging} side="RIGHT">
        <ToolbarsPanel
          availableToolbars={toolbars}
          side={ToolbarsSide.TopRight}
          className={cn(styles.top)}
        />
        <ToolbarsPanel
          availableToolbars={toolbars}
          side={ToolbarsSide.BottomRight}
          className={cn(styles.bottom)}
        />
      </ScrollToggleSidePanel>

    </DragDropContext>
  )
}

export default memo(ToolbarsLayer)
