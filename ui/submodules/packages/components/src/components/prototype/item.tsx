import { CategoryChip } from "../cellRenderers/categoriesCell";
import { Author } from "./author";
import React from "react";
import { Divider, Stack, Typography } from "@mui/material";
import { RowType } from "./prototype";
import { useTranslation } from "react-i18next";
import { IconImg } from "../cellRenderers/iconImg";

export function FirstLine({ row }: { row: RowType }): JSX.Element {
    return (
        <Stack direction="row" spacing={1} alignItems="center" divider={<Divider orientation="vertical" flexItem />}>
            <span>{row.id}</span>
            <CategoryChip value={row.processCategory} />
            {row.state && (
                <IconImg
                    src={row.state.icon}
                    title={row.state.tooltip}
                    style={{
                        height: "1.2em",
                        verticalAlign: "middle",
                    }}
                />
            )}
            {row.lastAction && <Typography variant="caption">{row.lastAction.action}</Typography>}
        </Stack>
    );
}

export function SecondLine({ row }: { row: RowType }): JSX.Element {
    const { t } = useTranslation();
    return (
        <span>
            {t("scenario.createdAt", "{{date, relativeDate}}", { date: new Date(row.createdAt) })} by <Author value={row.createdBy} />
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
