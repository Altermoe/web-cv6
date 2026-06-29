<script setup lang="ts">
/**
 * CvScrollArea — Civ 6 styled scroll container
 * Wraps reka-ui ScrollArea with ornate stone/gold scrollbar styling.
 */
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "reka-ui";

withDefaults(
  defineProps<{
    type?: "auto" | "always" | "scroll" | "hover" | "glimpse";
    scrollHideDelay?: number;
    dir?: "ltr" | "rtl";
  }>(),
  {
    type: "hover",
    scrollHideDelay: 600,
  },
);
</script>

<template>
  <ScrollAreaRoot
    :type="type"
    :scroll-hide-delay="scrollHideDelay"
    :dir="dir"
    class="cv-scroll-area"
  >
    <ScrollAreaViewport class="cv-scroll-area__viewport">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar class="cv-scroll-area__scrollbar" orientation="vertical">
      <ScrollAreaThumb class="cv-scroll-area__thumb" />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      class="cv-scroll-area__scrollbar cv-scroll-area__scrollbar--horizontal"
      orientation="horizontal"
    >
      <ScrollAreaThumb class="cv-scroll-area__thumb" />
    </ScrollAreaScrollbar>

    <ScrollAreaCorner class="cv-scroll-area__corner" />
  </ScrollAreaRoot>
</template>

<style scoped>
.cv-scroll-area {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.cv-scroll-area__viewport {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

/* === Scrollbar Track === */
.cv-scroll-area__scrollbar {
  display: flex;
  user-select: none;
  touch-action: none;
  padding: 2px;
  transition: background var(--civ-transition-fast);
  background: rgba(26, 25, 21, 0.4);
  border-radius: 10px;
}

.cv-scroll-area__scrollbar:hover {
  background: rgba(26, 25, 21, 0.6);
}

/* Vertical scrollbar sizing */
.cv-scroll-area__scrollbar[data-orientation="vertical"] {
  width: 10px;
}

/* Horizontal scrollbar sizing */
.cv-scroll-area__scrollbar--horizontal {
  flex-direction: column;
  height: 10px;
}

/* === Thumb === */
.cv-scroll-area__thumb {
  position: relative;
  flex: 1;
  background: var(--civ-stone-500);
  border-radius: 10px;
  border: 1px solid var(--civ-stone-700);
  transition: background var(--civ-transition-fast),
    border-color var(--civ-transition-fast);
}

/* Gold highlight on hover / drag */
.cv-scroll-area__thumb:hover {
  background: var(--civ-gold-600);
  border-color: var(--civ-gold-500);
}

.cv-scroll-area__thumb[data-state="visible"] {
  background: var(--civ-gold-700);
  border-color: var(--civ-gold-600);
}

/* === Corner === */
.cv-scroll-area__corner {
  background: rgba(26, 25, 21, 0.4);
}
</style>
