/**
 * @file Vue-Router Config
 * @author lifayu(fyli@hillinsight.com)
 * @since 16/03/2017
 */
import VueRouter from 'vue-router';

// import TabBar from './common/tabbar.vue';

const router = new VueRouter({
    mode: 'history',
    // base: '/h5',
    routes: [{
        path: '/login',
        component: resolve => require.ensure([], () => resolve(require('./site/login.vue')), 'site/login'),
        meta: {
            title: '登录'
        }
    }, {
    path: '*',
        component: {
        template: '<p style="text-align: center; font-size: 20px; color: #678;">404 Page Not Found</p>'
    }
}]
});
router.beforeEach(function (to, from, next) {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    else {
        document.title = '在线学习平台';
    }
    next();
});
router.afterEach(route => {
});

export default router;
