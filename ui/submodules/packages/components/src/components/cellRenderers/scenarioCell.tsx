import { OpenInNew } from "@mui/icons-material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { scenarioHref } from "./categoriesCell";
import { CellLink } from "./cellLink";

export function ScenarioCell(props: GridRenderCellParams): JSX.Element {
    return (
        <CellLink underline="hover" disabled={!props.value} cellProps={props} href={scenarioHref(props.row.id)}>
            {props.value}
            <OpenInNew
                sx={{
                    height: ".75em",
                    margin: ".25em",
                    verticalAlign: "middle",
                    opacity: 0.1,
                    "a:hover &": {
                        opacity: 0.5,
                    },
                    "a:focus &": {
                        opacity: 0.5,
                    },
                }}
            />
        </CellLink>
    );
}
