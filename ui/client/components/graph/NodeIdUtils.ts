import {NodeId} from "../../types"

function generateUniqueNodeId(initialId: NodeId, usedIds: NodeId[], nodeCounter: number, isCopy: boolean): NodeId {
  const newId = isCopy ? `${initialId} (copy ${nodeCounter})` : `${initialId} ${nodeCounter}`
  return usedIds.includes(newId) ? generateUniqueNodeId(initialId, usedIds, nodeCounter + 1, isCopy) : newId
}

export function createUniqueNodeId(initialId: NodeId, usedIds: NodeId[], isCopy: boolean): NodeId {
  const isUnique = initialId && !usedIds.includes(initialId)
  return isUnique ? initialId : generateUniqueNodeId(initialId, usedIds, 1, isCopy)
}
