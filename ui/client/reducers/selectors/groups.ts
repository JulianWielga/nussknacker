import {getGraph} from "./graph"
import {createSelector} from "reselect"

export const getExpandedGroups = createSelector(getGraph, g => g.groups)
