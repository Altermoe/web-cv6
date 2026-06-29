/**
 * Common types for @webcv6/ui component library
 */

/** Size variants matching Civ 6's UI scale */
export type UiSize = "sm" | "md" | "lg" | "xl";

/** Color variants — golden is the default Civ 6 accent */
export type UiVariant =
  | "primary" // Gold/amber — primary actions
  | "secondary" // Stone gray — neutral
  | "success" // Green — positive
  | "warning" // Orange — caution
  | "danger" // Red — destructive
  | "info"
  | "ghost"; // Blue — informational

/** Button-like shape */
export type UiShape = "rect" | "rounded" | "pill";

/** Placement for positioned elements */
export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface IconSlot {
  /** Icon name or SVG path */
  icon?: string;
}
