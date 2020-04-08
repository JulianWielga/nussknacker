import {Reducer} from "../actions/reduxTypes"
import {GraphState} from "./graphState"

export const reducer: Reducer<GraphState> = (state, action) => {
  switch (action.type) {
    case "EXPAND_GROUP":
      return {
        ...state,
        groups: [...state.groups, action.id],
      }
    case "COLLAPSE_GROUP":
      return {
        ...state,
        groups: state.groups.filter(id => id !== action.id),
      }
    case "COLLAPSE_ALL_GROUPS":
      return {
        ...state,
        groups: [],
      }
    case "EDIT_GROUP":
      return {
        ...state,
        groups: state.groups.map(id => id === action.oldGroupId ? action.newGroup.id : id),
      }
    default:
      return state
  }
}
