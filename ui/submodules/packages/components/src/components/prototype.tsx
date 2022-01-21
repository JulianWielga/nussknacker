import Grid from "@mui/material/Grid";
import React, { useCallback, useMemo } from "react";
import { Columns, TableViewData, TableWrapper } from "./tableWrapper";
import { FilterRules } from "./filters/filterRules";
import { useScenariosQuery } from "./useComponentsQuery";
import { FiltersContextProvider, useFilterContext } from "./filters/filtersContext";
import InputBase from "@mui/material/InputBase";
import { ProcessType } from "nussknackerUi/components/Process/types";
import { Divider, Stack, Typography, useTheme } from "@mui/material";
import { DateTime } from "luxon";
import { CategoryChip } from "./cellRenderers/categoriesCell";

export function Prototype() {
    const { data = [], isLoading } = useScenariosQuery();

    return (
        <>
            <FiltersContextProvider>
                {/*<Grid container direction="row" justifyContent="space-between" alignItems="flex-end">*/}
                {/*    <Grid item>*/}
                {/*        <h1>test</h1>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={12} sm={3}>*/}
                {/*        <h2>test2</h2>*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}
                <TableView data={data} isLoading={isLoading} />
            </FiltersContextProvider>
        </>
    );
}

type RowType = ProcessType;

function Author({ value }: { value: string }): JSX.Element {
    const { setFilter, getFilter } = useFilterContext();
    const filterValue = useMemo(() => getFilter("CREATED_BY", true), [getFilter]);
    const isSelected = useMemo(() => filterValue.includes(value), [filterValue, value]);

    const onClick = useCallback(() => {
        setFilter("CREATED_BY", isSelected ? filterValue.filter((value) => value !== value) : [...filterValue, value]);
    }, [filterValue, isSelected, value, setFilter]);

    return (
        <Typography
            component="a"
            href="#"
            variant="body2"
            sx={{ color: isSelected ? "primary.main" : "inherit" }}
            tabIndex={0}
            onClick={onClick}
        >
            {value}
        </Typography>
    );
}

function TableView(props: TableViewData<RowType>): JSX.Element {
    const { data = [], isLoading } = props;
    const theme = useTheme();

    const columns = useMemo(
        (): Columns<RowType> => [
            {
                field: "modificationDate",
                hide: true,
            },
            {
                field: "id",
                hideable: false,
                flex: 1,
                cellClassName: "noPadding stretch",
                renderCell: (props) => (
                    <Stack spacing={0} p={2} justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center"
                               divider={<Divider orientation="vertical" flexItem />}>
                            <Typography component="span" variant="subtitle2">
                                {props.row.id}
                            </Typography>
                            <CategoryChip value={props.row.processCategory} />
                        </Stack>
                        <Typography component="span" variant="body2" sx={{ color: theme.palette.text.disabled }}>
                            {DateTime.fromISO(props.row.modificationDate).toRelative()} by <Author
                            value={props.row.createdBy} />
                        </Typography>
                    </Stack>
                ),
            },
        ],
        [theme],
    );

    const filterRules = useMemo<FilterRules<RowType>>(
        () => ({
            TEXT: (row, filter) =>
                !filter?.toString().length ||
                columns
                    .map(({ field }) => row[field]?.toString().toLowerCase())
                    .filter(Boolean)
                    .some((value) => value.includes(filter.toString().toLowerCase())),
            SHOW_ARCHIVED: (row, filter) => filter || !row.isArchived,
            CATEGORY: (row, value) => !value?.length || [].concat(value).some((f) => row["processCategory"]?.includes(f)),
            CREATED_BY: (row, value) => !value?.length || [].concat(value).some((f) => row["createdBy"]?.includes(f)),
        }),
        [columns],
    );

    return (
        <TableWrapper<RowType>
            columns={columns}
            data={data}
            isLoading={isLoading}
            filterRules={filterRules}
            disableZebra
            headerHeight={0}
            rowHeight={80}
            sortModel={[{ field: "modificationDate", sort: "desc" }]}
            components={{
                Toolbar: CustomToolbar,
            }}
        />
    );
}

function CustomToolbar() {
    return (
        <>
            <InputBase sx={{ width: "100%", p: 1 }} />
        </>
    );
}
