import { ref, watch, nextTick, type Ref } from "vue";
import { toLocalCalendarDate } from "@/utils/helpers";

export function usePrimeVueDatePickerSync(
  source: Ref<Date | string | null | undefined>,
): Ref<Date | undefined> {
  const pickerModel = ref<Date | undefined>();
  let fromPicker = false;

  watch(
    source,
    (v) => {
      if (fromPicker) {
        fromPicker = false;
        return;
      }
      const d = toLocalCalendarDate(v);
      pickerModel.value = d;
      if (d) {
        nextTick(() => {
          pickerModel.value = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
          );
        });
      }
    },
    { immediate: true },
  );

  watch(pickerModel, (d) => {
    fromPicker = true;
    source.value = d ?? undefined;
  });

  return pickerModel;
}
