import { useCallback, useEffect, useState } from "react";
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value === undefined ? internal : value;
  const set = useCallback(
    (next: T) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, set] as const;
}
export function useDisclosure(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  return {
    open,
    setOpen,
    show: useCallback(() => setOpen(true), []),
    hide: useCallback(() => setOpen(false), []),
    toggle: useCallback(() => setOpen((v) => !v), []),
  };
}
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);
  return matches;
}
