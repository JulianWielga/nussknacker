import * as joint from "jointjs"
import {dia} from "jointjs"
import {defaultLink} from "./EspNode/link"
import {arrowMarker} from "./arrowMarker"

export function getPaper(opts: dia.Paper.Options, canWrite: boolean) {
  const paper = new joint.dia.Paper({
    ...opts,
    gridSize: 1,
    async: false,
    snapLinks: {radius: 75},
    interactive: (cellView: dia.CellView) => {
      const {model} = cellView
      if (!canWrite) {
        return false
      } else if (model instanceof joint.dia.Link) {
        // Disable the default vertex add and label move functionality on pointerdown.
        return {vertexAdd: false, labelMove: false}
        // eslint-disable-next-line i18next/no-literal-string
      } else if (model.get && model.get("backgroundObject")) {
        //Disable moving group rect
        return false
      } else {
        return true
      }
    },
    linkPinning: false,
    defaultLink: defaultLink,
  })
  joint.V(paper.defs).append(arrowMarker)
  return paper
}
