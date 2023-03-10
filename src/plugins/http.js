import axios from 'axios';
import {debounce, Notify} from "quasar";
import {colorTrace, getCookie, redirectToLogin} from "@/utils/myFunctions";
import {triggerInfo, triggerNegative} from "@/utils/notifications.js";
import {authLoginUrl} from "@/settings/constants.js";

const devServer = import.meta.env.VITE_NODE_DEV_SERVER;
const prodServer = import.meta.env.VITE_NODE_PROD_SERVER;
const server = import.meta.env.PROD ? prodServer : devServer;
const BASE_URL_NODE = `${server}/node/dnb-project/v1`;
export const NODE_URL = `${server}/node/${operator}`;
import {operator} from "@/settings/constants";

const mainPortal = (operator) => {
    switch (operator) {
        case 'celcom':
            return 'https://cmeportal.eprojecttrackers.com';
        case 'dnb':
            return 'https://ndo-portal.eprojecttrackers.com';
        default:
            throw new Error('Unknown operator');
    }
};

const BASE_URL = import.meta.env.DEV ? mainPortal(operator) : `https://${window.location.hostname}`;

function createInstance(baseURL) {
    let headers = {
        'Content-Type': 'application/json',
    };
    console.log('isProduction', import.meta.env.PROD);

    if (import.meta.env.PROD) {
        headers = {...headers, Api: getCookie('API'), Username: `${getCookie('Name')}`};
    } else {
        headers = {
            ...headers,
            ...{
                Api: import.meta.env.VITE_API_KEY,
                Username: import.meta.env.VITE_USER_NAME,
            },
        };
    }
    return axios.create({
        baseURL,
        headers,
    });
}

const addInterceptor = (instance) => {
    instance.interceptors.request.use((config) => {
        // config.params = config.params ? {...config.params, ...{version: import.meta.env.VITE_HTTP_VERSION}} : {version: import.meta.env.VITE_HTTP_VERSION};
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    instance.interceptors.response.use(function (response) {
        if (!response.data.success) {
            // triggerInfo(
            //     {message: 'Success indicator is false or missing.'}
            // );
            colorTrace(`Success indicator is false or missing. ${response.config.url}`, 'red');
        }
        if (response.data.message) {
            triggerInfo(
                {message: response.data.message}
            );
        }
        return response;
    }, function (error) {
        const errObj = (error.toJSON && error.toJSON()) || error;
        colorTrace('from axios.js', 'red');
        colorTrace(error, 'red');
        triggerNegative({
            message: errObj.message,
            position: 'center',
        });
        const {response} = error;
        if (!response) return Promise.reject(error);
        if (response.data && response.data.message) {
            triggerNegative({
                message: response.data.message,
            });
        }
        const errorMessage = response.data?.message || error.statusText;
        triggerNegative({
            message: errorMessage,

        });
        if ([401, 403].includes(response.status)) {
            debounce(() => redirectToLogin('You may be logged out!', authLoginUrl), 1000);
        }
        if (response.status !== 200) {
            triggerNegative({
                message: `Something went wrong. Status code ${response.status} ${response.statusText}`,
            });
        }
        return Promise.reject(error);
    });
    return instance;
};


const apiNode = addInterceptor(createInstance(BASE_URL_NODE));

export {apiNode, BASE_URL_NODE};

export const useApi = () => {
    const createApi = (loadingState) => addInterceptor(createInstance(BASE_URL), loadingState);
    const createApiNode = (loadingState) => addInterceptor(createInstance(BASE_URL_NODE), loadingState);
    return {createApi, createApiNode, BASE_URL_NODE, NODE_URL};
};