import { useCallback, useEffect, useState } from "react";

function getScrollParent(element: Element): Element | null {
    if (!element) {
        return;
    }
    if (element.scrollTop || element.scrollHeight > element.clientHeight) {
        return element;
    }
    return getScrollParent(element.parentNode as Element);
}

export function useScrollParent(): [() => Element | null, (el: Element) => void, Element | null] {
    const [element, setElement] = useState<Element>();
    const bindRef = useCallback((current: Element) => {
        setElement(current);
    }, []);

    const scrollParent = useCallback(() => {
        return getScrollParent(element?.parentNode as Element);
    }, [element]);

    return [scrollParent, bindRef, element];
}
