import {css, cx} from "emotion"
import {isEmpty} from "lodash"
import React, {PropsWithChildren} from "react"
import {useTranslation} from "react-i18next"
import processesTableStyles from "../../containers/processesTable.styl"
import {useNkTheme} from "../../containers/theme"
import processesStyles from "../../stylesheets/processes.styl"
import SvgDiv from "../SvgDiv"
import {InputWithIcon} from "../themed/InputWithIcon"
import {ValueFieldProps} from "../valueField"
import searchIconStyles from "./searchIcon.styl"

function AddonIcon(props: {className?: string, svg: string}) {
  return <SvgDiv className={cx(searchIconStyles.icon, props.className)} svgFile={props.svg}/>
}

export function SearchIcon(props: {isEmpty: boolean}) {
  const {theme} = useNkTheme()
  const styles = css({
    ".icon-fill": {
      fill: props.isEmpty ? theme.colors.secondaryColor : theme.colors.accent,
    },
  })
  return <AddonIcon svg="search.svg" className={styles}/>
}

function TableFilter(props: PropsWithChildren<{className?: string}>) {
  return (
    <div className={cx(processesStyles.tableFilter, props.className)}>
      {props.children}
    </div>
  )
}

function SearchFilter(props: ValueFieldProps<string>) {
  const {t} = useTranslation()
  return (
    <TableFilter className={processesTableStyles.filterInput}>
      <InputWithIcon {...props} placeholder={t("filterInput.placeholder", "Filter by text...")}>
        <SearchIcon isEmpty={isEmpty(props.value)}/>
      </InputWithIcon>
    </TableFilter>
  )
}

export default SearchFilter
