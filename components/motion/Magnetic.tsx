/**
 * Magnetic — wrapper for buttons and links that pulls toward the pointer
 * (PRD §14.3, catalog pattern M10). Wraps its single child rather than
 * rendering its own element, so it works on <Link>, <button> or <a> alike.
 */

"use client";

import { cloneElement, isValidElement, ReactElement } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

interface MagneticProps {
  children: ReactElement<{ ref?: React.Ref<HTMLElement> }>;
}

export default function Magnetic({ children }: MagneticProps) {
  const ref = useMagnetic<HTMLElement>();
  if (!isValidElement(children)) return children;
  return cloneElement(children, { ref });
}
