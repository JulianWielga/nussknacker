import React, { useMemo, useState } from "react";
import { TableViewData } from "../tableWrapper";
import { FilterRules } from "../filters/filterRules";
import { useScenariosQuery } from "../useComponentsQuery";
import { FiltersContextProvider } from "../filters/filtersContext";
import { ProcessType } from "nussknackerUi/components/Process/types";
import { ItemsList } from "./itemsList";
import { Filters2, QFilter } from "../usages/filters";
import { Box, Button, Paper, Stack, styled } from "@mui/material";
import { flatten, uniq } from "lodash";

import Chance from "chance";

const chance = new Chance();
const names = Array(50)
    .fill("")
    .map(() => chance.name());

export function Prototype() {
    const { data = [], isLoading } = useScenariosQuery();

    // const a = useMemo(
    //     () =>
    //         Array(10)
    //             .fill(null)
    //             .flatMap(() =>
    //                 data.map((e) => ({
    //                     ...e,
    //                     id: chance.sentence({ words: chance.integer({ min: 1, max: 8 }) }),
    //                     createdBy: names[chance.integer({ min: 0, max: 15 })],
    //                 })),
    //             ),
    //     [data],
    // );

    return (
        <FiltersContextProvider>
            <TableView data={data} isLoading={isLoading} />
        </FiltersContextProvider>
    );
}

export type RowType = ProcessType;
const drawerWidth = 240;

const Main = styled("div", { shouldForwardProp: (prop) => prop !== "open" })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flex: 1,
    width: 0,
    overflow: "hidden",
    transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: theme.spacing(2),
    }),
}));
const Main2 = styled(QFilter, { shouldForwardProp: (prop) => prop !== "open" })<{
    open?: boolean;
}>(({ theme, open }) => ({
    transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: 0,
    ...(open && {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: `calc(${drawerWidth}px + ${theme.spacing(2)})`,
    }),
}));

const Draw = styled(Paper, { shouldForwardProp: (prop) => prop !== "open" })<{
    open?: boolean;
}>(({ theme, open }) => ({
    width: drawerWidth,
    position: "sticky",
    top: theme.spacing(2),
    zIndex: 1,
    transition: theme.transitions.create(["opacity", "transform"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    opacity: 0,
    transform: `translateX(100%)`,
    transformOrigin: "left",
    pointerEvents: "none",
    ...(open && {
        pointerEvents: "auto",
        transition: theme.transitions.create(["opacity", "transform"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        opacity: 1,
        transform: "translateX(0)",
    }),
}));

function TableView(props: TableViewData<RowType>): JSX.Element {
    const { data = [], isLoading } = props;

    const filterRules = useMemo<FilterRules<RowType>>(
        () => ({
            TEXT: (row, filter) =>
                !filter?.toString().length ||
                ["id"]
                    .map((field) => row[field]?.toString().toLowerCase())
                    .filter(Boolean)
                    .some((value) => value.includes(filter.toString().toLowerCase())),
            SHOW_ARCHIVED: (row, filter) => filter || !row.isArchived,
            HIDE_ACTIVE: (row, filter) => filter ? row.isArchived : true,
            HIDE_FRAGMENTS: (row, filter) => filter ? !row.isSubprocess : true,
            HIDE_SCENARIOS: (row, filter) => filter ? row.isSubprocess : true,
            CATEGORY: (row, value) => !value?.length || [].concat(value).some((f) => row["processCategory"] === f),
            CREATED_BY: (row, value) => !value?.length || [].concat(value).some((f) => row["createdBy"]?.includes(f)),
        }),
        [],
    );

    const filterableKeys = useMemo(() => uniq(flatten(data.map((v) => Object.keys(v)))), [data]);
    const filterableValues = useMemo(
        () => Object.fromEntries(filterableKeys.map((k) => [k, uniq(flatten(data.map((v) => v[k]))).sort()])),
        [data, filterableKeys],
    );

    const archivedCount = data.filter((row) => row.isArchived).length;
    const notArchivedCount = data.filter((row) => !row.isArchived).length;

    const [open, setOpen] = useState(false);

    return (
        <>
            <Stack direction="column" spacing={2} flex={1} justifyContent="flex-start">
                <Main2 open={open}>
                    <Button type="button" variant="outlined" onClick={() => setOpen((s) => !s)}>
                        advanced
                    </Button>
                    {/*<Link component={} href="?SHOW_ARCHIVED=true" >archived</Link>*/}
                </Main2>
                <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "row-reverse" }}>
                    <Draw open={open}>
                        <Filters2 visible={open} values={filterableValues} />
                    </Draw>
                    <Main open={open}>
                        <ItemsList data={data} filterRules={filterRules} isLoading={isLoading} />
                    </Main>
                </Box>
            </Stack>
        </>
    );
}
