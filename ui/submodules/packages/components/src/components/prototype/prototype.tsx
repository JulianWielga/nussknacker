import React, { PropsWithChildren, useMemo, useState } from "react";
import { TableViewData } from "../tableWrapper";
import { FilterRules, FiltersModel } from "../filters/filterRules";
import { useScenariosQuery, useScenariosWithStatus } from "../useComponentsQuery";
import { FiltersContextProvider, useFilterContext } from "../filters/filtersContext";
import { ProcessType } from "nussknackerUi/components/Process/types";
import { ItemsList } from "./itemsList";
import { Filters2, QFilter } from "../usages/filters";
import {
    Avatar,
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    IconButton,
    Paper,
    Popover,
    Slide,
    Stack,
    styled,
    Typography,
} from "@mui/material";
import { flatten, uniq, uniqBy } from "lodash";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { SelectFilter2, SelectFilter3 } from "../selectFilter";
import { useTranslation } from "react-i18next";
import { Chance } from "chance";
import { ExpandLess, ExpandMore, FilterList, FilterListOff } from "@mui/icons-material";
import { IconImg } from "../cellRenderers/iconImg";

export function Prototype(): JSX.Element {
    const { data = [], isLoading } = useScenariosWithStatus();

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
const Main2 = styled(QFilter)<{
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
            HIDE_ACTIVE: (row, filter) => (filter ? row.isArchived : true),
            HIDE_FRAGMENTS: (row, filter) => (filter ? !row.isSubprocess : true),
            HIDE_SCENARIOS: (row, filter) => (filter ? row.isSubprocess : true),
            CATEGORY: (row, value) => !value?.length || [].concat(value).some((f) => row["processCategory"] === f),
            CREATED_BY: (row, value) => !value?.length || [].concat(value).some((f) => row["createdBy"]?.includes(f)),
            STATUS: (row, value) => !value?.length || [].concat(value).some((f) => row["state"]?.status.name.includes(f)),
        }),
        [],
    );

    const filterableKeys = useMemo(() => ["isArchived", "isSubprocess", "processCategory", "createdBy"], [data]);
    const filterableValues = useMemo(() => {
        const entries = filterableKeys.map((k) => [k, uniq(flatten(data.map((v) => v[k]))).sort()]);
        return Object.fromEntries([
            ...entries,
            [
                "status",
                uniqBy(
                    data.map((v) => ({ name: v.state?.status.name, icon: v.state?.icon })),
                    "name",
                ).sort(),
            ],
        ]);
    }, [data, filterableKeys]);

    const [open, setOpen] = useState(false);

    const { t } = useTranslation();

    const { getFilter, setFilter } = useFilterContext();

    return (
        <>
            <Main2 open={open} filterableValues={filterableValues}>
                <Stack direction="row" spacing={1} p={1} alignItems="center" divider={<Divider orientation="vertical" flexItem />}>
                    <FilterExpand label={t("table.filter.STATUS", "Status")} count={getFilter("STATUS", true).length}>
                        <SelectFilter3
                            label={t("table.filter.STATUS", "Status")}
                            options={filterableValues["status"]}
                            value={getFilter("STATUS", true)}
                            onChange={setFilter("STATUS")}
                        />
                    </FilterExpand>
                    <FilterExpand label={t("table.filter.CATEGORY", "Category")} count={getFilter("CATEGORY", true).length}>
                        <SelectFilter2
                            label={t("table.filter.CATEGORY", "Category")}
                            options={filterableValues["processCategory"]}
                            value={getFilter("CATEGORY", true)}
                            onChange={setFilter("CATEGORY")}
                        />
                    </FilterExpand>
                    <FilterExpand label={t("table.filter.CREATED_BY", "Author")} count={getFilter("CREATED_BY", true).length}>
                        <SelectFilter2
                            label={t("table.filter.CREATED_BY", "Author")}
                            options={filterableValues["createdBy"]}
                            value={getFilter("CREATED_BY", true)}
                            onChange={setFilter("CREATED_BY")}
                        />
                    </FilterExpand>
                    <FilterExpand
                        label={t("table.filter.other", "Other")}
                        count={
                            ["HIDE_SCENARIOS", "HIDE_FRAGMENTS", "HIDE_ACTIVE", "SHOW_ARCHIVED"].filter((k: keyof FiltersModel) =>
                                getFilter(k),
                            ).length
                        }
                    >
                        <Stack direction="column">
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle2">{t("table.filter.other", "Other")}</Typography>
                                <IconButton
                                    aria-label="clear"
                                    onClick={() => {
                                        ["HIDE_SCENARIOS", "HIDE_FRAGMENTS", "HIDE_ACTIVE", "SHOW_ARCHIVED"].forEach(
                                            (k: keyof FiltersModel) => setFilter(k, false),
                                        );
                                    }}
                                    edge="end"
                                    size="small"
                                    sx={{
                                        visibility: ["HIDE_SCENARIOS", "HIDE_FRAGMENTS", "HIDE_ACTIVE", "SHOW_ARCHIVED"].filter(
                                            (k: keyof FiltersModel) => getFilter(k),
                                        ).length
                                            ? "visible"
                                            : "hidden",
                                    }}
                                >
                                    <FilterListOff />
                                </IconButton>
                            </Stack>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="default"
                                        checked={getFilter("HIDE_SCENARIOS") !== true}
                                        onChange={(e) => {
                                            setFilter("HIDE_SCENARIOS", !e.target.checked);
                                        }}
                                    />
                                }
                                label={`${t("table.filter.SHOW_SCENARIOS", "Show scenarios")}`}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="default"
                                        checked={getFilter("HIDE_FRAGMENTS") !== true}
                                        onChange={(e) => {
                                            setFilter("HIDE_FRAGMENTS", !e.target.checked);
                                        }}
                                    />
                                }
                                label={`${t("table.filter.SHOW_FRAGMENTS", "Show fragments")}`}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="default"
                                        checked={getFilter("HIDE_ACTIVE") !== true}
                                        onChange={(e) => {
                                            setFilter("HIDE_ACTIVE", !e.target.checked);
                                        }}
                                    />
                                }
                                label={`${t("table.filter.SHOW_ACTIVE", "Show active")}`}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={getFilter("SHOW_ARCHIVED") === true}
                                        onChange={(e) => {
                                            setFilter("SHOW_ARCHIVED", e.target.checked);
                                        }}
                                    />
                                }
                                label={`${t("table.filter.SHOW_ARCHIVED", "Show archived")}`}
                            />
                        </Stack>
                    </FilterExpand>
                    <IconButton type="button" size="small" color={open ? "primary" : "inherit"} onClick={() => setOpen((s) => !s)}>
                        <FilterList />
                    </IconButton>
                </Stack>
            </Main2>

            <ActiveFilters filterableValues={filterableValues} />

            <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "row-reverse" }}>
                <Draw open={open}>
                    <Box>
                        <Filters2 visible={open} values={filterableValues} />
                    </Box>
                </Draw>
                <Main open={open}>
                    <ItemsList data={data} filterRules={filterRules} isLoading={isLoading} />
                </Main>
            </Box>
        </>
    );
}

const FilterExpand = ({ children, label, count }: PropsWithChildren<{ label: string; count?: number }>) => {
    const popupState = usePopupState({ variant: "popper", popupId: label });
    return (
        <>
            <Badge badgeContent={count} color="info">
                <Button
                    type="button"
                    size="small"
                    variant="text"
                    color="inherit"
                    startIcon={popupState.isOpen ? <ExpandLess /> : <ExpandMore />}
                    {...bindTrigger(popupState)}
                >
                    {label}
                </Button>
            </Badge>
            <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <Box p={2}>{children}</Box>
            </Popover>
        </>
    );
};
function stringAvatar(name: string) {
    const [first, second = ""] = [...name].filter((l) => l.match(/[b-df-hj-np-tv-z0-9]/i));

    const letters = `${first}${second}`;
    const color = new Chance(name).color({ format: "shorthex" });
    return {
        sx: {
            "&, .MuiChip-root &": {
                bgcolor: color,
                color: (theme) => theme.palette.getContrastText(color),
            },
        },
        children: letters,
    };
}

export const ActiveFilters = ({ filterableValues }: { filterableValues: Record<string, any[]> }) => {
    const { model, setFilter } = useFilterContext();
    const values = Object.keys(model)
        .filter((k) => k !== "TEXT")
        .flatMap((k) => [].concat(model[k]).map((v) => [k, v]));

    if (!values.length) {
        return null;
    }

    return (
        <Box
            sx={{
                display: "flex",
                // m: 1,
                columnGap: 0.5,
                rowGap: 1,
                flexWrap: "wrap",
            }}
        >
            {values.map(([name, value]) => (
                <Chip
                    avatar={<Avatar {...stringAvatar(name)} />}
                    size="small"
                    key={name + value}
                    label={value.length ? value : name}
                    onDelete={() => {
                        setFilter(name, model[name].filter ? model[name].filter((c) => c !== value) : null);
                    }}
                />
            ))}
        </Box>
    );
};
