<template>
  <q-card class="my-card">
    <q-card-section>
      <!--color selector for tech layer-->
      <q-item v-for="(techLayer, i) in techLayers" :key="techLayer"
              style="border: #0d47a1 1px solid;"
              class="q-ma-xs"
      >
        <q-item-section>
            <q-btn
                class="col-2 full-height"
                :style="`background-color: ${techLayersColors[i]}; width:45px;` "
            />
            <q-popup-proxy cover transition-show="scale" transition-hide="scale" class="col-3 q-pa-xs">
              <q-color v-model="techLayersColors[i]"/>
            </q-popup-proxy>
        </q-item-section>
        <q-item-section class="q-my-auto q-px-xs" style="font-size: 1.5rem; padding: 0;">
          {{techLayer}}
        </q-item-section>
        <q-btn>Apply</q-btn>
      </q-item>

    </q-card-section>
  </q-card>
</template>
<script>
import {useMapStore} from "@/store/mapStore.js";
import {storeToRefs} from "pinia";
import {techLayers} from "@/settings/constants.js";

export default {
  name: 'sites-colors',
  setup() {
    const mapStore = useMapStore();
    const {techLayersColors} = storeToRefs(mapStore);
    const numberOfTechLayers = techLayers.length;

    return {
      techLayersColors,
      numberOfTechLayers,
      techLayers,
    };
  }

};
</script>