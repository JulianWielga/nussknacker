/* eslint-disable i18next/no-literal-string */
import * as joint from "jointjs"
import dagre, {graphlib} from "dagre"

export function directedLayout(graph: joint.dia.Graph) {
  //TODO `layout` method can take graph or cells
  //when joint.layout.DirectedGraph.layout(this.graph) is used here
  //  then `toFront()` method works as expected but there are issues with group fold/unfold
  //when joint.layout.DirectedGraph.layout(this.graph.getCells().filter(cell => !cell.get('backgroundObject')) is used here
  // then `toFront()` method does not work at all, but group fold/unfold works just fine
  const cells = graph.getCells().filter(cell => !cell.get("backgroundObject"))

  console.time("directedLayout")
  joint.layout.DirectedGraph.layout(cells, {
    graphlib,
    dagre,
    nodeSep: 0,
    edgeSep: 0,
    rankSep: 75,
    rankDir: "TB",
  })
  console.timeEnd("directedLayout")
}
