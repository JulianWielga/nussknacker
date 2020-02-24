import React from "react"
import {RootState} from "../../../../../reducers/index"
import {connect} from "react-redux"
import Dialogs from "../../../../modals/Dialogs"
import {toggleModalDialog} from "../../../../../actions/nk/modal"
import {ButtonWithIcon} from "../../../ButtonWithIcon"
import {hasOneVersion} from "../../../selectors/graph"
import {useTranslation} from "react-i18next"

type Props = StateProps

function CompareButton(props: Props) {
  const {
    hasOneVersion,
    toggleModalDialog,
  } = props
  const {t} = useTranslation()

  return (
    <ButtonWithIcon
      name={t("panels.process.actions.compare.button", "compare")}
      icon={"compare.svg"}
      disabled={hasOneVersion}
      onClick={() => toggleModalDialog(Dialogs.types.compareVersions)}
    />
  )
}

const mapState = (state: RootState) => ({
  hasOneVersion: hasOneVersion(state),
})

const mapDispatch = {
  toggleModalDialog,
}

type StateProps = typeof mapDispatch & ReturnType<typeof mapState>

export default connect(mapState, mapDispatch)(CompareButton)
