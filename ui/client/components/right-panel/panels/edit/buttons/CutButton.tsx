/* eslint-disable i18next/no-literal-string */
import React from "react"
import {connect} from "react-redux"
import {events} from "../../../../../analytics/TrackingEvents"
import {cutSelection} from "../../../../../actions/nk/selection"
import {ButtonWithIcon} from "../../../ButtonWithIcon"
import {useTranslation} from "react-i18next"
import {PassedProps} from "../../../UserRightPanel"

type OwnPropsPick = Pick<PassedProps,
  | "selectionActions">

type OwnProps = OwnPropsPick
type Props = OwnProps & StateProps

function CutButton(props: Props) {
  const {selectionActions, cutSelection} = props
  const {cut, canCut} = selectionActions
  const {t} = useTranslation()

  return (
    <ButtonWithIcon
      name={t("panels.actions.edit-cut.button", "cut")}
      icon={"cut.svg"}
      disabled={!canCut}
      onClick={event => cutSelection(
        () => cut(event),
        {category: events.categories.rightPanel, action: events.actions.buttonClick},
      )}
    />
  )
}

const mapDispatch = {
  cutSelection,
}

type StateProps = typeof mapDispatch

export default connect(null, mapDispatch)(CutButton)