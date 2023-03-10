<template>
  <div class="q-pa-xs">
      <q-expansion-item
        expand-separator
        icon="map"
        label="Map settings"
      >
        Regions (sites displayed):
        <q-select
            :options="availableRegions"
            v-model="selectedRegion"
            outlined
            style="border-color: #0d47a1;"
        />
      </q-expansion-item>

    <q-expansion-item
        expand-separator
        icon="insights"
        label="KPI settings"
        caption="Select KPIs to display"
    >
      <excel-file-selector/>

    </q-expansion-item>
    <q-expansion-item
        expand-separator
        icon="palette"
        label="Legend Colors"
    >
      <q-card>
        <q-card-section class="row">
          <q-select
              v-model="colorMap"
              :options="colorMapList"
              label="Color Scheme"
              outlined
              class="col-12"
          />
          <q-toggle v-model="reverseColorMap" label="Reverse Color Scheme" class="col-6"/>

          <q-btn
              glossy
              label="Apply/Redraw"
              @click="()=>redraw()"
              class="col-5 q-mt-xs q-mx-xs bg-blue-2"
              :loading="redrawing">
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
        <q-card-section>

          <div class="text-h6"><span>Legend: </span>
            <!--          <span v-if="rasterMeta">{{ rasterMeta.title }}</span>-->
            <!--          <span v-else>Nothing Loaded<q-tooltip>Click 'Get Data' to Load a Raster</q-tooltip></span>-->
          </div>
          <div
              v-html="getLegend"
          ></div>

        </q-card-section>

      </q-card>

    </q-expansion-item>


  </div>
</template>

<script>
import {useMapStore} from "@/store/mapStore.js";
import {storeToRefs} from "pinia";

import ExcelFileSelector from "@/components/ExcelFileSelector.vue";
import {useCosmeticStore} from "@/store/cosmeticStore.js";
import {ref} from "vue";

export default {
  name: "MapSideBar",
  components: {ExcelFileSelector},
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

    const redrawing = ref(false);
    const redraw = () => {
      // if (!rasterLayer.value) {
      //   triggerWarning({
      //     message: 'Please select a raster type and click "Get Data" to load a raster layer.'
      //   });
      //   return;
      // }
      redrawing.value = true;
      setTimeout(() => {
        // rasterStore.drawRasterLayer();


        redrawing.value = false;
      }, 100);

    };
    return {
      availableRegions: regions,
      selectedRegion: region,
      getLegend,
      colorMapList,
      colorMap,
      reverseColorMap,
      redrawing,
      redraw,
    };
  }
};
</script>

