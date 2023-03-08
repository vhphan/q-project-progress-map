import {defineStore} from 'pinia'
import {useStorage} from "@vueuse/core";
import {techLayers} from "@/settings/constants.js";

export const useMapStore = defineStore('map', {
    state: () => {
        return {
            cellToZoomTo: null,
            clickedCellInfo: {},
            clickedData: null,
            layerOpacity: 0.2,
            baseMapOpacity: 1,
            coverageMapOpacity: 1,
            popUpInfo: null,
            chloroplethData: null,
            rankingData: null,
            pointsData: null,
            region: 'CENTRAL',
            centers: {
                'CENTRAL': [3.153223, 101.7002],
                'EASTERN': [4.9364, 102.1591],
                'SABAH': [5.400, 116.389],
                'SARAWAK': [1.5869222, 110.2034863],
                'NORTHERN': [5.4164, 100.3327],
                'SOUTHERN': [1.4854, 103.7618],
            },
            lastCenter: useStorage('lastCenter', [3.153223, 101.7002]),
            lastZoom: useStorage('lastZoom', null),
            defaultZoom: 8,
            regions: ['CENTRAL', 'EASTERN', 'SABAH', 'SARAWAK', 'SOUTHERN'],
            techLayers: techLayers,
            techLayersAdded: Object.fromEntries(techLayers.map((techLayer) => [techLayer, false])),
            techLayersColors: [
                '#981ceb',
                '#7cc992',
                '#00ff00',
                '#ff0000',
                '#ffa600',
                '#5f05fa',
                '#5f5fe5',
                '#00d2d2',
            ],
            originalTechLayersColors: [
                '#981ceb',
                '#7cc992',
                '#00ff00',
                '#ff0000',
                '#ffa600',
                '#5f05fa',
                '#5f5fe5',
                '#00d2d2',
            ],
            mapSettings: {},
            leftDrawerOpen: false,
            grayOutOffAir: true,
            siteNameOnHover: true,
            sectorSize: 'm',
            hoveredSiteInfo: {},
            addCoverageMap: false,
            clickedCellInfoColumns: [
                {
                    name: 'column',
                    label: 'Column',
                    field: 'key',
                    // style: 'max-width: 100px; word-wrap: break-word;',
                    align: 'left',
                    // headerStyle: 'max-width: 100px;',
                    classes: 'bg-grey-2',
                },
                {
                    name: 'value',
                    label: 'Value',
                    field: 'value'
                },
            ]
        }
    },
    getters: {
        clickedCellInfoRows: (state) => {
            return Object.entries(state.clickedCellInfo).map(([key, value]) => {
                return {
                    key: key,
                    value: value
                }
            })
        },
    }
})