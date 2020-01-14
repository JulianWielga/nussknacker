// @flow
import type Moment from "moment"
import {dateFormat} from "../../config"
import HttpService from "../../http/HttpService"
import type {ThunkAction} from "../reduxTypes.flow"

export function displayProcessCounts(processCounts: $FlowTODO): $FlowTODO {
  return {
    type: "DISPLAY_PROCESS_COUNTS",
    processCounts: processCounts,
  }
}

export function fetchAndDisplayProcessCounts(processName: string, from: Moment, to: Moment): ThunkAction {
  return (dispatch) =>
      HttpService.fetchProcessCounts(
          processName,
          from ? from.format(dateFormat) : null,
          to ? to.format(dateFormat) : null,
      ).then((response) => dispatch(displayProcessCounts(response.data)))
}