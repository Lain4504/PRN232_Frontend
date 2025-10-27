"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

interface PopoverContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open: openProp, onOpenChange, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = useCallback(
    (o: boolean) => {
      if (onOpenChange) onOpenChange(o);
      else setInternalOpen(o);
    },
    [onOpenChange]
  );

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactElement<any>;
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const ctx = useContext(PopoverContext);
  if (!ctx) return children;
  const { open, setOpen } = ctx;

  const onClick = (e: React.MouseEvent) => {
    try {
      (children.props as any)?.onClick?.(e);
    } catch {}
    setOpen(!open);
  };

  return asChild
    ? (React.cloneElement(children as any, { onClick } as any))
    : (
        <button type="button" onClick={onClick}>
          {children}
        </button>
      );
}

export interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

export function PopoverContent({ children, className }: PopoverContentProps) {
  const ctx = useContext(PopoverContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;

  if (!open) return null;

  return (
    <div className={className} role="dialog" aria-modal="false">
      {children}
    </div>
  );
}

export default Popover;
