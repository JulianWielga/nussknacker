import React, { useMemo } from "react";
import { Columns, TableViewData, TableWrapper } from "../tableWrapper";
import { FilterRules } from "../filters/filterRules";
import { useScenariosQuery } from "../useComponentsQuery";
import { FiltersContextProvider } from "../filters/filtersContext";
import InputBase from "@mui/material/InputBase";
import { ProcessType } from "nussknackerUi/components/Process/types";
import { Item } from "./item";
import { ItemsList } from "./itemsList";

export function Prototype() {
    const { data = [], isLoading } = useScenariosQuery();

    return (
        <FiltersContextProvider>
            <TableView data={data} isLoading={isLoading} />
        </FiltersContextProvider>
    );
}

export type RowType = ProcessType;

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
            CATEGORY: (row, value) => !value?.length || [].concat(value).some((f) => row["processCategory"]?.includes(f)),
            CREATED_BY: (row, value) => !value?.length || [].concat(value).some((f) => row["createdBy"]?.includes(f)),
        }),
        [],
    );

    return (
        <>
            <ItemsList data={data} filterRules={filterRules} isLoading={isLoading} />
        </>
    );
}
