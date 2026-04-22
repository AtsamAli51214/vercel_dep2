<template>
  <span
    class="inline-flex flex-wrap items-center gap-x-1 gap-y-1 align-middle"
    data-base-extras
  >
    <template v-if="items.length">
      <template
        v-for="(item, index) in visibleItems"
        :key="stableKey(item, index)"
      >
        <slot name="item" :item="item" :index="index">
          <span class="text-sm">{{ formatDefault(item) }}</span>
        </slot>
        <span
          v-if="separator && showSeparatorAfterVisible(index)"
          class="text-secondary-color text-sm"
          aria-hidden="true"
          >{{ separator }}</span
        >
      </template>

      <template v-if="hiddenCount > 0">
        <span
          v-if="visibleItems.length > 0"
          class="text-secondary-color text-sm"
          aria-hidden="true"
          >{{ separator }}</span
        >
        <Button
          :label="'+' + hiddenCount"
          severity="secondary"
          rounded
          size="small"
          :pt="{
            root: {
              class: 'text-sm! focus:underline! p-0!',
            },
          }"
          text
          @click="togglePopover"
        />

        <Popover
          ref="popoverRef"
          :dismissable="true"
          @show="popoverOpen = true"
          @hide="popoverOpen = false"
        >
          <div :class="['flex gap-2 min-w-48 max-w-96', popoverBodyClass]">
            <div
              class="overflow-y-auto text-sm"
              :style="{ maxHeight: popoverMaxHeight }"
            >
              <template
                v-for="(item, index) in hiddenItems"
                :key="stableKey(item, visibleCount + index)"
              >
                <div class="py-0.5">
                  <slot name="item" :item="item" :index="visibleCount + index">
                    <span>{{ formatDefault(item) }}</span>
                  </slot>
                </div>
              </template>
            </div>
          </div>
        </Popover>
      </template>
    </template>
    <slot v-else name="empty" />
  </span>
</template>

<script setup lang="ts" generic="T">
import { computed, ref } from "vue";
import Popover from "primevue/popover";

const props = withDefaults(
  defineProps<{
    items: readonly T[];
    visibleCount?: number;
    separator?: string;
    popoverMaxHeight?: string;
    popoverBodyClass?: string;
    itemKey?: string | ((item: T, index: number) => string | number);
  }>(),
  {
    visibleCount: 3,
    separator: "",
    popoverMaxHeight: "min(50vh, 18rem)",
    popoverBodyClass: "",
  },
);

defineSlots<{
  item(props: { item: T; index: number }): unknown;
  "more-label"(props: { count: number }): unknown;
  empty(): unknown;
}>();

const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
const popoverOpen = ref(false);

const visibleItems = computed(() =>
  props.items.slice(0, Math.max(0, props.visibleCount)),
);
const hiddenItems = computed(() =>
  props.items.slice(Math.max(0, props.visibleCount)),
);
const hiddenCount = computed(() => hiddenItems.value.length);

function formatDefault(item: T): string {
  if (item === null || item === undefined) return "";
  if (typeof item === "object") {
    const o = item as Record<string, unknown>;
    if (typeof o.label === "string") return o.label;
    if (typeof o.name === "string") return o.name;
    return String(o);
  }
  return String(item);
}

function stableKey(item: T, index: number): string | number {
  const k = props.itemKey;
  if (typeof k === "function") return k(item, index);
  if (typeof k === "string" && item !== null && typeof item === "object") {
    const v = (item as Record<string, unknown>)[k];
    if (typeof v === "string" || typeof v === "number") return v;
  }
  return index;
}

function showSeparatorAfterVisible(index: number): boolean {
  return index < visibleItems.value.length - 1;
}

function togglePopover(event: MouseEvent) {
  popoverRef.value?.toggle(event);
}
</script>
