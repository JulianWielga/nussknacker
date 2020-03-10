import React, {memo} from "react"
import {useTranslation} from "react-i18next"
import {CollapsibleToolbar} from "../../toolbars/CollapsibleToolbar"
import BussinesViewSwitch from "./buttons/BussinesViewSwitch"
import {ToolbarButtons} from "../../toolbars/ToolbarButtons"
import {ResetViewButton} from "./buttons/ResetViewButton"
import {ZoomInButton} from "./buttons/ZoomInButton"
import {ZoomOutButton} from "./buttons/ZoomOutButton"

function ViewPanel() {
  const {t} = useTranslation()
  return (
    <CollapsibleToolbar id="VIEW-PANEL" title={t("panels.view.title", "view")}>
      <ToolbarButtons>
        <BussinesViewSwitch/>
        <ResetViewButton/>
        <ZoomInButton/>
        <ZoomOutButton/>
      </ToolbarButtons>
    </CollapsibleToolbar>
  )
}

export default memo(ViewPanel)

