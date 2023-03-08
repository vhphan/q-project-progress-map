<script>
import MainLayout from "@/layouts/MainLayout.vue";
import {parseCookie} from "@/utils/myFunctions";

export default {
  components: {MainLayout},
  setup() {

    if (process.env.NODE_ENV === 'development') {
      document.cookie = "API=" + import.meta.env.VITE_API_KEY + ";";
    }


  }
};

</script>

<template>
  <main-layout/>
</template>

<style>
/*@import "tabulator-tables/dist/css/tabulator.min.css";*/
@import "tabulator-tables/dist/css/tabulator_modern.min.css";

.tabulator {
  font-size: 0.8rem;
}
</style>
