<script>
    import {
        RouterLink,
        RouterView
    } from 'vue-router'
    import {
        inject,
        reactive,
        ref
    } from 'vue'
    export default {
        components: {},
        data() {
            return {}
        },
        computed: {},
        mounted() {},
        watch: {},
        methods: {},
    }
</script>

<template>
    <div class="container">
        <RouterView />
    </div>
</template>

<style scoped>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 95vw;
    }
</style>