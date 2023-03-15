<template>
  <q-card
      class="my-card">

    <q-checkbox
        v-model="polygonLabels.district"
        label="District"
    />
    <q-checkbox
        v-model="polygonLabels.cluster"
        label="Cluster"
    />
    <q-checkbox
        v-model="polygonLabels.localCouncil"
        label="Local Council"
    />

  </q-card>
</template>
<script>
import {storeToRefs} from "pinia";
import {useMapStore} from "@/store/mapStore.js";

export default {
  name: 'polygon-labels',

  setup() {
    const mapStore = useMapStore();
    const {polygonLabels} = storeToRefs(mapStore);

    return {polygonLabels};
  }
};
</script>