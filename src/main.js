import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import axios from "axios";
import store from "./stores/store";
import { message } from "ant-design-vue";

message.config({
    duration: 2, // 持续时间
    maxCount: 4, // 最大显示数, 超过限制时，最早的消息会被自动关闭
    prefixCls: "global-message",
});
let instance = axios.create({
    timeout: 1000,
    withCredentials: true,
    headers: { "Content-Type": "application/json; charset=utf-8" },
});
// 路由前置守卫
router.beforeEach((to, from, next) => {
    // 需要验证且用户未登录，跳转到登录页
    if (to.meta.requiresAuth) {
        if (!store.state.user) {
            let localUser = localStorage.getItem("frontUserInfo");
            if (localUser) {
                localUser = JSON.parse(localUser);
                store.dispatch("setLocalUser", localUser);
                instance.defaults.headers["Authorization"] = "Bearer " + store.state.user.token;
                next(); // 继续路由跳转
            } else next("/login");
        } else if (store.state.user) {
            instance.defaults.headers["Authorization"] = "Bearer " + store.state.user.token;
            next(); // 继续路由跳转
        }
    } else {
        next(); // 继续路由跳转
    }
});
const app = createApp(App);
app.provide("$axios", instance);
app.use(createPinia());
app.use(router);
app.use(Antd);
app.mount("#app");
