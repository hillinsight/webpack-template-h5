/**!
 * @file 入口文件
 * @author lifayu(fyli@hillinsight.com)
 * @since 17/03/2017
 */

import 'babel-polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';
import MintUI from 'mint-ui';
import ajax from '@common/ajax';
import router from './router';
import {api} from './config';
import '@common/css/main.less';

import HUI from '@ui/index';

import App from '@/App.vue';

// ########## DEBUG ###########
Vue.config.debug = process.env.NODE_ENV !== 'production';
Vue.config.devtools = process.env.NODE_ENV !== 'production';
Vue.config.productionTip = process.env.NODE_ENV !== 'production';
// ########## DEBUG ###########

Vue.use(VueRouter);
Vue.use(MintUI);
Vue.use(HUI);
Vue.use(ajax, router, api);

new Vue({
    el: '#viewport',
    name: 'AppName',
    router,
    template: '<App/>',
    components: {
        App
    }
});

