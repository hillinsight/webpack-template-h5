<template>
    <div>
        <div>this is template body</div>
        <mt-button @click="login">button</mt-button>
    </div>
</template>
<style lang="less" rel="stylesheet/less" scoped>
</style>
<script>
    /**!
     * Copyright (c) 2017 hillinsight.com, Inc. All Rights Reserved
     *
     * @author lifayu(fyli@hillinsight.com)
     * @since 2017-08-07 11:35
     */
    export default {
        data() {
            return {
                msg: 'hello vue'
            }
        },
        methods: {
            login() {
                this.$api.login().then(_ => {
                    this.$toast('登录成功');
                });
            }
        }
    }
</script>
