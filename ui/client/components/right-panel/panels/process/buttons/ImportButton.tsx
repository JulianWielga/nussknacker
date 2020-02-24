import React from "react"
import {RootState} from "../../../../../reducers/index"
import {connect} from "react-redux"
import {events} from "../../../../../analytics/TrackingEvents"
import InlinedSvgs from "../../../../../assets/icons/InlinedSvgs"
import {importFiles} from "../../../../../actions/nk/importExport"
import {reportEvent} from "../../../../../actions/nk/reportEvent"
import {bindActionCreators} from "redux"
import {ButtonWithIcon} from "../../../ButtonWithIcon"
import {getProcessId} from "../../../selectors/graph"
import {useTranslation} from "react-i18next"

type Props = StateProps

function ImportButton(props: Props) {
  const {processId, importFiles, reportEvent} = props
  const {t} = useTranslation()

  return (
    <ButtonWithIcon
      name={t("panels.actions.process-import.button", "import")}
      icon={InlinedSvgs.buttonImport}
      disabled={false}
      onClick={() => reportEvent({
        category: events.categories.rightPanel,
        action: events.actions.buttonClick,
        name: "import",
      })}
      onDrop={(files) => importFiles(files, processId)}
    />
  )
}

const mapState = (state: RootState) => ({
  processId: getProcessId(state),
})

const mapDispatch = (dispatch) => bindActionCreators({
  importFiles,
  reportEvent,
}, dispatch)

type StateProps = ReturnType<typeof mapDispatch> & ReturnType<typeof mapState>

export default connect(mapState, mapDispatch)(ImportButton)