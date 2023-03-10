import {useStorage} from "@vueuse/core";
import {defineStore} from "pinia";
import {apiGetProgressData} from "@/api/apiCalls.js";

export const useProgressDataStore = defineStore({
    id: 'progressDataStore',
    state: () => ({
        progressData: useStorage('progressData', {}),
        availableKpi: {
            cluster: [
                "OA & OB",
            ],
            district: [
                "Overall progress",
                "Overall % Co-Loc",
                "% Deployment (CME & above)"
            ],
        },
        selectedKpi: useStorage('selectedKpi', {
            cluster: "OA & OB",
            district: "Overall progress",
        }),
        selectedTypeOfKpi: useStorage('selectedTypeOfKpi', 'district'),
        availableTypesOfKpi: [
            {label: 'District', value: 'district'},
            {label: 'Cluster', value: 'cluster'},
        ],

    }),
    getters: {
      dataLoaded: (state) => {
            return state.progressData && Object.keys(state.progressData).length > 0;
      },
      metaDataLoaded: (state) => {
          return state.progressData && state.progressData.metaData;
      },
      dataFileNameLoaded: (state) => {
            return state.progressData && state.progressData.metaData && state.progressData.metaData.fileName.toLowerCase().replace(/ /g, '_').split('.')[0];
      }
    },
    actions: {
        async queryProgressData(selectedDataFile) {
            this.progressData = await apiGetProgressData({selectedDataFile});
        }
    }
});