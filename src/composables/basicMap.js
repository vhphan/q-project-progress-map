import {ref} from "vue";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-ruler';
import 'leaflet-ruler/src/leaflet-ruler.css';
import 'leaflet.control.layers.tree';
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css';
import 'leaflet-search';
import 'leaflet-search/dist/leaflet-search.min.css';
import 'leaflet-ajax';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import {loadCss, loadScript} from "@/utils/myFunctions";

import {useApi} from "../plugins/http";
import {cellNameColumn, clusterIdColumn, siteNameColumn} from "@/settings/constants";
// import {clusterIdColumn} from "../settings/constants";

let siteMarker;

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


function getClickedFeatureInfo(feature, layer, api, mapStore) {

    const origColor = layer.options.fillColor;
    // layer.on('mouseover', async function (e) {
    //     mapStore.hoveredSiteInfo = {
    //         x: e.containerPoint.x,
    //         y: e.containerPoint.y,
    //         siteName: e.target._siteName,
    //         show: true,
    //     }
    //     if (!mapStore.siteNameOnHover) {
    //         if (siteMarker) {
    //             siteMarker.removeFrom(e.target._map);
    //             siteMarker = null;
    //         }
    //         return;
    //     }
    //     if (!siteMarker) {
    //         siteMarker = L.marker(e.latlng, {icon: blueIcon}).bindTooltip(e.target._siteName,
    //             {
    //                 permanent: true,
    //                 direction: 'right'
    //             }
    //         ).addTo(e.target._map);
    //         siteMarker.on('click', function () {
    //             if (e.target._map?.hasLayer(siteMarker)) {
    //                 e.target._map.removeLayer(siteMarker);
    //                 siteMarker = null;
    //             }
    //         });
    //     } else {
    //         siteMarker.setLatLng(e.latlng);
    //         siteMarker.setTooltipContent(e.target._siteName);
    //     }
    // });
    layer.on('mouseout', async function (e) {

    });
    layer.on('click', async function (e) {
        if (e.target.feature.properties['Cell Name']) {
            let selectedCell = e.target.feature.properties['Cell Name'];
            colorCell(e.target);
            const url = `api/get_cell_info.php?cellName=${selectedCell}`;
            const cellInfo = await api.get(url);
            mapStore.clickedCellInfo = cellInfo.data[0];
        } else {
            mapStore.clickedData = e.target.feature.properties;
        }
    });
    const siteName = layer.feature.properties[siteNameColumn];
    const cellName = layer.feature.properties[cellNameColumn];
    const htmlString = `
    <div style="border: #1D1D1D 1px solid">
        ${siteName}        
    </div>
    <div style="border: #1D1D1D 1px solid">
        ${cellName}
    </div>
    `;
    layer.bindTooltip(htmlString);

}

function loadBasicMap(mapObj) {

    siteMarker = null;
    const addRulerToMap = function () {
        L.control.ruler({
            position: 'topright',         // Leaflet control position option
            circleMarker: {               // Leaflet circle marker options for points used in this plugin
                color: 'red',
                radius: 2
            },
            lineStyle: {                  // Leaflet polyline options for lines used in this plugin
                color: 'red',
                dashArray: '1,6'
            },
            lengthUnit: {                 // You can use custom length units. Default unit is kilometers.
                display: 'km',              // This is the display value will be shown on the screen. Example: 'meters'
                decimal: 2,                 // Distance result will be fixed to this value.
                factor: null,               // This value will be used to convert from kilometers. Example: 1000 (from kilometers to meters)
                label: 'Distance:'
            },
            angleUnit: {
                display: '&deg;',           // This is the display value will be shown on the screen. Example: 'Gradian'
                decimal: 2,                 // Bearing result will be fixed to this value.
                factor: null,                // This option is required to customize angle unit. Specify solid angle value for angle unit. Example: 400 (for gradian).
                label: 'Bearing:'
            }
        }).addTo(mapObj.map);
    };
    const addControlPlaceholders = function (map) {
        let corners = map._controlCorners,
            l = 'leaflet-',
            container = map._controlContainer;

        function createCorner(vSide, hSide) {
            let className = l + vSide + ' ' + l + hSide;
            corners[vSide + hSide] = L.DomUtil.create('div', className, container);
        }

        createCorner('verticalcenter', 'left');
        createCorner('verticalcenter', 'right');
        return map;
    };
    const setUpBasemaps = function () {
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 20
        });

        const cartodb_light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 20
        });
        const cartodb_dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
            maxZoom: 20
        });
        const openTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        const Stamen_TonerBackground = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        });
        const Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        });
        const Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 20,
            ext: 'jpg'
        });
        const Waze = L.tileLayer('https://worldtiles3.waze.com/tiles/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="https://waze.com">Waze</a>, <a href=""></a> &mdash; Map data &copy; <a href="">Waze</a>',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 20,
            ext: 'png'
        });
        const googleMap = L.gridLayer.googleMutant({
            type: 'terrain' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        const googleMapSatellite = L.gridLayer.googleMutant({
            type: 'satellite' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        const googleHybrid = L.gridLayer.googleMutant({
            type: 'hybrid' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        const googleRoadmap = L.gridLayer.googleMutant({
            type: 'roadmap' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        });
        return {
            'Positron (CartoDB)': cartodb_light,
            'Dark Matter (CartoDB)': cartodb_dark,
            'OSM Default': osm,
            'Open Topo': openTopo,
            'Stamen Watercolor': Stamen_Watercolor,
            'Stamen Toner': Stamen_TonerBackground,
            'Stamen Toner Lite': Stamen_TonerLite,
            'Google': googleMap,
            'Google Satellite': googleMapSatellite,
            'Google Hybrid': googleHybrid,
            'Google Roadmap': googleRoadmap,
            'Waze': Waze,
        };
    };
    const setupLeafletMap = function (tileName = 'Google Satellite', addRuler = true) {

        let baseMaps = setUpBasemaps();
        let selectedBaseMap = baseMaps[tileName];
        mapObj.map = L.map(mapObj.id, {
            layers: selectedBaseMap,
            center: mapObj.center,
            zoom: mapObj.zoom,
            preferCanvas: true,
        });
        mapObj.baseMaps = baseMaps;
        mapObj.map = addControlPlaceholders(mapObj.map);
        mapObj.map.attributionControl.setPrefix('');
        let baseTreeChildren = [];
        Object.keys(baseMaps).forEach(function (key) {
            baseTreeChildren.push({label: key, layer: baseMaps[key]});
        });

        let baseTree = {
            label: 'BaseLayers',
            noShow: true,
            children: [{
                label: 'Base Maps',
                children: baseTreeChildren
            }],
        };

        mapObj.ctlTree = L.control.layers.tree(baseTree, null,
            {
                namedToggle: false,
                collapsed: true,
                position: 'topleft',
            });
        if (addRuler) {
            if (L.control.ruler) {
                addRulerToMap();
            } else {
                loadCss("https://cdn.jsdelivr.net/gh/gokertanrisever/leaflet-ruler@master/src/leaflet-ruler.css"
                    , 'rulerCss',
                    function () {
                        loadScript("https://cdn.rawgit.com/gokertanrisever/leaflet-ruler/master/src/leaflet-ruler.js", 'ruler', function () {
                            addRulerToMap();
                        });
                    }
                );
            }
        }

        mapObj.ctlTree.addTo(mapObj.map).collapseTree();
        mapObj.map.zoomControl.setPosition('bottomleft');
        mapObj.lControl = L.control.layers(baseMaps);

    };
    const invalidateTimer = 50;
    const mapResize = () => {
        setTimeout(() => {
            if (mapObj.map) {
                mapObj.map.invalidateSize({animate: true});
            }
        }, invalidateTimer);
    };
    const mapContainer = ref(null);
    return {setupLeafletMap, mapResize, mapContainer};
}

function makeSiteLayers({
                            layerSpecs,
                            otherPolygonLayers,
                            callbackForPolygonLayer,
                            mainStore, mapStore
                        }, grayOutOffAir = false, fillOpacity = 0.5, cell_index_name = 'Cell Name') {
    const {createApi} = useApi();
    const api = createApi(mainStore.loading);
    let layerGroups = {};
    let techLayers = layerSpecs.map(row => row['tech']);
    let geoJsonUrls = layerSpecs.map(row => row['url']);
    let layerColors = layerSpecs.map(row => row['colors']);

    let masterGroupChildrenLTE = [];
    let masterGroupChildrenNR = [];
    let masterGroupChildrenGSM = [];
    let masterGroupChildrenOtherLayers = [];
    techLayers.forEach((techLayer, index) => {
        layerGroups[techLayer] = new L.LayerGroup();
        const geoJsonUrl = geoJsonUrls[index];
        let geojsonOptions = {
            // middleware: function (data) {
            //   console.log(data);
            //   return data;
            // },
            onEachFeature: (feature, layer) => {
                const cellID = layer.feature.properties[cell_index_name];
                if (cellID) {
                    layer._cellName = cellID;
                }
                layer._siteName = layer.feature.properties['Site Name'] || `Cellname = ${cellID}` || 'Not defined';
                getClickedFeatureInfo(feature, layer, api, mapStore);
            },
            style: function (feature) {
                if (!grayOutOffAir) {
                    return {
                        color: layerColors[index],
                        weight: 1.5,
                        fillOpacity: fillOpacity,
                        fillColor: layerColors[index]
                    };
                }
                let finalColor;
                const isOnAir = ('OnAir' in feature.properties) && (feature.properties['OnAir']);
                if (isOnAir) {
                    finalColor = layerColors[index];
                } else {
                    finalColor = '#d3d1d1';
                }
                return {
                    color: finalColor,
                    weight: isOnAir ? 1.5 : 0.1,
                    fillOpacity: isOnAir ? fillOpacity : 0.1,
                    fillColor: finalColor
                };
            }
        };

        let layer = new L.GeoJSON.AJAX(geoJsonUrl, geojsonOptions);
        if (techLayer.startsWith('L')) {
            masterGroupChildrenLTE.push({
                label: techLayer,
                layer,
            });
        }
        if (techLayer.startsWith('N')) {
            masterGroupChildrenNR.push({
                label: techLayer,
                layer,
            });
        }
        if (techLayer.startsWith('G')) {
            masterGroupChildrenGSM.push({
                label: techLayer,
                layer,
            });
        }
        layerGroups[techLayer].addLayer(layer);
    });

    let layerMasterGroup = {
        label: 'Tech Layers / Polygons',
        selectAllCheckbox: true,
        children: [
            {
                label: 'LTE',
                children: masterGroupChildrenLTE,
                selectAllCheckbox: true,
            },
            {
                label: 'NR',
                children: masterGroupChildrenNR,
                selectAllCheckbox: true,
            },
            {
                label: 'GSM',
                children: masterGroupChildrenGSM,
                selectAllCheckbox: true,
            },
            {
                label: 'Polygons',
                children: masterGroupChildrenOtherLayers
            },
        ]
    };

    otherPolygonLayers.forEach(polygonLayer => {
        let layer = new L.GeoJSON.AJAX(polygonLayer.url, {
            onEachFeature: (feature, layer) => {
                if (callbackForPolygonLayer) {
                    layer.on('click', callbackForPolygonLayer);
                }
                // layer.on('mouseover', function () {
                //     this.setStyle({
                //         'fillColor': '#ff0202',
                //         'color': '#fe0404',
                //         'fillOpacity': 0.1,
                //         'weight': 5,
                //     });
                // });
                // layer.on('mouseout', function () {
                //     this.setStyle({
                //         color: polygonLayer.color,
                //         weight: 1.5,
                //         fillOpacity: 0,
                //         fillColor: polygonLayer.color
                //     });
                // })
                layer.bindTooltip(feature.properties[clusterIdColumn]);
            },
            style: function (feature) {
                return {
                    color: polygonLayer.color,
                    weight: polygonLayer.weight,
                    fillOpacity: polygonLayer.fillOpacity,
                };
            }
        });
        masterGroupChildrenOtherLayers.push({
            label: polygonLayer.label,
            layer,
        });
        layerGroups[polygonLayer.label] = layer;

        setTimeout(() => {
            layer.bringToBack();
        }, 10_000);

    });

    const layerCtlTree = L.control.layers.tree(
        null,
        layerMasterGroup,
        {
            namedToggle: false,
            collapseAll: 'Collapse all',
            expandAll: 'Expand all',
            collapsed: true,
        });
    // layerCtlTree.addTo(App.mapObj.map).collapseTree().expandSelected();

    return {layerGroups, layerCtlTree, layerMasterGroup};
}


function removeMap(mapObj) {
    mapObj.lControl = null;
    mapObj.ctlTree = null;
    mapObj.layerGroups = null;
    mapObj.myFeatureGroup = null;
    mapObj.searchControl = null;
    mapObj.chloropleth = null;
    mapObj.choloroplethInfo = null;
    mapObj.legend = null;
    siteMarker = null;

    if (mapObj.map && mapObj.map.remove) {
        mapObj.map.off();
        mapObj.map.remove();
        mapObj.map = null;
    }

    mapObj = {
        ...mapObj,
        ...{
            id: 'mapContainer',
            lControl: null,
            ctlTree: null,
            layerGroups: {},
            myFeatureGroup: [],
            searchControl: null,
            chloropleth: null,
            choloroplethInfo: {},
            legend: null
        }
    };
}

let lastClickTimout = null;
let fn = null;

function colorCell(layer, color = '#43ef04', timeout = 8000, errorFunc = null, idColumn = 'Cell Name') {
    try {
        if (layer.feature?.properties[idColumn]) {
            layer._origFillColor = layer.options.fillColor;
            layer.setStyle({fillColor: color, fillOpacity: 0.9});

            if (fn && lastClickTimout) {
                fn();
                clearTimeout(lastClickTimout);
                fn = null;
                lastClickTimout = null;
            }

            fn = function () {
                layer.setStyle({fillColor: layer._origFillColor});
            };
            lastClickTimout = setTimeout(function () {
                // layer.setStyle({ color: '#000', weight: 1 });
                fn();
            }, timeout);

        }
    } catch (err) {
        console.log(`%c ${err}`, 'color:red;border:1px solid dodgerblue');
        errorFunc && errorFunc(err);
    }
}


function addSearch(mapObj) {
    if (mapObj.searchControl) {
        mapObj.searchControl.remove();
    }
    mapObj.myFeatureGroup = null;
    let myFeatureGroup = [];
    for (const [key, value] of Object.entries(mapObj.layerGroups)) {
        myFeatureGroup.push(value);
    }
    mapObj.searchControl = new L.Control.Search({
        layer: L.featureGroup(myFeatureGroup),
        position: 'topleft',
        propertyName: 'Cell Name',
        textPlaceholder: 'Search by Cell Name',
        hideMarkerOnCollapse: true,
        zoom: 12,
    });
    mapObj.map.addControl(mapObj.searchControl);
    mapObj.myFeatureGroup = myFeatureGroup;
}


function addSizeSelector({map, sectorSize, refreshFunc}) {
    let dropDown = L.control({position: 'topright'});
    dropDown.onAdd = function () {
        const sizes = ['xs', 's', 'm', 'l'];
        let div = L.DomUtil.create('div', 'size-selector');
        let options = '';
        sizes.forEach(size => {
            if (sectorSize === size) {
                options += `<option value="${size}" selected>${size}</option>`;
                return;
            }
            options += `<option value="${size}">${size}</option>`;
        });
        div.innerHTML = `
            <div class="q-pa-xs bg-purple-8 text-white" style="font-size: 1rem">Sector <br/> Size</div>
            <select name="size" id="sectorSize" style="width:100%;">
            ${options}
            </select>`;
        return div;
    };
    dropDown.addTo(map);

    // let testDiv = L.control({position: 'topright'});
    // testDiv.onAdd = function () {
    //     let div = L.DomUtil.create('div', 'test-div-class');
    //     div.innerHTML = `<div id="testDiv"></div>`;
    //     return div;
    // }
    // testDiv.addTo(map);

    document.getElementById('sectorSize').addEventListener('change', function () {
        refreshFunc(this.value);
    });
}


export {loadBasicMap, makeSiteLayers, removeMap, addSearch, addSizeSelector,};
