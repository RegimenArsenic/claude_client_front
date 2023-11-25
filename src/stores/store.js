import { createStore } from 'vuex';
import axios from "axios"
import md5 from 'js-md5';
const store = createStore({
    state: {
        user: null // 用户信息
    },
    mutations: {
        setUser (state, user) {
            localStorage.setItem('frontUserInfo', JSON.stringify(user))
            state.user = user;
        }
    },
    actions: {
        async login ({ commit }, user) {
            // 在这里进行登录验证，验证通过后将用户信息保存到 state 中
            user.password = md5(user.password)
            let resut;
            await axios({
                url: `/api/login`,
                method: "POST",
                timeout: 100000,
                data: user,
            }).then((response) => {
                resut = response.data
                commit('setUser', response.data);
            }).catch((error) => {
                resut = error.response
                console.log(error)
            })
            return resut
        },
        setLocalUser ({ commit },user) { 
            commit('setUser', user);
        },
        logout ({ commit }) {
            // 在这里执行登出操作，清除用户信息
            commit('setUser', null);
        }
    }
});

export default store;