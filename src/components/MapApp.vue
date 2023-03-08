<template>
  <div id="mapContainer" ref="mapContainer">
    <q-resize-observer :onResize="mapResize"/>
  </div>
  <q-btn v-if="typeof mapObjReactive.map!=='object'||mapObjReactive.map===null"
         class="absolute-center"
         icon="refresh"
         @click="makeMap">
    RELOAD
  </q-btn>
</template>

<script>
import L from 'leaflet'; //required for leaflet-easybutton
import {computed, onMounted, reactive, watch} from "vue";
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet-easybutton';
import {useMapStore} from "@/store/mapStore";
import {operator} from "@/settings/constants";
import {useMainStore} from "@/store/mainStore";
import {storeToRefs} from "pinia";
import {addSearch, addSizeSelector, loadBasicMap, makeSiteLayers} from "@/composables/basicMap";
import {debounce} from "quasar";
import {getCookie, loadScript} from "@/utils/myFunctions";
import {NODE_URL} from "@/plugins/http";
import {BASE_URL_NODE} from "@/plugins/http";


export default {
  name: "MapApp",
  setup() {
    const apiKey = import.meta.env.DEV ? import.meta.env.VITE_API_KEY : getCookie('API');
    const mapStore = useMapStore();
    const mainStore = useMainStore();
    const mapObj = {
      id: 'mapContainer',
      center: mapStore.lastCenter || mapStore.centers[mapStore.region],
      map: null,
      lControl: null,
      ctlTree: null,
      layerGroups: {},
      myFeatureGroup: null,
      searchControl: null,
      legend: null,
      zoom: mapStore.lastZoom || mapStore.defaultZoom,
      baseMaps: null,
      coverageMap: null,
    };
    const mapObjReactive = reactive(mapObj);
    const {
      grayOutOffAir,
      sectorSize,
      region,
      techLayers,
      techLayersColors,
      layerOpacity,
      hoveredSiteInfo,
      clickedCellInfo,
      cellToZoomTo,
      techLayersAdded,
    } = storeToRefs(mapStore);
    const layerSpecs = () => {
      return techLayers.value.map((techLayer, index) => (
          ({
            'tech': techLayer,
            'url': `${NODE_URL}/geojson?stats=1&region=${region.value}&system=${techLayer}&size=${sectorSize.value}&api=${apiKey}`,
            'colors': techLayersColors.value[index],
          })
      ));
    };
    const {setupLeafletMap, mapResize, mapContainer} = loadBasicMap(mapObj);


    function createLayerGroups() {

      const clusterPolygonStyle = {
        color: '#0000ff',
        weight: 1.5,
        fillOpacity: 0,
        fillColor: '#FF0000'
      }

      const otherPolygonLayers = [
        {
        label: 'clusters',
        url: `${BASE_URL_NODE}/polygons?file=clusters&api=${apiKey}`,
        ...clusterPolygonStyle
        }
      ];

      const clusterClickCallBack = function (e) {
        //   console.log(e);
        //   e.target.feature.properties[clusterIdColumn] && (selectedCluster.value = e.target.feature.properties[clusterIdColumn]);
      };

      let {layerGroups, layerCtlTree} = makeSiteLayers({
        layerSpecs: layerSpecs(),
        otherPolygonLayers,
        callbackForPolygonLayer: clusterClickCallBack,
        mainStore,
        mapStore
      }, grayOutOffAir.value, layerOpacity.value);
      mapObj.layerGroups = layerGroups;
      mapObj.layerCtlTree = layerCtlTree;
      layerCtlTree.addTo(mapObj.map).collapseTree().expandSelected();

      if ('clusters' in layerGroups) {
        layerGroups['clusters'].bringToBack();
      }

    }

    const addSiteLayers = () => {
      Object.keys(mapObj.layerGroups).forEach(techLayer => {
        mapObj.map.addLayer(mapObj.layerGroups[techLayer]);
        let temp = {};
        temp[techLayer] = true;
        mapStore.techLayersAdded.value = {...mapStore.techLayersAdded.value, ...temp};
      });
    };

    function updateLayers() {
      techLayers.value.forEach((techLayer) => {
        const url = `${NODE_URL}/geojson?stats=1&region=${region.value}&system=${techLayer}&size=${sectorSize.value}&api=${apiKey}`;
        mapObj.layerGroups[techLayer].getLayers()[0].refresh(url);
      });
    }

    function refreshLayersWithNewSize(newSectorSize) {
      sectorSize.value = newSectorSize;
      updateLayers();
    }

    const saveMapPosition = function () {
      const saveToStore = function (e) {
        const zoomLvl = map.getZoom();
        const center = map.getCenter();
        mapStore.lastZoom = zoomLvl;
        mapStore.lastCenter = center.hasOwnProperty('lat') && center.hasOwnProperty('lng') ? [center.lat, center.lng] : null;
        // mapStore.mapPosition.value = mapObj.map.getCenter();
        // mapStore.mapZoom.value = mapObj.map.getZoom();
      };

      mapObj.map.on('moveend', saveToStore);
    };

    function makeMapCallBack() {
      // setupLeafletMap('Google Roadmap');
      setupLeafletMap('Positron (CartoDB)');
      saveMapPosition();
      createLayerGroups();
      addSiteLayers();
      addSearch(mapObj);
      window.map = mapObj.map;
      addSizeSelector({map: mapObj.map, sectorSize: sectorSize.value, refreshFunc: refreshLayersWithNewSize});
    }

    const toolbarHeight = computed(() => document.getElementById('toolbar')?.offsetHeight || 100);
    const adjustMapHeight = debounce(function () {
      if (!document.getElementById(mapObj.id)) {
        return;
      }
      document.getElementById(mapObj.id).style.height = 'calc(100vh - ' + toolbarHeight.value + 'px)';
      if (mapObj.map) {
        mapObj.map.invalidateSize();
      }
    }, 500)

    watch(toolbarHeight, (newHeight, oldHeight) => {
      adjustMapHeight();
    });

    window.onresize = debounce(() => {
      adjustMapHeight();
    }, 1500);

    function makeMap() {
      console.log('making map');
      if (window.google) {
        makeMapCallBack();
        return;
      }
      loadScript(`https://api.eprojecttrackers.com/node/${operator}/googleMap?api=${apiKey}`,
          'google', makeMapCallBack);
    }

    onMounted(() => {
      setTimeout(() => {
        adjustMapHeight();
        if (mapObj.map === null) {
          makeMap();
        }
      }, 500);
    });

    watch(region, (newRegion, oldRegion) => {
      if (newRegion === oldRegion) return;
      mapObj.map.setView(mapStore.centers[newRegion], mapStore.defaultZoom);
      updateLayers();
    });


    return {
      mapObjReactive,
      mapResize,
      makeMap,
    };
  }
}

</script>

<style scoped>

</style>