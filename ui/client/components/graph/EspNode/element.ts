/* eslint-disable i18next/no-literal-string */
import _, {isEmpty} from "lodash"
import expandIcon from "../../../assets/img/expand.svg"
import customAttrs from "../../../assets/json/nodeAttributes.json"
import {NodeId, NodeType} from "../../../types"
import NodeUtils from "../NodeUtils"
import {EspNodeShape} from "./esp"
import {maxLineCount, maxLineLength, rectHeight, rectWidth, summaryCountConfig} from "./misc"
import {getIconHref} from "../getIconHref"

function getBodyContent(nodeId: NodeId = ""): { text: string, multiline?: boolean } {
  if (nodeId.length <= maxLineLength) {
    return {
      text: nodeId,
    }
  }

  const splitContent = nodeId.split(" ")

  if (splitContent[0].length > maxLineLength) {
    return {
      text: `${nodeId.slice(0, maxLineLength)}...`,
    }
  }

  const tmpLines = [splitContent[0]]

  for (const str of splitContent.slice(1)) {
    const idx = tmpLines.length - 1

    if (tmpLines[idx].length + str.length <= maxLineLength) {
      tmpLines[idx] += ` ${str}`
      continue
    }

    if (tmpLines.length >= maxLineCount) {
      tmpLines[idx] += "..."
      break
    }

    if (str.length > maxLineLength) {
      tmpLines[idx + 1] = `${str.slice(0, maxLineLength)}...`
      break
    }

    tmpLines[idx + 1] = str
  }

  const idx = tmpLines.length - 1
  if (tmpLines[idx].length > maxLineLength) {
    tmpLines[idx] = `${tmpLines[idx].slice(0, maxLineLength)}...`
  }

  return {
    text: tmpLines.join("\n"),
    multiline: tmpLines.length > 1,
  }
}

function getTestResultsSummaryAttr(processCounts, width, testResultsWidth) {
  const {breakPoint, maxExtraDigits} = summaryCountConfig

  const hasCounts = !_.isEmpty(processCounts)
  const hasErrors = hasCounts && processCounts && processCounts.errors > 0
  const countsContent = hasCounts ? processCounts ? `${processCounts.all}` : "0" : ""
  let extraDigitsCount = Math.max(countsContent.length - breakPoint, 0)
  extraDigitsCount = Math.min(extraDigitsCount, maxExtraDigits)

  return {
    text: countsContent,
    fill: hasErrors ? "red" : "#CCCCCC",
    refX: width - testResultsWidth / 2,
    // magic/hack: central vertical position when font-size changes
    y: 78 - extraDigitsCount * 1.5,
    height: 16,
  }
}

export function makeElement(processCounts, nodesSettings) {
  const width = rectWidth*2
  const height = rectHeight*2
  const testResultsHeight = 24
  const pxPerChar = 8
  const countsPadding = 8
  const hasCounts = !isEmpty(processCounts)
  //dynamically sized width
  const testResultsWidth = _.toArray(_.toString(processCounts ? processCounts.all : "")).length * pxPerChar + 2 * countsPadding

  return (node: NodeType) => {
    const description = node.additionalFields?.description || null
    const {text: bodyContent} = getBodyContent(node.id)
    const iconHref = getIconHref(node, nodesSettings)
    const attrs = {
      background: {
        opacity: node.isDisabled ? 0.4 : 1,
      },
      border: {
        stroke: "#B5B5B5",
      },
      title: {
        text: description,
      },
      iconBackground: {
        fill: customAttrs[node.type].styles.fill,
        opacity: node.isDisabled ? 0.4 : 1,
      },
      icon: {
        xlinkHref: iconHref,
      },
      content: {
        text: bodyContent,
        opacity: node.isDisabled ? 0.65 : 1,
      },

      // ".testResultsPlaceHolder": {
      //   noExport: "",
      //   display: hasCounts ? "block" : "none",
      //   width: testResultsWidth,
      //   refX: width - testResultsWidth,
      //   refY: height,
      //   height: testResultsHeight,
      // },
      // ".testResultsSummary": {
      //   noExport: "",
      //   ...getTestResultsSummaryAttr(processCounts, width, testResultsWidth),
      // },
    }

    return new EspNodeShape({
      id: node.id,
      inPorts: NodeUtils.hasInputs(node) ? ["In"] : [],
      outPorts: NodeUtils.hasOutputs(node) ? ["Out"] : [],
      isGroup: NodeUtils.nodeIsGroup(node),
      attrs,
      rankDir: "R",
      nodeData: node,
      definitionToCompare: {
        node: node,
        processCounts: processCounts,
      },
    })
  }
}
