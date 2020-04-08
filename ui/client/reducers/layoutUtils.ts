import {defaultsDeep} from "lodash"
import {GraphState, ProcessToDisplayState} from "./graphState"
import {Layout} from "../actions/nk"

function toString(layout: Layout): string {
  return layout.map(({id, position: {x, y}}) => `"${id}",${x},${y}`).join(";")
}

export function fromString(layoutStr: string): Layout {
  if (!layoutStr) {
    return []
  }
  return layoutStr.split(/;/).map(l => {
    const [_, id, x, y] = l.split(/^"(.*)",([0-9\-]+),([0-9\-]+)/)
    return {id, position: {x: parseFloat(x), y: parseFloat(y)}}
  })
}

export function appendToProcess(state: ProcessToDisplayState, layout: Layout): GraphState {
  return defaultsDeep({
    properties: {
      additionalFields: {
        properties: {
          layout: toString(layout),
        },
      },
    },
  }, state)
}

