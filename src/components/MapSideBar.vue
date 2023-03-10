<template>
  <div class="q-pa-xs">
    <q-expansion-item
        expand-separator
        icon="map"
        label="Map settings"
        group="some-group"
    >
      Regions (sites displayed):
      <q-select
          :options="availableRegions"
          v-model="selectedRegion"
          outlined
          group="some-group"
          style="border-color: #0d47a1;"
      />
    </q-expansion-item>

    <q-expansion-item
        expand-separator
        icon="analytics"
        label="KPI settings"
        group="some-group"
    >
      <excel-file-selector/>

    </q-expansion-item>
    <q-expansion-item
        expand-separator
        icon="palette"
        label="Legend Colors"
        group="some-group"

    >
      <q-option-group
          type="radio"
          inline
          color="primary"
          v-model="selectedLegendType"
          :options="availableLegendTypes"
      />

      <custom-color-range v-if="selectedLegendType==='custom'" />

      <q-card v-if="selectedLegendType==='presets'">
        <q-card-section class="row">
          <q-select
              v-model="colorMap"
              :options="colorMapList"
              label="Color Scheme"
              outlined
              class="col-12"
          />
          <q-toggle v-model="reverseColorMap" label="Reverse Color Scheme" class="col-4"/>
          <q-space/>
          <q-btn
              glossy
              label="Apply/Redraw"
              @click="()=>redraw()"
              class="col-6 q-mt-xs q-mx-xs bg-blue-2"
              :loading="redrawKpiLayer">
            <template v-slot:loading>
              <q-spinner-clock
                  size="1.5em"
                  class="q-pa-xs"
              />
            </template>
          </q-btn>
        </q-card-section>


      </q-card>

      <q-card>
        <q-card-section v-if="selectedLegendType==='presets'">

          <div class="text-h6"><span>Legend: </span>
          </div>
          <div
              v-html="getLegend"
          ></div>

        </q-card-section>

      </q-card>
      <q-card>

        <q-card-section>
          <q-slider
              v-model="polygonLayerOpacity"
              :min="0.1"
              :max="1"
              :step="0.05"
          />
        </q-card-section>

      </q-card>

    </q-expansion-item>
    <q-expansion-item
        expand-separator
        icon="insights"
        label="Select KPI"
        group="some-group"
    >
      <q-card
          bordered
      >
        <q-card-section>
          <q-option-group
              v-model="selectedTypeOfKpi"
              :options="availableTypesOfKpi"
              type="radio"
              inline
              color="primary"
              dense
          />
        </q-card-section>
        <q-select
            v-model="selectedKpi[selectedTypeOfKpi]"
            :options="availableKpi[selectedTypeOfKpi]"
            label="Select KPI"
            outlined
            class="col-12"
        />
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
        <q-btn
            glossy
            class="full-width q-mt-sm bg-amber-3"
            label="Reset Polygons Styles"
            @click="()=>mapStore.resetPolygonsStylesTriggered = true"
        />

      </q-card>


    </q-expansion-item>


  </div>
</template>

<script>
import {useMapStore} from "@/store/mapStore.js";
import {storeToRefs} from "pinia";

import ExcelFileSelector from "@/components/ExcelFileSelector.vue";
import {useCosmeticStore} from "@/store/cosmeticStore.js";
import {useProgressDataStore} from "@/store/progressDataStore.js";
import CustomColorRange from "@/components/CustomColorRange.vue";

export default {
  name: "MapSideBar",
  components: {CustomColorRange, ExcelFileSelector},
  setup() {
    const mapStore = useMapStore();
    const {region, regions} = storeToRefs(mapStore);

    const cosmeticStore = useCosmeticStore();
    const {
      getLegend,
      colorMapList,
      colorMap,
      reverseColorMap,
    } = storeToRefs(cosmeticStore);

    const {redrawKpiLayer} = storeToRefs(mapStore);
    const redraw = () => {
      redrawKpiLayer.value = true;
      setTimeout(() => {
        redrawKpiLayer.value = false;
      }, 10_000);
    };

    const progressDataStore = useProgressDataStore();
    const {selectedTypeOfKpi, availableTypesOfKpi, availableKpi, selectedKpi} = storeToRefs(progressDataStore);

    const {polygonLayerOpacity} = storeToRefs(mapStore);
    // const {testOpacity} = storeToRefs(mapStore);

    const {
      availableLegendTypes,
      selectedLegendType,
    } = storeToRefs(cosmeticStore);

    return {
      availableRegions: regions,
      selectedRegion: region,
      getLegend,
      colorMapList,
      colorMap,
      reverseColorMap,
      redrawKpiLayer,
      redraw,
      selectedTypeOfKpi,
      availableTypesOfKpi,
      availableKpi,
      selectedKpi,
      mapStore,
      polygonLayerOpacity,
      availableLegendTypes,
      selectedLegendType,
    };
  }
};
</script>

