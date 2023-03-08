<template>
  <div class="q-pa-md">
    <div class="bg-grey-2 q-pa-sm rounded-borders ">
      Regions:
      <q-select
        :options="availableRegions"
        v-model="selectedRegion"
        outlined
        style="border-color: #0d47a1;"
      />
    </div>
  </div>
</template>

<script>
import {useMapStore} from "@/store/mapStore.js";
import {storeToRefs} from "pinia";

export default {
  name: "MapSideBar",
  setup(){
    const mapStore = useMapStore();
    const {region, regions} = storeToRefs(mapStore);
    return {
      availableRegions: regions,
      selectedRegion: region,
    }
  }
};
</script>

<style scoped>

</style>