import Highlighter from "react-highlight-words";
import React, { PropsWithChildren } from "react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { CellLink } from "./cellLink";
import { OpenInNew } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { scenarioHref } from "./categoriesCell";

export function NameCell(props: GridRenderCellParams & { filterValue: string[] }): JSX.Element {
    const { value, row, filterValue } = props;
    const children = (
        <>
            <img title={row.componentType} style={{ height: "1.5em", marginRight: ".25em", verticalAlign: "middle" }} src={row.icon} />
            <Highlighter textToHighlight={value.toString()} searchWords={filterValue} highlightTag={Highlight} />
        </>
    );
    const isFragment = row.componentGroupName === "fragments";
    return (
        <CellLink underline="hover" disabled={!isFragment} color="inherit" cellProps={props} href={scenarioHref(value)}>
            {isFragment ? (
                <>
                    {children}
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
                </>
            ) : (
                children
            )}
        </CellLink>
    );
}

function Highlight({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
        <Box component="span" sx={{ color: "primary.main" }}>
            {children}
        </Box>
    );
}
