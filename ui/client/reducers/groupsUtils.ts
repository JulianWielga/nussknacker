import {ProcessToDisplayState, GraphState} from "./graphState"
import {GroupId} from "../types"
import {Layout} from "../actions/nk"
import {defaultsDeep} from "lodash"

export function fromString(groupsStr: string): Layout {
  if (!groupsStr) {
    return []
  }
  return JSON.parse(groupsStr)
}

function toString(groups: GroupId[]): string {
  return JSON.stringify(groups)
}

export function appendToProcess(state: ProcessToDisplayState, groups: GroupId[]): GraphState {
  return defaultsDeep({
    properties: {
      additionalFields: {
        properties: {
          expandedGroups: toString(groups),
        },
      },
    },
  }, state)
}
