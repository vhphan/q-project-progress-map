import {apiNode} from "@/plugins/http.js";
import {
    Loading,
    QSpinnerGears
} from 'quasar';


// export const apiGetOverallCountAndPercentageTrend = async (params = {}) => {
//     const response = (await apiNode.get(`/getOverallCountAndPercentageTrend`, {params})).data;
//     return response.data;
// }

export const apiUploadExcelData = async (postData) => {
    const response = (await apiNode.post(
        `/uploadExcelData`,
        postData
    ));
    return response.data;
};

export const apiGetAvailableData = async (params = {}) => {
    const response = (await apiNode.get(`/getAvailableData`, {params})).data;
    return response.data;
};

export const apiGetProgressData = async (params = {}) => {
    Loading.show({
            spinner: QSpinnerGears,
            message: 'Fetching data...',
        }
    );
    try {
        const response = (await apiNode.get(`/getProgressData`, {params})).data;
        return response.data;
    } catch (e) {
        console.log(e);
        return [];
    } finally {
        Loading.hide();
    }
};
