<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer">
        </q-btn>
        <q-toolbar-title
            shrink
        >
          Project Dashboard
        </q-toolbar-title>

        <q-tabs align="left" class="q-ml-md">
          <q-route-tab :to="`${basePath}page1`" label="Page One"/>
          <q-route-tab :to="`${basePath}about`" label="About"/>
<!--          <q-route-tab :to="`${basePath}page3`" label="Page Three"/>-->
        </q-tabs>
        <q-space/>
        <span class="text-h5 text-bold" style="text-decoration: underline;">{{mapTitle}}</span>
        <q-space/>
      </q-toolbar>

    </q-header>
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
      <map-side-bar v-if="currentRouteName==='Page1'"/>
    </q-drawer>

    <q-page-container class="q-px-md">

      <router-view v-slot="{ Component }" :key="$route.fullPath">
        <component :is="Component"/>
      </router-view>

    </q-page-container>

  </q-layout>
</template>
<script setup>
import {basePath} from "../settings/constants.js";
import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import MapSideBar from "@/components/MapSideBar.vue";
import {storeToRefs} from "pinia";
import {useMapStore} from "@/store/mapStore.js";


const leftDrawerOpen = ref(true);
const toggleLeftDrawer = function () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};


const route = useRoute();
const currentRouteName = computed(() => route.name)
const {mapTitle} = storeToRefs(useMapStore());
</script>