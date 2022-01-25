import { CategoryChip } from "../cellRenderers/categoriesCell";
import { DateTime } from "luxon";
import { Author } from "./author";
import React from "react";
import { Divider, Stack, Typography, useTheme } from "@mui/material";
import { RowType } from "./prototype";

export function FirstLine({ row }: { row: RowType }): JSX.Element {
    return (
        <Stack direction="row" spacing={1} alignItems="center" divider={<Divider orientation="vertical" flexItem />}>
            <span>{row.id}</span>
            <CategoryChip value={row.processCategory} />
        </Stack>
    );
}

export function SecondLine({ row }: { row: RowType }): JSX.Element {
    return (
        <span>
            {DateTime.fromISO(row.modificationDate).toRelative()} by <Author value={row.createdBy} />
        </span>
    );
}

export function Item({ row }: { row: RowType }): JSX.Element {
    return (
        <Stack spacing={0} p={2} justifyContent="space-between">
            <FirstLine row={row} />
            <SecondLine row={row} />
        </Stack>
    );
}
