<template>
    <div id="viewport">
        <div class="layout-content">
            <transition :name="transitionName">
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </transition>
        </div>
        <router-view name="tabbar" class="layout-tabbar"></router-view>
    </div>
</template>
<style lang="less" rel="stylesheet/less">
    #viewport {
        border-top: 1px solid transparent;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .layout-content {
        height: 100%;
        overflow: hidden;
        position: relative;
        flex: 1;
        width: 100%;
        background: #fff;
    }
    .layout-tabbar + .layout-content {
        bottom: 55px;
    }
    .layout-tabbar {
        /*z-index: 4 !important;*/
    }
    .fade-enter-active {
        position: absolute;
        top: 0;
        bottom: 0 !important;
        z-index: 2;
        width: 100%;
        animation: fadeIn .15s;
    }
    .fade-leave-active {
        position: absolute;
        top: 0;
        bottom: 0 !important;
        z-index: 2;
        width: 100%;
        animation: fadeOut .15s;
    }
</style>
<script>
    export default {
        name: 'app',
        data() {
            return {
                transitionName: 'fade'
            };
        },
        methods: {
        },
        watch: {
            $route(to, from) {
            }
        }
    }
</script>
