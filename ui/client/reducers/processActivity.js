// @flow

import type {Action} from "../actions/reduxTypes.flow"

export type ProcessActivityState = {
  comments: $FlowTODO[],
  attachments: $FlowTODO[],
}

const emptyProcessActivity: ProcessActivityState = {
  comments: [],
  attachments: [],
}

export function reducer(state: ProcessActivityState = emptyProcessActivity, action: Action): ProcessActivityState {
  switch (action.type) {
    case "DISPLAY_PROCESS_ACTIVITY": {
      return {
        ...state,
        comments: action.comments,
        attachments: action.attachments,
      }
    }
    default:
      return state
  }
}