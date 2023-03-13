import {defineStore} from "pinia";
import {apiNode} from "@/plugins/http.js";
import chroma from "chroma-js";
import {getScaleLegendChroma2} from "@/utils/myFunctions.js";
import {colorMaps, colorMapsKeys} from "@/utils/colorMaps.js";
import {useStorage} from '@vueuse/core';
import {useMapStore} from "@/store/mapStore.js";

export const useCosmeticStore = defineStore("cosmetic", {
    state: () => ({
        colorMap: useStorage('colorMap', 'Yellow to Red'),
        colorMapList: [
            'Yellow to Red',
            'Blue to Red',
            ...colorMapsKeys
        ],
        reverseColorMap: useStorage('reverseColorMap', false),
        legendLimits: [],
        numberOfClasses: 10,
        availableLegendTypes: [
            {
                label: "Custom",
                value: "custom"
            },
            {
                label: "Presets",
                value: "presets"
            }
        ],
        selectedLegendType: 'custom',

        customLegend: useStorage('customLegend', [
            '#ff0000',
            '#faee10',
            '#06c506'
        ]),
        customRanges: useStorage('customRanges', [
            0,
            0.6,
            0.7,
            1
        ]),
    }),
    getters: {
        colorMapMapping: (state) => {
            const cMap = {
                'Yellow to Red': ['yellow', 'red'],
                'Blue to Red': ['blue', 'yellow', 'red'],
                ...colorMaps
            };
            if (!state.reverseColorMap) {
                return cMap;
            }
            let result = {};
            Object.keys(cMap).forEach((key) => {
                result[key] = [...cMap[key]].reverse();
            });
            return result;
        },
        getColorMap: (state) => {
            return state.colorMapMapping[state.colorMap];
        },
        getColorScaleByMethod: (state) => (method = 'q', numberOfRanges = state.numberOfClasses) => {
            const limits = chroma.limits(state.getMinMax, method, numberOfRanges);
            state.legendLimits = limits;
            return chroma.scale(state.getColorMap).domain(limits);
        },
        // chroma.scale(['yellow', 'lightgreen', '008ae5'])
        //     .domain([0,0.25,1]);
        getColorScaleWithCustomFunc: ({customColors, customRanges}) => {
            return chroma.scale(customColors).classes(customRanges);
        },
        getLegend: (state) => {
            const scale = state.getColorScaleByMethod();
            return getScaleLegendChroma2(scale, state.legendLimits, state.raster100).outerHTML;
        },
        getMinMax: (state) => {
            return [0, 1];
        },
        getNumberOfClasses: ({customRanges}) => {
            return customRanges.length - 1;
        }
    },
    actions: {
        async getCellCentroid(cellName) {
            const mapStore = useMapStore();
            const {sectorSize} = mapStore;
            const centroidUrl = `/cellCentroid?cellSize=${sectorSize}&cellName=${cellName}`;
            const jsonData = (await apiNode.get(centroidUrl)).data;
            return jsonData.data;
        },
        getRandomColors(numOfColors = 10) {
            return [...Array(numOfColors)].map(() => chroma.random().hex());
        }
    },
});
