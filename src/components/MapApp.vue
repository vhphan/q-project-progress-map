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
import {
  clusterIdColumn,
  districtIdColumn,
  getPolygonIdKey,
  localCouncilIdColumn,
  operator,
  polygonDisplayNames,
  polygonIdKeyInGeoJSON
} from "@/settings/constants";
import {useMainStore} from "@/store/mainStore";
import {storeToRefs} from "pinia";
import {addSearch, addSizeSelector, loadBasicMap, makeSiteLayers} from "@/composables/basicMap";
import {debounce} from "quasar";
import {getCookie, loadScript, titleCase} from "@/utils/myFunctions";
import {BASE_URL_NODE, NODE_URL} from "@/plugins/http";
import {useProgressDataStore} from "@/store/progressDataStore.js";
import {useCosmeticStore} from "@/store/cosmeticStore.js";
import {triggerNegative} from "@/utils/notifications.js";


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
      markerGroups: {},
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
      polygonLayerOpacity,
      // hoveredSiteInfo,
      // clickedCellInfo,
      // cellToZoomTo,
      // techLayersAdded,
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
    const {polygonsStyles} = storeToRefs(mapStore);

    const createLayerGroups = () => {

      const otherPolygonLayers = [
        {
          label: 'cluster',
          url: `${BASE_URL_NODE}/polygons?file=clusters&api=${apiKey}`,
          ...polygonsStyles.value['cluster'],
          markers: null,
        },
        {
          label: 'district',
          url: `${BASE_URL_NODE}/polygons?file=districts&api=${apiKey}`,
          ...polygonsStyles.value['district'],
          markers: null,
        },
        {
          label: 'localCouncil',
          url: `${BASE_URL_NODE}/polygons?file=local_councils&api=${apiKey}`,
          ...polygonsStyles.value['localCouncil'],
          markers: null,
        },
      ];

      const clusterClickCallBack = function (e) {
        // console.log(e);
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
    };

    const addSiteLayers = () => {
      Object.keys(mapObj.layerGroups).forEach(techLayer => {
        mapObj.map.addLayer(mapObj.layerGroups[techLayer]);
        let temp = {};
        temp[techLayer] = true;
        mapStore.techLayersAdded.value = {...mapStore.techLayersAdded.value, ...temp};
      });
    };

    const updateLayers = () => {
      techLayers.value.forEach((techLayer) => {
        const url = `${NODE_URL}/geojson?stats=1&region=${region.value}&system=${techLayer}&size=${sectorSize.value}&api=${apiKey}`;
        mapObj.layerGroups[techLayer].getLayers()[0].refresh(url);
      });
    };

    const refreshLayersWithNewSize = newSectorSize => {
      sectorSize.value = newSectorSize;
      updateLayers();
    };

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

    const makeMapCallBack = () => {
      // setupLeafletMap('Google Roadmap');
      setupLeafletMap('Positron (CartoDB)');
      saveMapPosition();
      createLayerGroups();
      addSiteLayers();
      addSearch(mapObj);
      window.map = mapObj.map;
      addSizeSelector({map: mapObj.map, sectorSize: sectorSize.value, refreshFunc: refreshLayersWithNewSize});

      setTimeout(() => {
        filterPolygonsByRegion(selectedRegionPolygon.value);
      }, 5000);

    };

    const toolbarHeight = computed(() => document.getElementById('toolbar')?.offsetHeight || 60);

    const adjustMapHeight = debounce(function () {
      if (!document.getElementById(mapObj.id)) {
        return;
      }
      document.getElementById(mapObj.id).style.height = 'calc(100vh - ' + toolbarHeight.value + 'px)';
      if (mapObj.map) {
        mapObj.map.invalidateSize();
      }
    }, 500);

    window.onresize = debounce(() => {
      adjustMapHeight();
    }, 1500);

    onMounted(() => {
      setTimeout(() => {
        adjustMapHeight();
        if (mapObj.map === null) {
          makeMap();
        }
      }, 500);
    });

    const progressDataStore = useProgressDataStore();
    const {progressData, selectedKpi, selectedTypeOfKpi} = storeToRefs(progressDataStore);
    const {redrawKpiLayer, mapTitle} = storeToRefs(mapStore);
    const cosmeticStore = useCosmeticStore();

    const makeMap = () => {
      if (window.google) {
        makeMapCallBack();
        return;
      }
      loadScript(`https://api.eprojecttrackers.com/node/${operator}/googleMap?api=${apiKey}`,
          'google', makeMapCallBack);
    };
    const getColor = (polygonData) => {
      if (polygonData) {
        const colorFunc = cosmeticStore.getColorScaleByMethod();
        let polygonDatum = polygonData[selectedKpi.value[selectedTypeOfKpi.value]];
        return colorFunc(polygonDatum).hex();
      }
      return '#ffffff';
    };
    const getPolygonData = () => {
      let key;
      switch (selectedTypeOfKpi.value) {
        case 'cluster':
          key = 'clusterData';
          break;
        case 'district':
          key = 'districtData';
          break;
        case 'localCouncil':
          key = 'localCouncilData';
          break;
        default:
          throw new Error('Unknown type of KPI');
      }
      if (!key || !progressData.value[key]) {
        triggerNegative({
          message: `No data for selected KPI Type ${selectedTypeOfKpi.value}`,
        });
        triggerNegative({
          message: `Dataset Loaded is ${progressDataStore.dataFileNameLoaded}. Try another dataset!`,
        });
      }
      return progressData.value[key];
    };
    const getSinglePolygonData = (data, polygonIdKey, polygonId) => data.find((row) => row[polygonIdKey] === polygonId);
    const getAdditionalPopUp = (polygonId) => {
      const polygonIdKey = getPolygonIdKey(selectedTypeOfKpi.value);
      const data = getPolygonData();
      const polygonData = getSinglePolygonData(data, polygonIdKey, polygonId);
      if (polygonData) {
        const kpiValue = polygonData[selectedKpi.value[selectedTypeOfKpi.value]];
        let kpiText = isNaN(+kpiValue) ? '' : (parseFloat(kpiValue) * 100).toFixed(0) + '%';
        return `<b>${selectedKpi.value[selectedTypeOfKpi.value]}</b>: ${kpiText}<br>`;
      }
      return '';
    };
    const getStyle = (layer, polygonIdColumn) => {
      const polygonId = layer.feature.properties[polygonIdColumn];
      // const polygonIdKey = selectedTypeOfKpi.value === 'cluster' ? 'Cluster' : 'District';
      // const data = selectedTypeOfKpi.value === 'cluster' ? progressData.value.clusterData : progressData.value.districtData;

      const polygonIdKey = getPolygonIdKey(selectedTypeOfKpi.value);
      const data = getPolygonData();

      const polygonData = getSinglePolygonData(data, polygonIdKey, polygonId);
      if (!polygonData) {
        return polygonsStyles[selectedTypeOfKpi.value];
      }
      if (selectedRegionPolygon.value !== 'ALL' && polygonData['Region'] !== selectedRegionPolygon.value) {
        return polygonsStyles['hidden'];
      }

      return {
        fillColor: getColor(polygonData),
        weight: 1,
        color: '#a6a6a6',
        fillOpacity: polygonLayerOpacity.value,
      };
    };

    const {dataLoaded} = storeToRefs(progressDataStore);
    const {selectedRegionPolygon} = storeToRefs(cosmeticStore);
    const {resetPolygonsStylesTriggered} = storeToRefs(mapStore);
    const {polygonLabels} = mapStore;
    let oldLabels = {...polygonLabels};

    const resetPolygonLayersStyles = () => {
      polygonLayerOpacity.value = 0.1;
      mapObj.layerGroups.cluster.eachLayer((layer) => {
        layer.setStyle({
          ...polygonsStyles.cluster,
        });
      });
      mapObj.layerGroups.district.eachLayer((layer) => {
        layer.setStyle({
          ...polygonsStyles.district,
        });
      });
    };
    const changePolygonOpacity = debounce(() => {

      const {polygonLabels} = mapStore;

      Object.keys(polygonLabels).forEach((key) => {
            if (polygonLabels[key]) {
              mapObj.layerGroups[key].eachLayer((layer) => {
                layer.setStyle({
                  fillOpacity: polygonLayerOpacity.value
                });
              });
            }
          }
      );
    }, 800);

    watch(toolbarHeight, (newHeight, oldHeight) => {
      adjustMapHeight();
    });

    watch(region, (newRegion, oldRegion) => {
      if (newRegion === oldRegion) return;
      mapObj.map.setView(mapStore.centers[newRegion], mapStore.defaultZoom);
      updateLayers();
    });

    watch(redrawKpiLayer, async (newValue) => {
      console.log('redrawKpiLayer triggered', newValue);
      if (!newValue) {
        return;
      }
      if (!dataLoaded.value) {
        // $q.loading.show({
        //   message: 'Fetching data from server. Hang on...'
        // });
        await progressDataStore.queryProgressData();
        // $q.loading.hide();
      }
      // const polygonIdColumn = selectedTypeOfKpi.value === 'cluster' ? clusterIdColumn : districtIdColumn;

      let polygonIdColumn;
      switch (selectedTypeOfKpi.value) {
        case 'cluster':
          polygonIdColumn = clusterIdColumn;
          break;
        case 'district':
          polygonIdColumn = districtIdColumn;
          break;
        case 'localCouncil':
          polygonIdColumn = localCouncilIdColumn;
          break;
        default:
          throw new Error('Invalid selectedTypeOfKpi');
      }

      mapObj.layerGroups[selectedTypeOfKpi.value].eachLayer((layer) => {

        let html = '';
        for (const [key, value] of Object.entries(layer.feature.properties)) {
          if (value) {
            html += `<b>${key}</b>: ${value}<br>`;
          }
        }
        let additionalPopUp = getAdditionalPopUp(layer.feature.properties[polygonIdColumn]);
        html += additionalPopUp;
        layer.bindPopup(html);
        layer.bindTooltip(additionalPopUp);

        polygonLayerOpacity.value = 0.5;
        layer.setStyle(getStyle(layer, polygonIdColumn));
      });
      mapTitle.value = `${titleCase(selectedTypeOfKpi.value)}: ${titleCase(selectedKpi.value[selectedTypeOfKpi.value])}`;
      redrawKpiLayer.value = false;
    });

    function filterPolygonsByRegion(newValue) {
      function getPolygonStyle(layer, key) {
        if (newValue === 'ALL' || (newValue !== 'ALL' && layer.feature.properties.Region === newValue)) {
          layer.setStyle({
            ...polygonsStyles.value[key],
          });
          return;
        }
        layer.setStyle({
          ...polygonsStyles.value.hidden,
        });
      }

      Object.keys(polygonLabels).forEach((key) => {
        mapObj.layerGroups[key].eachLayer((layer) => {
              getPolygonStyle(layer, key);
            }
        );
      });
    }

    watch(selectedRegionPolygon, (newValue) => {
      filterPolygonsByRegion(newValue);
    });

    watch(()=>mapObj.map, (newValue) => {
      console.log('mapObj.map changed', newValue);
    });

    watch(resetPolygonsStylesTriggered, (newValue) => {
      if (newValue) {
        resetPolygonLayersStyles();
        mapStore.resetPolygonsStylesTriggered = false;
      }
    });

    watch(polygonLayerOpacity, () => {
      changePolygonOpacity();
    });

    watch(polygonLabels, (newValue, oldValue) => {
      for (const [key, value] of Object.entries(polygonLabels)) {
        if (value && !oldLabels[key]) {

          let markers = [];
          mapObj.layerGroups[key].eachLayer((layer) => {

            const polygonCenter = layer.getBounds().getCenter();
            let geoProperties = layer.feature.properties;
            let labelText = geoProperties[polygonDisplayNames[key]];
            let data = progressData.value[key + 'Data'];
            let kpiText = '';
            try {
              let foundData = data.find((row) => row[getPolygonIdKey(key)] === geoProperties[polygonIdKeyInGeoJSON[key]]);

              if (data && foundData) {
                let kpiValue = foundData[selectedKpi.value[key]];
                kpiText = isNaN(+kpiValue) ? '' : (parseFloat(kpiValue) * 100).toFixed(0) + '%';
                kpiText = ': ' + kpiText;
              }

              let marker = L.circleMarker(polygonCenter, {
                radius: 10,
                color: '#003cff',
                fillColor: '#fff',
                fillOpacity: 1,
                weight: 1,
              }).bindTooltip(labelText + kpiText, {
                permanent: true,
                direction: 'center',
                className: 'polygon-label',
              });
              markers.push(marker);
            } catch (e) {
              console.log(e);
            }
          });
          mapObj.markerGroups[key] = L.layerGroup(markers);
          mapObj.markerGroups[key].addTo(mapObj.map);

        }
        if (!value && mapObj.markerGroups[key]) {
          mapObj.map.removeLayer(mapObj.markerGroups[key]);
        }
      }
      oldLabels = {...newValue};
    }, {deep: true});

    return {
      mapObjReactive,
      mapResize,
      makeMap,
      mapTitle,
    };
  }
};

</script>

<style>
.polygons-label {
  min-width: 100px;
}
</style>