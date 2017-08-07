
import {Toast, Indicator} from 'mint-ui';
// 错误码
export const ERROR_CODE = {
    ERROR_UNKNOWN: 1,
    ERROR_NET_NOT_AVAILABLE: 2,
    ERROR_XHR_ABORTED: 3,
    ERROR_NOT_LOGINED: 20005,
    // 没有功能权限
    ERROR_NO_AUTH: 40001,
    // 客户级别不够
    ERROR_NO_LEVEL: 40002
};

// ajax处理钩子
export const hooks = {
    handleRequestOptions(options) {
        return options;
    }
};

const exports = {};

exports.router = null;

/**
 * 请求管理器
 */
const ajaxManager = new (function () {
    this.queue = [];
    // 存储xhr
    this.push = function (xhr) {
        this.queue.push(xhr);
    };
    // 取消未完成的请求
    this.clear = function () {
        let xhr = null;
        while(xhr = this.queue.shift()) {
            if (xhr.status !== 200) {
                xhr.aborted = true;
                xhr.abort();
            }
        }
    };
})();

exports.setRouter = function (router) {
    if (exports.router) return;
    exports.router = router;
    router.beforeEach(function (to, from, next) {
        ajaxManager.clear();
        Indicator.open({
            spinnerType: 'triple-bounce'
        });
        next();
    });
    router.afterEach(route => {
        setTimeout(() => {
            if ($.active === 0) {
                Indicator.close();
            }
        }, 200);
    });
};

// 通过配置option： global: false实现局部加载，不展示loading
$(document).on('ajaxStart', function () {
    Indicator.open({
        // text: '加载中...',
        spinnerType: 'triple-bounce'
    });
});
$(document).on('ajaxStop', function () {
    Indicator.close();
});
// 通过存储xhr，结合router做请求管理
$(document).on('ajaxSend', function (e, xhr) {
    ajaxManager.push(xhr);
});

function request(url, options) {

    // 支持restful
    options.url = url.replace(/:([^\/]+)/g, function (a, b) {
        let param = options.data[b];
        delete options.data[b];
        return param;
    });

    options = hooks.handleRequestOptions(options);

    // options.contentType = 'application/json; charset=utf-8';
    // options.data = JSON.stringify(options.data);

    let deferred = $.Deferred();
    $.ajax(options).then(function (json) {
        if (!json) {
            deferred.reject('服务器未返回任何数据');
        }
        else if (typeof json.success === 'undefined') {
            deferred.resolve(json);
            return json;
        }
        else if (json.success) {
            let data = json.data || json.result || json.page;
            deferred.resolve(data);
            return data;
        }
        else {
            if (json.message && json.message.redirect) {
                deferred.reject({
                    code: ERROR_CODE.ERROR_NOT_LOGINED,
                    message: json.message
                });
            }
            else {
                deferred.reject({
                    code: json.code || ERROR_CODE.ERROR_UNKNOWN,
                    message: json.message
                });
            }
        }

    }, function (xhr) {
        let status = xhr.status;
        let error = '未知错误';
        let code = ERROR_CODE.ERROR_UNKNOWN;
        if (status === 0) {
            error = '网络请求被拒绝，请检查网络连接';
        }
        else if (status === 401) {
            error = '用户未登录';
            code = ERROR_CODE.ERROR_NOT_LOGINED;
        }
        else if (status < 200 || (status >= 300 && status !== 304)) { // 服务器没有正常返回
            error = '发送网络请求失败';
        }
        else {
            error = '数据解析失败';
        }
        if (xhr.aborted) {
            code = ERROR_CODE.ERROR_XHR_ABORTED;
            error = '请求被取消';
        }
        deferred.reject({
            code: code,
            message: error
        });
    });
    deferred.fail(function (result) {
        if (result.code === ERROR_CODE.ERROR_NOT_LOGINED) {
            if (exports.router != null) {
                exports.router.replace({
                    path: '/login',
                    query: {
                        url: exports.router.currentRoute.fullPath
                    }
                });
            }
            else {
                Toast(result.message || '用户未登录');
            }
            /*
            if (typeof result.message === 'string') {
                Toast('用户未登录');
            }
            else if (exports.router != null) {
                let url = '/#/login?url=' + exports.router.currentRoute.fullPath;
                // let url = window.location.origin + '/#/login?url=' + exports.router.currentRoute.fullPath;
                window.location.replace(result.message.redirect + '?url=' + encodeURIComponent(url));
                // exports.router.replace({
                //     path: result.message.redirect,
                //     query: {
                //         url: '/login?url=' + exports.router.currentRoute.fullPath
                //     }
                // });
            }
            */
        }
        else if (result.code !== ERROR_CODE.ERROR_XHR_ABORTED) {
            if (typeof result.message === 'string') {
                Toast(result.message);
            }
        }
    });
    return deferred.promise();
}

function createRequest(config, baseUrl = '') {
    let api = {};

    Object.keys(config).forEach((key) => {
        let url = baseUrl + config[key];
        let req = function (data, options) {
            options = $.extend({
                type: 'POST',
                data: data,
                dataType: 'json'
            }, options || {});
            return request(url, options);
        };
        req.url = url;
        req.get = function (data, options) {
            options = $.extend({
                type: 'GET',
                data: data,
                dataType: 'json'
            }, options || {});
            return request(url, options);
        };
        api[key] = req;
        // 重置config内容为改造后的内容
        config[key] = req;
    });
    return api;
}

export let _Vue;
// export default exports;
/**
 * Ajax support for Vue
 * @param Vue
 * @param {Vue-router} router
 * @param {Object} apis
 * @param {string} baseUrl
 * @return {*}
 */
export default function install(Vue, router, apis = {}, baseUrl = '') {
    if (install.installed) {
        return;
    }
    install.installed = true;

    _Vue = Vue;

    exports.setRouter(router);

    let api = createRequest(apis, baseUrl);
    Object.defineProperty(Vue.prototype, '$api', {
        get() {
            return api;
        }
    });
};