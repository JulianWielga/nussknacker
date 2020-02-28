import {Action} from "../actions/reduxTypes"

export enum ToolbarsSide {
  TopRight = "TOP-RIGHT",
  BottomRight = "BOTTOM-RIGHT",
  Hidden = "HIDDEN",
}

export type ToolbarsState = {
  positions: { [side in ToolbarsSide]?: string[] },
  collapsed: string[],
}

const defaultState: ToolbarsState = {
  positions: {},
  collapsed: [],
}

export function reducer(state: ToolbarsState = defaultState, action: Action): ToolbarsState {
  switch (action.type) {
    case "MOVE_TOOLBAR":
      const [fromToolbar, fromIndex] = action.from
      const [toToolbar, toIndex] = action.to

      const src = [].concat(state.positions[fromToolbar])
      const [item] = src.splice(fromIndex, 1)

      const dst = fromToolbar === toToolbar ? src : [].concat(state.positions[toToolbar])
      dst.splice(toIndex, 0, item)

      return {
        ...state,
        positions: {
          ...state.positions,
          [fromToolbar]: src,
          [toToolbar]: dst,
        },
      }

    case "REGISTER_TOOLBARS":
      const groups = Object.values(state.positions)
      const newToolbars = action.toolbars.filter(([id]) => !groups.some(g => g.includes(id)))
      const nextPositions = newToolbars.reduce((nextState, [id, side = ToolbarsSide.TopRight]) => {
        const currentValues = nextState[side] || []
        return {...nextState, [side]: [...currentValues, id]}
      }, state.positions)
      return {...state, positions: nextPositions}

    case "TOGGLE_TOOLBAR":
      return {
        ...state,
        collapsed: action.isCollapsed ?
          [...state.collapsed, action.id] :
          state.collapsed.filter(i => i !== action.id),
      }

    default:
      return state
  }
}
