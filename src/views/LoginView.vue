<template>
    <div style=" width: 26vw; box-shadow: 4px 4px 7px 0px var(--color-border-hover);justify-content: center;align-items:
        center;display: flex;height: 10vh;">
        <a-input-password v-model:value="password" placeholder="input password" size="large" style="width: 20vw;margin:5px;"
            @keypress="handleKeyPress" />
        <a-button @click="login()" type="primary" size="large">Login</a-button>
    </div>
</template>

<script>
import store from '../stores/store';
import {
    generateUUID
} from '../stores/common.js'
import {
    inject,
    reactive,
    ref
} from 'vue'
export default {
    components: {},
    data() {
        return {
            axios: inject('$axios'),
            password: ''
        }
    },
    computed: {},
    mounted() { },
    watch: {},
    methods: {
        async handleKeyPress(e) {
            if (e.keyCode === 10 || e.keyCode === 13) {
                await this.login()
            }
        },
        async login() {
            if (!this.password.length) {
                this.$message.error('请输入密码！')
                return
            }
            let result = await store.dispatch('login', {
                id: generateUUID(),
                password: this.password
            })
            if (result.status || result.error)
                this.$message.error(result.data)
            else {
                this.$message.success(result.data)
                this.$router.push('/chat');
            }
        }
    },
}
</script>

<style scoped></style>