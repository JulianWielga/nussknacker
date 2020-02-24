import React from "react"
import {connect} from "react-redux"
import InlinedSvgs from "../../../../../assets/icons/InlinedSvgs"
import {layout} from "../../../../../actions/nk/ui/layout"
import {ButtonWithIcon} from "../../../ButtonWithIcon"
import {useTranslation} from "react-i18next"
import {PassedProps} from "../../../UserRightPanel"

type OwnPropsPick = Pick<PassedProps, "graphLayoutFunction">

type OwnProps = OwnPropsPick
type Props = OwnProps & StateProps

function LayoutButton(props: Props) {
  const {graphLayoutFunction, layout} = props
  const {t} = useTranslation()

  return (
    <ButtonWithIcon
      name={t("panels.actions.edit-layout.button", "layout")}
      icon={InlinedSvgs.buttonLayout}
      onClick={() => layout(graphLayoutFunction)}
    />
  )
}

const mapDispatch = {
  layout,
}

type StateProps = typeof mapDispatch

export default connect(null, mapDispatch)(LayoutButton)