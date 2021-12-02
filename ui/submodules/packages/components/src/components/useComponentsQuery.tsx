import type { ComponentType, ComponentUsageType } from "nussknackerUi/HttpService";
import { useContext, useMemo } from "react";
import { useQuery } from "react-query";
import { UseQueryResult } from "react-query/types/react/types";
import { NkApiContext, NkIconsContext } from "../settings/nkApiProvider";

export function useComponentsQuery(): UseQueryResult<ComponentType[]> {
    const api = useContext(NkApiContext);
    const { getComponentIconSrc } = useContext(NkIconsContext);
    return useQuery({
        queryKey: "components",
        queryFn: async () => {
            const { data } = await api.fetchComponents();
            return data.map((component) => ({
                ...component,
                icon: getComponentIconSrc(component.icon),
            }));
        },
        enabled: !!api,
        refetchInterval: 60000,
    });
}

export function useComponentUsagesQuery(componentId: string): UseQueryResult<ComponentUsageType[]> {
    const api = useContext(NkApiContext);
    return useQuery({
        queryKey: ["usages", componentId],
        queryFn: async () => {
            const { data } = await api.fetchComponentUsages(componentId);
            return data;
        },
        enabled: !!api,
        refetchInterval: 60000,
    });
}

export function useComponentQuery(componentId: string): UseQueryResult<ComponentType> {
    const query = useComponentsQuery();
    const component = useMemo(() => {
        return query.data?.find(({ id }) => id === componentId);
    }, [componentId, query.data]);

    return { ...query, data: component } as UseQueryResult<ComponentType>;
}
