/* eslint-disable i18next/no-literal-string */
import {Layout} from "../../actions/nk"
import {GroupId, Process, ProcessDefinitionData} from "../../types"
import {boundingRect, makeElement, makeLink} from "./EspNode"
import NodeUtils from "./NodeUtils"

export function redrawGraph(
  process: Process,
  expandedGroups: GroupId[],
  processCounts,
  processDefinitionData: ProcessDefinitionData,
  layout: Layout,
  graph: joint.dia.Graph,
  _updateChangedCells,
  _layout,
) {
  const nodesWithGroups = NodeUtils.nodesFromProcess(process, expandedGroups)
  const edgesWithGroups = NodeUtils.edgesFromProcess(process, expandedGroups)

  const nodes = nodesWithGroups.map(makeElement(processCounts, processDefinitionData))
  const edges = edgesWithGroups.map(makeLink)

  const cells = [].concat(nodes, edges)

  const newCells = cells.filter(cell => !graph.getCell(cell.id))
  const deletedCells = graph.getCells().filter(oldCell => !cells.find(cell => cell.id === oldCell.id))
  const changedCells = cells.filter(cell => {
    const old = graph.getCell(cell.id)
    //TODO: some different ways of comparing?
    return old && JSON.stringify(old.get("definitionToCompare")) !== JSON.stringify(cell.get("definitionToCompare"))
  })

  if (newCells.length + deletedCells.length + changedCells.length > 3) {
    graph.resetCells(cells)
  } else {
    graph.removeCells(deletedCells)
    _updateChangedCells(changedCells)
    graph.addCells(newCells)
  }

  _layout(layout)

  NodeUtils.getExpandedGroups(process, expandedGroups)
    .map(group => boundingRect(cells, group, layout, NodeUtils.createGroupNode(nodesWithGroups, group)))
    .forEach(r => r.addTo(graph).toBack())
}
