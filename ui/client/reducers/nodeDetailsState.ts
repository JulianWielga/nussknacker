import {Action} from "../actions/reduxTypes"
import {ValidationData} from "../actions/nk"
import {NodeValidationError, UIParameter} from "../types"

export type NodeDetailsState = {
    parameters? : Map<string, UIParameter>,
    validationErrors: NodeValidationError[],
    validationPerformed: boolean,
}

const initialState: NodeDetailsState = {
  validationErrors: [],
  validationPerformed: false,
}

export function reducer(state: NodeDetailsState = initialState, action: Action): NodeDetailsState {
  switch (action.type) {
    case "NODE_VALIDATION_UPDATED": {
      const {validationData} = action
      return {
        ...state,
        validationErrors: validationData.validationErrors,
        parameters: validationData.parameters,
        validationPerformed: validationData.validationPerformed,
      }
    }
    case "DISPLAY_MODAL_NODE_DETAILS":
      return initialState
    default:
      return state
  }
}