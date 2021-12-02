import React, { KeyboardEventHandler, useCallback } from "react";
import { GridEvents, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Link, LinkProps } from "@mui/material";

const isArrowKey = (key: string): boolean => ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key);

export function useCellArrowKeys(props: GridRenderCellParams): KeyboardEventHandler {
    const { api, field, id } = props;
    return useCallback<KeyboardEventHandler>(
        (event) => {
            if (isArrowKey(event.key)) {
                // Get the most recent params because the cell mode may have changed by another listener
                const cellParams = api.getCellParams(id, field);
                api.publishEvent(GridEvents.cellNavigationKeyDown, cellParams, event);
            }
        },
        [api, field, id],
    );
}

export function CellLink<C extends React.ElementType>(
    props: { cellProps: GridRenderCellParams; disabled?: boolean } & LinkProps<C, { component?: C }>,
): JSX.Element {
    const { cellProps, disabled, children, sx, ...passProps } = props;
    const handleCellKeyDown = useCellArrowKeys(cellProps);

    const box = (
        <Box
            sx={{
                padding: "0 10px",
            }}
        >
            {children}
        </Box>
    );

    return disabled ? (
        box
    ) : (
        <Link
            color="inherit"
            sx={{
                flex: 1,
                textAlign: "inherit",
                ":focus": {
                    outline: "unset",
                },
                ...sx,
            }}
            tabIndex={0}
            onKeyDown={handleCellKeyDown}
            {...passProps}
        >
            {box}
        </Link>
    );
}
