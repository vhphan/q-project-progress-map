import {createRouter, createWebHistory} from 'vue-router';

import Page1 from "@/pages/Page1.vue";
import {basePath} from "@/settings/constants";
import About from "@/pages/About.vue";

const routes = [
    {
        path: "/:catchAll(.*)",
        redirect: {name: 'Page1'},
        name: 'Others',
    },
    {
        path: basePath + 'page1',
        name: 'Page1',
        component: Page1,
        meta: {label: 'Home'}
    },{
        path: basePath + 'about',
        name: 'About',
        component: About,
        meta: {label: 'About'}
    },
    // {
    //     path: basePath + 'page2',
    //     name: 'Page2',
    //     component: Page2,
    // },
    // {
    //     path: basePath + 'page3',
    //     name: 'Page3',
    //     component: Page3,
    // },


];
const router = createRouter({
    base: basePath,
    history: createWebHistory(),
    mode: 'history',
    routes,
});


export default router;