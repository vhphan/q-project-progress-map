<template>
  <div class="bg-blue-1">
      <q-expansion-item
          expand-separator
          label="Upload Excel File"
          dense
      >
        <span>{{ selectedFile ?? (selectedFile?.name || '') }}</span>
        <q-input
            @update:model-value="updateFile"
            outlined
            type="file"
            hint="Excel Report"
            class="q-ma-md"
        />
        <q-btn
            :disable="!isDataValid"
            color="primary"
            label="Submit"
            @click="submit"
            glossy
            class="q-mx-md q-my-xs"
        />
      </q-expansion-item>

      <q-expansion-item
          expand-separator
          label="Load Data"
          dense
      >
        <span class="q-mx-md">Data Loaded::{{dataFileNameLoaded}}</span>
        <span v-if="!dataFileNameLoaded" class="q-mx-md text-negative text-bold">No Data Loaded!!</span>
        <q-select :options="availableData" v-model="selectedDataFile" outlined hint="Select Data" class="q-ma-md"


        >
          <template v-slot:append>
            <q-btn round dense flat icon="refresh" @click="getAvailableData"  />
          </template>

        </q-select>
        <q-btn
            color="primary"
            glossy
            label="Load Data"
            @click="downloadData"
            class="q-mx-md q-my-xs"
        />
      </q-expansion-item>
  </div>
</template>
<script>
import {computed, onMounted, ref, watch} from "vue";
import readXlsxFile from "read-excel-file";
import {triggerNegative, triggerPositive} from "@/utils/notifications.js";
import {colorTrace} from "@/utils/myFunctions.js";
import {apiGetAvailableData, apiUploadExcelData} from "@/api/apiCalls.js";
import {useProgressDataStore} from "@/store/progressDataStore.js";
import {
  expectedHeadersCluster,
  expectedHeadersDistrict,
  finalHeadersCluster,
  finalHeadersDistrict
} from "@/settings/constants.js";
import {storeToRefs} from "pinia";


export default {
  name: 'excel-file-selector',
  setup() {
    const selectedFile = ref(null);

    function verifyHeaders(headers, expectedHeaders) {
      if (headers.length !== expectedHeaders.length) {
        return false;
      }
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const expectedHeader = expectedHeaders[i];
        if (header.length !== expectedHeader.length) {
          return false;
        }
        for (let j = 0; j < header.length; j++) {
          if (header[j] !== expectedHeader[j]) {
            return false;
          }
        }
      }
      return true;
    }

    function createFinalData(headers, rows) {
      const finalData = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const finalRow = {};
        for (let j = 0; j < row.length; j++) {
          finalRow[headers[j]] = row[j];
        }
        finalData.push(finalRow);
      }
      return finalData;
    }

    const finalDataDistrict = ref([]);
    const finalDataCluster = ref([]);
    const isDataValid = computed(() => {
      return selectedFile.value !== null && finalDataDistrict.value.length > 0 && finalDataCluster.value.length > 0;
    });


    watch(selectedFile, (excelFile) => {
      readXlsxFile(excelFile, {sheet: 'District'}).then((rows) => {
        const headers = rows.slice(0, 2);
        console.log(headers);
        if (!verifyHeaders(headers, expectedHeadersDistrict)) {
          colorTrace("District headers are not as expected", 'red');
          triggerNegative({
            message: "District sheet headers are not as expected",
            caption: "Please check the excel file"
          });
          return;
        }
        finalDataDistrict.value = createFinalData(finalHeadersDistrict, rows.slice(2));
        triggerPositive({
          message: "Excel sheet District is valid",
        });
      });

      readXlsxFile(excelFile, {sheet: 'Cluster'}).then((rows) => {
        const headers = rows.slice(0, 1);
        if (!verifyHeaders(headers, expectedHeadersCluster)) {
          colorTrace("Cluster headers are not as expected", 'red');
          triggerNegative({
            message: "Cluster sheet headers are not as expected",
            caption: "Please check the excel file"
          });
          return;
        }
        finalDataCluster.value = createFinalData(finalHeadersCluster, rows.slice(1));
        triggerPositive({
          message: "Excel sheet Cluster is valid",
        });
      }).catch((error) => {
        console.log(error);
        triggerNegative({
          message: "Excel File is not valid",
          caption: "Please check the excel file"
        });
      });
    });

    const progressDataStore = useProgressDataStore();
    const progressData = storeToRefs(progressDataStore);
    const submit = () => {
      console.log("submit");
      const finalResult = {
        districtData: finalDataDistrict.value,
        clusterData: finalDataCluster.value,
        metaData: {
          fileName: selectedFile.value.name,
          fileLastModified: selectedFile.value.lastModified,
          fileLastModifiedDate: selectedFile.value.lastModifiedDate,
          fileSize: selectedFile.value.size,
          fileType: selectedFile.value.type,
        }
      };

      apiUploadExcelData(finalResult).then((response) => {
        if (response.success) {
          progressData.value = {
            file: finalResult.metaData.fileName.toLowerCase().replace(' ', '_').split('.xlsx')[0],
            data: finalResult
          };
        }

        triggerPositive({
          message: "Excel data uploaded successfully",
        });


      }).catch((error) => {
        console.log(error);
        triggerNegative({
          message: "Excel data upload failed",
        });
      });
    };

    const availableData = ref([]);

    async function getAvailableData() {
      availableData.value = await apiGetAvailableData();
      selectedDataFile.value = availableData.value.at(-1);
    }

    onMounted(async () => {
      await getAvailableData();
    });

    const updateFile = (file) => {
      selectedFile.value = file[0];
    };

    const {selectedDataFile} = storeToRefs(progressDataStore);

    const downloadData = () => {
      progressDataStore.queryProgressData();
    };

    const dataFileNameLoaded = computed(() => {
      return progressDataStore.dataFileNameLoaded;
    });

    return {
      selectedFile,
      finalDataDistrict,
      finalDataCluster,
      isDataValid,
      submit,
      updateFile,
      availableData,
      selectedDataFile,
      downloadData,
      dataFileNameLoaded,
      getAvailableData,
    };

  }
};
</script>
