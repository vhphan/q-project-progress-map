<template>
  <q-card>
    <!--  color pickers for legend with selectable range values-->
    <q-card-section>
      <q-badge color="secondary">
        Number of Ranges:
      </q-badge>
      <q-slider
          v-model="numberOfClasses"
          marker-labels
          :min="3"
          :max="9"
          dense

      />


    </q-card-section>
  </q-card>
  <q-card class="my-card">
    <q-btn
        glossy
        label="Apply/Redraw"
        @click="()=>redraw()"
        class="full-width q-mt-xs bg-blue-2"
        :loading="redrawKpiLayer">
      <template v-slot:loading>
        <q-spinner-clock
            size="1.5em"
            class="q-pa-xs"
        />
      </template>
    </q-btn>
    <q-card-section
        v-for="(_, i) in customRanges"
        :key="i"
        class="row"
        style="padding: 1px; margin: 1px;"
    >
      <!--        <q-input-->
      <!--            v-if="i!==0"-->
      <!--            filled-->
      <!--            v-model="customLegend[i-1]"-->
      <!--            class="my-input col-6"-->
      <!--            readonly-->
      <!--        >-->
      <!--          <template v-slot:append>-->
      <div>
        <q-btn
            v-if="i>0"
            class="col-2 full-height"
            :style="`background-color: ${customLegend[i-1]}; width:45px;` "
        />
        <q-popup-proxy cover transition-show="scale" transition-hide="scale" class="col-3 q-pa-xs">
          <q-color v-model="customLegend[i-1]"/>
        </q-popup-proxy>
      </div>
      <!--          </template>-->
      <!--        </q-input>-->

      <q-item class="col-9" v-if="i>0">
        <q-item-section class="q-my-auto q-px-xs" style="font-size: 13px; padding: 0;">
          {{ (customRanges[i - 1] * 100).toFixed(0) }}% &nbsp&le; x &lt&nbsp {{ (customRanges[i] * 100).toFixed(0) }}%
        </q-item-section>
      </q-item>

      <q-slider
          v-model="customRanges[i]"
          :disable="i===0 || i===customRanges.length-1"
          v-if="!(i===0 || i===customRanges.length-1)"
          :min="0"
          :max="1"
          :step="0.01"
          :key="i"
          :markers="true"
          :dense="true"
          color="purple-3"
          @update:model-value="() => modelValueFunction"
      />

      <!--        <q-range-->
      <!--            v-if="i>0"-->
      <!--            v-model="{min: customRanges[i-1], max: customRanges[i]}"-->
      <!--            :min="0"-->
      <!--            :max="1"-->
      <!--            :step="0.01"-->
      <!--            :key="i"-->
      <!--            :markers="true"-->
      <!--            :dense="true"-->

      <!--        />-->

    </q-card-section>
  </q-card>
</template>

<script>
import {computed, ref, watch} from "vue";
import {useCosmeticStore} from "@/store/cosmeticStore.js";
import {storeToRefs} from "pinia";
import {debounce} from "quasar";
import {useMapStore} from "@/store/mapStore.js";

export default {
  name: "CustomColorRange",
  setup() {
    const color = ref("#000000");
    const cosmeticStore = useCosmeticStore();
    const {customLegend, customRanges} = storeToRefs(cosmeticStore);
    const numberOfClasses = computed({
          get: () => cosmeticStore.getNumberOfClasses,
          set: (val) => {

            const value = parseInt(val);

            if (value < 3 || value > 10) return;
            if (isNaN(value)) return;
            const delta = 1 / value;

            cosmeticStore.customRanges = [...Array(Math.max(3, value + 1)).fill(0).map((_, i) => i * delta)].map((v) =>
                Math.round(v * 100) / 100);

            if (value > cosmeticStore.customLegend.length) {
              cosmeticStore.customLegend = [...cosmeticStore.customLegend, ...cosmeticStore.getRandomColors(value -
                  cosmeticStore.customLegend.length)];
            } else {
              cosmeticStore.customLegend = cosmeticStore.customLegend.slice(0, value);
            }

          }
        }
    );
    watch(customRanges, debounce(() => {
          // ensure no legend ranges overlapped
          for (let i = 0; i < customRanges.value.length - 1; i++) {
            if (customRanges.value[i] >= customRanges.value[i + 1]) {
              customRanges.value[i + 1] = parseFloat((Math.min(customRanges.value[i] + 0.01, 1)).toFixed(2));
            }
          }
          // for (let i = customRanges.value.length; i > 0; i--) {
          //   if (i - 1 > 0 && customRanges.value[i] <= customRanges.value[i - 1]) {
          //
          //     console.log(customRanges.value[i - 1], customRanges.value[i], i)
          //     customRanges.value[i - 1] = parseFloat((Math.max(customRanges.value[i] - 0.01, 0)).toFixed(2));
          //   }
          // }
        }, 1000)
    );

    const modelValueFunction = (i) => {
      customRanges[i] = parseFloat(customRanges[i]);
      customRanges[i] = Math.min(customRanges[i], 1);
      customRanges[i] = Math.max(customRanges[i], 0);


    };

    const mapStore = useMapStore();
    const {redrawKpiLayer} = storeToRefs(mapStore);
    const {redraw} = mapStore;

    return {
      color,
      numberOfClasses,
      customLegend,
      customRanges,
      modelValueFunction,
      redrawKpiLayer,
      redraw,
    };
  },
};
</script>

<style scoped>

</style>