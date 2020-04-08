import _ from "lodash"

import * as GraphUtils from "../components/graph/GraphUtils"
import NodeUtils from "../components/graph/NodeUtils"
import * as LayoutUtils from "./layoutUtils"
import * as GroupsUtils from "./groupsUtils"
import {reducer as groupsReducer} from "./groups"
import reduceReducers from "reduce-reducers"
import {createUniqueNodeId} from "../components/graph/NodeIdUtils"

//TODO: We should change namespace from graphReducer to currentlyDisplayedProcess

const emptyGraphState = {
  graphLoading: false,
  processToDisplay: {},
  fetchedProcessDetails: {},
  nodeToDisplay: {},
  edgeToDisplay: {},
  layout: [],
  testCapabilities: {},
  groupingState: null,
  selectionState: [],
  processCounts: {},
  testResults: null,
  businessView: false,
  processState: null,
  processStateLoaded: false,
  groups: [],
}

const STATE_PROPERTY_NAME = "groupingState"

export const reducer = reduceReducers(
  emptyGraphState,
  graphReducer,
  groupsReducer,
)

export function graphReducer(state, action) {
  switch (action.type) {
    case "PROCESS_LOADING": {
      return {
        ...state,
        graphLoading: true,
      }
    }
    case "PROCESS_STATE_LOADED": {
      return {
        ...state,
        processState: action.processState,
        processStateLoaded: true,
      }
    }
    case "UPDATE_IMPORTED_PROCESS": {
      const oldNodeIds = _.sortBy(state.processToDisplay.nodes.map((n) => n.id))
      const newNodeids = _.sortBy(action.processJson.nodes.map((n) => n.id))
      const newLayout = _.isEqual(oldNodeIds, newNodeids) ? state.layout : null

      return {
        ...state,
        graphLoading: false,
        processToDisplay: action.processJson,
        layout: newLayout,
      }
    }
    case "UPDATE_TEST_CAPABILITIES": {
      return {
        ...state,
        testCapabilities: action.capabilities,
      }
    }
    case "DISPLAY_PROCESS": {
      const json = action.fetchedProcessDetails.json
      const nodeToDisplay = json.properties
      return {
        ...state,
        processToDisplay: json,
        fetchedProcessDetails: action.fetchedProcessDetails,
        graphLoading: false,
        nodeToDisplay: nodeToDisplay,
        layout: LayoutUtils.fromString(nodeToDisplay.additionalFields?.properties?.layout),
        groups: GroupsUtils.fromString(nodeToDisplay.additionalFields?.properties?.expandedGroups),
      }
    }
    case "LOADING_FAILED": {
      return {
        ...state,
        graphLoading: false,
      }
    }
    case "CLEAR_PROCESS": {
      return {
        ...state,
        processToDisplay: {},
        fetchedProcessDetails: {},
        testResults: null,
      }
    }
    case "DISPLAY_MODAL_NODE_DETAILS":
    case "DISPLAY_NODE_DETAILS":
      if (state.groupingState) {
        const newNodeId = action.nodeToDisplay.id
        return {
          ...state,
          groupingState: canGroup(state, action.nodeToDisplay) ?
            _.concat(state.groupingState, newNodeId) : state.groupingState,
        }
      } else {
        return {
          ...state,
          nodeToDisplay: action.nodeToDisplay,
          nodeToDisplayReadonly: action.nodeToDisplayReadonly,
        }
      }

    case "DISPLAY_MODAL_EDGE_DETAILS": {
      return {
        ...state,
        edgeToDisplay: action.edgeToDisplay,
      }
    }

    case "EDIT_EDGE": {
      const processToDisplay = GraphUtils.mapProcessWithNewEdge(
        state.processToDisplay,
        action.before,
        action.after,
      )
      return {
        ...state,
        processToDisplay: {
          ...processToDisplay,
          validationResult: action.validationResult,
        },
        edgeToDisplay: action.after,
      }
    }
    case "EDIT_NODE": {
      const stateAfterNodeRename = {
        ...state,
        ...updateAfterNodeIdChange(state.layout, action.processAfterChange, action.before.id, action.after.id),
      }
      return {
        ...stateAfterNodeRename,
        processToDisplay: {
          ...stateAfterNodeRename.processToDisplay,
          validationResult: action.validationResult,
        },
        nodeToDisplay: action.after,
      }
    }
    case "DELETE_NODES": {
      const stateAfterDelete = _.reduce(action.ids, (state, idToDelete) => {
        const stateAfterNodeDelete = updateAfterNodeDelete(state, idToDelete)
        const newSubprocessVersions = removeSubprocessVersionForLastSubprocess(stateAfterNodeDelete.processToDisplay, idToDelete)
        const processToDisplay = GraphUtils.deleteNode(stateAfterNodeDelete.processToDisplay, idToDelete)
        return {
          ...stateAfterNodeDelete,
          processToDisplay: {
            ...processToDisplay,
            properties: {
              ...processToDisplay.properties,
              subprocessVersions: newSubprocessVersions,
            },
          },
        }
      }, state)
      return {
        ...stateAfterDelete,
        nodeToDisplay: stateAfterDelete.processToDisplay.properties,
      }
    }
    case "URL_CHANGED": {
      return {
        ...state,
        ...emptyGraphState,
      }
    }
    case "NODES_CONNECTED": {
      const edge = createEdge(action.fromNode, action.toNode, action.edgeType, state.processToDisplay.edges, action.processDefinitionData)
      return {
        ...state,
        processToDisplay: {
          ...state.processToDisplay,
          edges: _.concat(state.processToDisplay.edges, edge),
        },
      }
    }
    case "NODES_DISCONNECTED": {
      return {
        ...state,
        processToDisplay: {
          ...state.processToDisplay,
          edges: _.reject(state.processToDisplay.edges, (e) => e.from === action.from && e.to === action.to),
        },
      }
    }
    case "NODE_ADDED": {
      return addNodes(
        state,
        prepareNewNodesWithLayout(state, [{
          node: action.node,
          position: action.position,
        }], false),
      )
    }
    case "NODES_WITH_EDGES_ADDED": {
      const {nodes, layout, uniqueIds} = prepareNewNodesWithLayout(state, action.nodesWithPositions, true)

      const idToUniqueId = _.zipObject(action.nodesWithPositions.map(n => n.node.id), uniqueIds)
      const edgesWithValidIds = action.edges.map(edge => ({...edge, from: idToUniqueId[edge.from], to: idToUniqueId[edge.to]}))
      const updatedEdges = _.reduce(edgesWithValidIds, (edges, edge) => {
        const fromNode = nodes.find(n => n.id === edge.from)
        const toNode = nodes.find(n => n.id === edge.to)
        const newEdge = createEdge(fromNode, toNode, edge.edgeType, edges, action.processDefinitionData)
        return edges.concat(newEdge)
      }, state.processToDisplay.edges)

      const stateWithNodesAdded = addNodes(state, {nodes, layout})
      return {
        ...stateWithNodesAdded,
        processToDisplay: {
          ...stateWithNodesAdded.processToDisplay,
          edges: updatedEdges,
        },
      }
    }
    case "VALIDATION_RESULT": {
      return {
        ...state,
        processToDisplay: {
          ...state.processToDisplay,
          validationResult: action.validationResult,
        },
      }
    }
    case "APPEND_METADATA": {
      return {
        ...state,
        processToDisplay: GroupsUtils.appendToProcess(LayoutUtils.appendToProcess(state.processToDisplay, state.layout), state.groups),
      }
    }
    //TODO: handle it differently?
    case "LAYOUT_CHANGED": {
      return {
        ...state,
        layout: action.layout,
      }
    }
    case "DISPLAY_PROCESS_COUNTS": {
      return {
        ...state,
        processCounts: action.processCounts,
      }
    }
    case "DISPLAY_TEST_RESULTS_DETAILS": {
      return {
        ...state,
        testResults: action.testResults,
        graphLoading: false,
      }
    }
    case "HIDE_RUN_PROCESS_DETAILS": {
      return {
        ...state,
        testResults: null,
        processCounts: null,
      }
    }
    case "START_GROUPING": {
      return {
        ...state,
        groupingState: [],
        nodeToDisplay: state.processToDisplay.properties,
      }
    }
    case "FINISH_GROUPING": {
      const withUpdatedGroups = state.groupingState.length > 1 ?
        {
          ...state,
          processToDisplay: NodeUtils.createGroup(state.processToDisplay, state.groupingState),
          layout: [],
        } : state
      return _.omit(withUpdatedGroups, STATE_PROPERTY_NAME)
    }
    case "CANCEL_GROUPING": {
      return _.omit(state, STATE_PROPERTY_NAME)
    }
    case "UNGROUP": {
      return {
        ...state,
        processToDisplay: NodeUtils.ungroup(state.processToDisplay, action.groupToRemove),
        layout: [],
        nodeToDisplay: state.processToDisplay.properties,
      }
    }
    case "EXPAND_GROUP":
    case "COLLAPSE_ALL_GROUPS":
    case "COLLAPSE_GROUP": {
      return {
        ...state,
        layout: [],
      }
    }
    case "EDIT_GROUP": {
      return {
        ...state,
        processToDisplay: {
          ...NodeUtils.editGroup(state.processToDisplay, action.oldGroupId, action.newGroup),
          validationResult: action.validationResult,
        },
        nodeToDisplay: action.newGroup,
        layout: updateLayoutAfterNodeIdChange(state.layout, action.oldGroupId, action.newGroup.id),
      }
    }
    case "EXPAND_SELECTION": {
      return {
        ...state,
        selectionState: _.uniq(_.concat(state.selectionState, action.nodeId)),
      }
    }
    case "RESET_SELECTION": {
      const selectionState = action.nodeId ? [action.nodeId] : []
      return {
        ...state,
        selectionState,
      }
    }
    case "BUSINESS_VIEW_CHANGED": {
      return {
        ...state,
        businessView: action.businessView,
      }
    }
    default:
      return state
  }
}

function canGroup(state, newNode) {
  const newNodeId = newNode.id
  const currentGrouping = state.groupingState
  return !NodeUtils.nodeIsGroup(newNode) && currentGrouping.length == 0 ||
    currentGrouping.find(nodeId => state.processToDisplay.edges.find(edge => edge.from == nodeId && edge.to == newNodeId || edge.to == nodeId && edge.from == newNodeId))
}

function updateAfterNodeIdChange(layout, process, oldId, newId) {
  const newLayout = updateLayoutAfterNodeIdChange(layout, oldId, newId)
  const withGroupsUpdated = NodeUtils.updateGroupsAfterNodeIdChange(process, oldId, newId)
  return {
    processToDisplay: withGroupsUpdated,
    layout: newLayout,
  }
}

function updateLayoutAfterNodeIdChange(layout, oldId, newId) {
  return _.map(layout, (n) => {
    if (oldId === n.id) {
      return {
        ...n,
        id: newId,
      }
    } else return n
  })
}

function updateAfterNodeDelete(state, idToDelete) {
  const layoutWithoutNode = _.filter(state.layout, (n) => n.id !== idToDelete)
  const withGroupsUpdated = NodeUtils.updateGroupsAfterNodeDelete(state.processToDisplay, idToDelete)
  return {
    ...state,
    processToDisplay: withGroupsUpdated,
    layout: layoutWithoutNode,
  }
}

function removeSubprocessVersionForLastSubprocess(processToDisplay, idToDelete) {
  const subprocessVersions = processToDisplay.properties.subprocessVersions
  const nodeToDelete = processToDisplay.nodes.find((n) => n.id === idToDelete)
  if (nodeToDelete.type === "SubprocessInput") {
    const subprocessId = nodeToDelete.ref.id
    const allSubprocessNodes = processToDisplay.nodes.filter((n) => _.get(n, "ref.id") === subprocessId)
    const isLastOne = allSubprocessNodes.length === 1
    return isLastOne ? _.omit(subprocessVersions, subprocessId) : subprocessVersions
  } else {
    return subprocessVersions
  }
}

function prepareNewNodesWithLayout(state, nodesWithPositions, isCopy) {
  const alreadyUsedIds = state.processToDisplay.nodes.map(node => node.id)
  const initialIds = nodesWithPositions.map(nodeWithPosition => nodeWithPosition.node.id)
  const uniqueIds = _.reduce(initialIds, (uniqueIds, initialId) => {
    const reservedIds = alreadyUsedIds.concat(uniqueIds)
    const uniqueId = createUniqueNodeId(initialId, reservedIds, isCopy)
    return uniqueIds.concat(uniqueId)
  }, [])

  const updatedNodes = _.zipWith(nodesWithPositions, uniqueIds, (nodeWithPosition, uniqueId) => {
    return {...nodeWithPosition.node, id: uniqueId}
  })
  const updatedLayout = _.zipWith(nodesWithPositions, uniqueIds, (nodeWithPosition, uniqueId) => {
    return {id: uniqueId, position: nodeWithPosition.position}
  })

  return {
    nodes: state.processToDisplay.nodes.concat(updatedNodes),
    layout: state.layout.concat(updatedLayout),
    uniqueIds,
  }
}

function addNodes(state, {nodes, layout}) {
  return {
    ...state,
    processToDisplay: {
      ...state.processToDisplay,
      nodes: nodes,
    },
    layout: layout,
  }
}

function createEdge(fromNode, toNode, edgeType, allEdges, processDefinitionData) {
  const baseEdge = {from: fromNode.id, to: toNode.id}
  const adjustedEdgeType = edgeType || NodeUtils.edgeType(allEdges, fromNode, processDefinitionData)
  return adjustedEdgeType ? {...baseEdge, edgeType: adjustedEdgeType} : baseEdge
}
