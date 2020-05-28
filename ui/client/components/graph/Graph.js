/* eslint-disable i18next/no-literal-string */
import * as joint from "jointjs"
import "jointjs/dist/joint.css"
import _, {cloneDeep, defer} from "lodash"
import PropTypes from "prop-types"
import React from "react"
import svgPanZoom from "svg-pan-zoom"
import {getProcessCategory, getSelectionState} from "../../reducers/selectors/graph"
import {getLoggedUser, getProcessDefinitionData} from "../../reducers/selectors/settings"
import "../../stylesheets/graph.styl"
import "./svg-export/export.styl"
import * as GraphUtils from "./GraphUtils"
import * as JointJsGraphUtils from "./JointJsGraphUtils"
import EdgeDetailsModal from "./node-modal/EdgeDetailsModal"
import NodeDetailsModal from "./node-modal/NodeDetailsModal"
import NodeUtils from "./NodeUtils"
import {prepareSvg} from "./svg-export/prepareSvg"
import {drawGraph, directedLayout, isBackgroundObject, createPaper} from "./GraphPartialsInTS"

export class Graph extends React.Component {

  redrawing = false

  static propTypes = {
    processToDisplay: PropTypes.object.isRequired,
    groupingState: PropTypes.array,
    loggedUser: PropTypes.object.isRequired,
    connectDropTarget: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.graph = new joint.dia.Graph()
    this.graph.on("remove", (e, f) => {
      if (e.isLink && !this.redrawing) {
        this.props.actions.nodesDisconnected(e.attributes.source.id, e.attributes.target.id)
      }
    })
    this.nodesMoving()

    this.espGraphRef = React.createRef()
    this.parent = document.getElementById(this.props.parent)
  }

  getEspGraphRef = () => {
    return this.espGraphRef.current
  }

  componentDidMount() {
    this.processGraphPaper = this.createPaper()
    this.processGraphPaper.freeze()
    this.drawGraph(
      this.props.processToDisplay,
      this.props.layout,
      this.props.processCounts,
      this.props.processDefinitionData,
      this.props.expandedGroups,
    )
    this.processGraphPaper.unfreeze()
    this._prepareContentForExport()
    this.panAndZoom = this.enablePanZoom()
    this.changeNodeDetailsOnClick()
    this.hooverHandling()
    this.cursorBehaviour()
    this.highlightNodes(this.props.processToDisplay, this.props.nodeToDisplay)
    this.fitSmallAndLargeGraphs()
  }

  canAddNode(node) {
    return this.props.capabilities.write &&
      NodeUtils.isNode(node) &&
      !NodeUtils.nodeIsGroup(node) &&
      NodeUtils.isAvailable(node, this.props.processDefinitionData, this.props.processCategory)
  }

  addNode(node, position) {
    if (this.canAddNode(node)) {
      this.props.actions.nodeAdded(node, position)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const processChanged = !_.isEqual(this.props.processToDisplay, nextProps.processToDisplay) ||
      !_.isEqual(this.props.layout, nextProps.layout) ||
      !_.isEqual(this.props.processCounts, nextProps.processCounts) ||
      !_.isEqual(this.props.groupingState, nextProps.groupingState) ||
      !_.isEqual(this.props.expandedGroups, nextProps.expandedGroups) ||
      !_.isEqual(this.props.processDefinitionData, nextProps.processDefinitionData)
    if (processChanged) {
      this.drawGraph(
        nextProps.processToDisplay,
        nextProps.layout,
        nextProps.processCounts,
        nextProps.processDefinitionData,
        nextProps.expandedGroups,
      )
    }

    //when e.g. layout changed we have to remember to highlight nodes
    const nodeToDisplayChanged = !_.isEqual(this.props.nodeToDisplay, nextProps.nodeToDisplay)
    const selectedNodesChanged = !_.isEqual(this.props.selectionState, nextProps.selectionState)
    if (processChanged || nodeToDisplayChanged || selectedNodesChanged) {
      this.highlightNodes(nextProps.processToDisplay, nextProps.nodeToDisplay, nextProps.groupingState, nextProps.selectionState)
    }
  }

  componentDidUpdate(previousProps) {
    //we have to do this after render, otherwise graph is not fully initialized yet
    const diff = _.difference(this.props.processToDisplay.nodes.map(n => n.id), previousProps.processToDisplay.nodes.map(n => n.id))
    diff.forEach(nid => {
      const cell = JointJsGraphUtils.findCell(this.graph, nid)
      const cellView = this.processGraphPaper.findViewByModel(cell)
      if (cellView) {
        this.handleInjectBetweenNodes(cellView)
      }
    })
  }

  directedLayout = directedLayout.bind(this)

  forceLayout = () => {
    this.directedLayout()
    defer(this.fitSmallAndLargeGraphs)
  }

  zoomIn() {
    this.panAndZoom.zoomIn()
  }

  zoomOut() {
    this.panAndZoom.zoomOut()
  }

  async exportGraph() {
    return await prepareSvg(this._exportGraphOptions)
  }

  validateConnection = (cellViewS, magnetS, cellViewT, magnetT) => {
    const from = cellViewS.model.id
    const to = cellViewT.model.id
    return magnetT && NodeUtils.canMakeLink(from, to, this.props.processToDisplay, this.props.processDefinitionData)
  }

  createPaper = createPaper.bind(this)

  disconnectPreviousEdge = (previousEdge) => {
    const nodeIds = previousEdge.split("-").slice(0, 2)
    if (this.graphContainsEdge(nodeIds)) {
      this.props.actions.nodesDisconnected(...nodeIds)
    }
  }

  graphContainsEdge(nodeIds) {
    return this.props.processToDisplay.edges.some(edge => edge.from === nodeIds[0] && edge.to === nodeIds[1])
  }

  handleInjectBetweenNodes = (cellView) => {
    const linkBelowCell = JointJsGraphUtils.findLinkBelowCell(this.graph, cellView, this.processGraphPaper)
    if (linkBelowCell) {
      const source = JointJsGraphUtils.findCell(this.graph, linkBelowCell.attributes.source.id)
      const target = JointJsGraphUtils.findCell(this.graph, linkBelowCell.attributes.target.id)
      const middleMan = cellView.model
      const middleManNode = middleMan.attributes.nodeData

      const sourceNodeData = source.attributes.nodeData
      const sourceNode = NodeUtils.nodeIsGroup(sourceNodeData) ? _.last(sourceNodeData.nodes) : sourceNodeData

      const targetNodeData = target.attributes.nodeData
      const targetNode = NodeUtils.nodeIsGroup(targetNodeData) ? _.head(targetNodeData.nodes) : targetNodeData

      if (NodeUtils.nodeIsGroup(middleManNode)) {
        if (!NodeUtils.groupIncludesOneOfNodes(middleManNode, [sourceNode.id, targetNode.id])) {
          // TODO: handle inject when group is middleman
          this.props.notificationActions.info("Injecting group is not possible yet")
        }
      } else if (NodeUtils.nodesAreInOneGroup(this.props.processToDisplay, [sourceNode.id, targetNode.id])) {
        // TODO: handle inject when source and target are in one group
        this.props.notificationActions.info("Injecting node in group is not possible yet")
      } else if (GraphUtils.canInjectNode(
        this.props.processToDisplay,
        sourceNode.id,
        middleMan.id,
        targetNode.id,
        this.props.processDefinitionData,
      )) {
        //TODO: consider doing inject check in actions.js?
        this.props.actions.injectNode(
          sourceNode,
          middleManNode,
          targetNode,
          linkBelowCell.attributes.edgeData.edgeType,
        )
      }
    }
  }

  drawGraph = drawGraph.bind(this)

  _prepareContentForExport = () => {
    const {options, defs} = this.processGraphPaper
    this._exportGraphOptions = {
      options: cloneDeep(options),
      defs: defs.cloneNode(true),
    }
  }

  highlightNodes = (data, nodeToDisplay, groupingState, selectionState) => {
    this.graph.getCells().forEach(cell => {
      this.unhighlightCell(cell, "node-validation-error")
      this.unhighlightCell(cell, "node-focused")
      this.unhighlightCell(cell, "node-focused-with-validation-error")
      this.unhighlightCell(cell, "node-grouping")
    })

    const invalidNodeIds = _.keys((data.validationResult && data.validationResult.errors || {}).invalidNodes)
    const selectedNodeIds = selectionState || []

    invalidNodeIds.forEach(id => selectedNodeIds.includes(id) ?
      this.highlightNode(id, "node-focused-with-validation-error") : this.highlightNode(id, "node-validation-error"));

    (groupingState || []).forEach(id => this.highlightNode(id, "node-grouping"))
    selectedNodeIds.forEach(id => {
      if (!invalidNodeIds.includes(id)) {
        this.highlightNode(id, "node-focused")
      }
    })
  }

  highlightCell(cell, className) {
    this.processGraphPaper.findViewByModel(cell).highlight(null, {
      highlighter: {
        name: "addClass",
        options: {className: className},
      },
    })
  }

  unhighlightCell(cell, className) {
    this.processGraphPaper.findViewByModel(cell).unhighlight(null, {
      highlighter: {
        name: "addClass",
        options: {className: className},
      },
    })
  }

  highlightNode = (nodeId, highlightClass) => {
    const cell = this.graph.getCell(nodeId)
    if (cell) { //prevent `properties` node highlighting
      this.highlightCell(cell, highlightClass)
    }
  }

  changeLayoutIfNeeded = () => {
    let newLayout = this.graph.getElements().filter(el => !isBackgroundObject(el)).map(el => {
      const pos = el.get("position")
      return {id: el.id, position: pos}
    })

    if (!_.isEqual(this.props.layout, newLayout)) {
      this.props.actions && this.props.actions.layoutChanged(newLayout)
    }
  }

  enablePanZoom() {
    const paper = this.processGraphPaper

    const panAndZoom = svgPanZoom(paper.svg, {
      viewportSelector: ".svg-pan-zoom_viewport",
      fit: false,
      contain: false,
      zoomScaleSensitivity: 0.4,
      controlIconsEnabled: false,
      panEnabled: false,
      dblClickZoomEnabled: false,
      minZoom: 0.05,
      maxZoom: 5,
    })

    paper.on("blank:pointerdown", () => {
      panAndZoom.enablePan()
    })

    paper.on("cell:pointerup blank:pointerup", () => {
      panAndZoom.disablePan()
    })

    return panAndZoom
  }

  fitSmallAndLargeGraphs = () => {
    const {panAndZoom} = this
    if (!panAndZoom) {
      return
    }
    panAndZoom.updateBBox()
    panAndZoom.fit()
    const {realZoom} = panAndZoom.getSizes()
    const toZoomBy = realZoom > 1.2 ? 1 / realZoom : 0.8 //the bigger zoom, the further we get
    panAndZoom.zoomBy(toZoomBy)
    panAndZoom.center()
  }

  changeNodeDetailsOnClick() {
    this.processGraphPaper.on("cell:pointerdblclick", (cellView, evt, x, y) => {
      if (this.props.groupingState) {
        return
      }

      const nodeDataId = cellView.model.attributes.nodeData?.id
      if (nodeDataId) {
        const nodeData = this.findNodeById(nodeDataId)
        const prefixedNodeId = this.props.nodeIdPrefixForSubprocessTests + nodeDataId
        this.props.actions.displayModalNodeDetails({...nodeData, id: prefixedNodeId}, this.props.readonly)
      }

      if (cellView.model.attributes.edgeData) {
        this.props.actions.displayModalEdgeDetails(cellView.model.attributes.edgeData)
      }
    })

    if (this.props.singleClickNodeDetailsEnabled) {
      this.processGraphPaper.on("cell:pointerclick", (cellView, evt, x, y) => {

        const nodeDataId = cellView.model.attributes.nodeData?.id
        if (!nodeDataId) {
          return
        }

        this.props.actions.displayNodeDetails(this.findNodeById(nodeDataId))

        if (evt.ctrlKey || evt.metaKey) {
          this.props.actions.expandSelection(nodeDataId)
        } else {
          this.props.actions.resetSelection(nodeDataId)
        }

        //TODO: is this the best place for this? if no, where should it be?
        const targetClass = _.get(evt, "originalEvent.target.className.baseVal")
        if (targetClass.includes("collapseIcon") && nodeDataId) {
          this.props.actions.collapseGroup(nodeDataId)
        }

        if (targetClass.includes("expandIcon") && nodeDataId) {
          this.props.actions.expandGroup(nodeDataId)
        }
      })
    }

    this.processGraphPaper.on("blank:pointerdown", (evt) => {
      if (this.props.fetchedProcessDetails != null) {
        this.props.actions.displayNodeDetails(this.props.fetchedProcessDetails.json.properties)
        this.props.actions.resetSelection()
      }
    })
  }

  hooverHandling() {
    this.processGraphPaper.on("cell:mouseover", (cellView) => {
      const model = cellView.model
      this.showLabelOnHover(model)
      this.showBackgroundIcon(model)
    })
    this.processGraphPaper.on("blank:mouseover", () => {
      this.hideBackgroundsIcons()
    })
  }

  findNodeById(nodeId) {
    const nodes = NodeUtils.nodesFromProcess(this.props.processToDisplay, this.props.expandedGroups)
    return nodes.find(n => n.id === nodeId)
  }

  //needed for proper switch/filter label handling
  showLabelOnHover(model) {
    if (model.get && !isBackgroundObject(model)) {
      model.toFront()
    }
    return model
  }

  //background is below normal node, we cannot use normal hover/mouseover/mouseout...
  showBackgroundIcon(model) {
    if (isBackgroundObject(model)) {
      const el = model.findView(this.processGraphPaper).vel
      el.toggleClass("forced-hover", true)
    }
  }

  hideBackgroundsIcons() {
    this.graph.getElements().filter(isBackgroundObject).forEach(model => {
      const el = model.findView(this.processGraphPaper).vel
      el.toggleClass("forced-hover", false)
    })
  }

  cursorBehaviour() {
    this.processGraphPaper.on("blank:pointerdown", (evt, x, y) => {
      if (this.getEspGraphRef()) {
        this.getEspGraphRef().style.cursor = "move"
      }
    })

    this.processGraphPaper.on("blank:pointerup", (evt, x, y) => {
      if (this.getEspGraphRef()) {
        this.getEspGraphRef().style.cursor = "auto"
      }
    })
  }

  moveSelectedNodesRelatively(element, position) {
    const movedNodeId = element.id
    const nodeIdsToBeMoved = _.without(this.props.selectionState, movedNodeId)
    const cellsToBeMoved = nodeIdsToBeMoved.map(nodeId => this.graph.getCell(nodeId))
    const originalPosition = _.find(this.props.layout, n => n.id === movedNodeId).position
    const offset = {x: position.x - originalPosition.x, y: position.y - originalPosition.y}
    cellsToBeMoved.forEach(cell => {
      const originalPosition = _.find(this.props.layout, n => n.id === cell.id).position
      cell.position(originalPosition.x + offset.x, originalPosition.y + offset.y)
    })
  }

  nodesMoving() {
    this.graph.on("change:position", (element, position) => {
      if (!this.redrawing && (this.props.selectionState || []).includes(element.id)) {
        this.moveSelectedNodesRelatively(element, position)
      }
    })
  }

  render() {
    const toRender = (
      <div id="graphContainer" style={{padding: this.props.padding}}>
        {this.props.showNodeDetailsModal ? <NodeDetailsModal/> : null}
        {!_.isEmpty(this.props.edgeToDisplay) ? <EdgeDetailsModal/> : null}
        <div ref={this.espGraphRef} id={this.props.divId}></div>
      </div>
    )

    return this.props.connectDropTarget ? this.props.connectDropTarget(toRender) : toRender
  }
}

export function commonState(state) {
  return {
    layout: [],
    processCategory: getProcessCategory(state),
    loggedUser: getLoggedUser(state),
    processDefinitionData: getProcessDefinitionData(state),
    selectionState: getSelectionState(state),
  }
}

export const subprocessParent = "modal-content"
