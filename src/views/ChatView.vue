<template>
    <main style="width: calc(100% + 30px);">
        <a-float-button :style="{ top: '15px', right: '15px' }" type="primary" @click="drawerShow = !drawerShow">
            <template #icon>
                <SettingFilled style="color:rgba(255, 255, 255, 0.8)" />
            </template>
        </a-float-button>
        <a-drawer v-model:open="drawerShow" style="background: var(--color-background);color:var(--color-text)"
            :closable="false" placement="right">
            <a-divider style="border-color: #7cb305;color:var(--color-text)">设置</a-divider>
            <div style="margin-bottom: 16px">
                <span style="margin-right: 16px">Bot回复方式：</span>
                <a-segmented v-model:value="config.replyMethod" :options="replyMethodOptios">
                    <template #label="{ value: val, payload = {} }">
                        <div style="padding: 4px 4px">
                            <template v-if="payload.icon">
                                <a-avatar :src="payload.src" :style="payload.style">
                                    <template #icon>
                                        <component :is="payload.icon" />
                                    </template>
                                    {{ payload.content }}
                                </a-avatar>
                            </template>
                            <template v-else>
                                <a-avatar :src="payload.src" :style="payload.style">
                                    {{ payload.content }}
                                </a-avatar>
                            </template>
                            <div>{{ payload.title }}</div>
                        </div>
                    </template>
                </a-segmented>
            </div>
            <div style="margin-bottom: 16px">
                <span style="margin-right: 16px">背景颜色：</span>
                <a-input type="color" v-model:value="config.backgroundColor" />
            </div>
        </a-drawer>
        <TransitionGroup name="container" tag="div" class="warp" id="warp">
            <GPTCard v-for="item in dataSource" v-bind="item" v-bind:key="item.id" @resend="resendMessage" />
        </TransitionGroup>
    </main>
    <a-input-group compact style="margin-top: 10px;">
        <a-textarea class="input-textarea" v-model:value="currentMessage" placeholder="请输入" :rows="4" :allowClear="true"
            :autoSize="{ minRows: 4, maxRows: 4 }" style="overflow: hidden;" @keypress="handleKeyPress" />
        <a-button type="primary" style="height: 98px;" @click="sendMessage">Ctrl + Enter</a-button>
    </a-input-group>
</template>
<script>
import GPTCard from '../components/GPTCard.vue'
import {
    generateUUID
} from '../stores/common.js'
import {
    SettingFilled,
    DashOutlined,
    UnorderedListOutlined
} from '@ant-design/icons-vue';
import {
    inject,
    reactive,
    ref
} from 'vue'
export default {
    emits: ['update'],
    components: {
        GPTCard,
        SettingFilled,
        DashOutlined,
        UnorderedListOutlined
    },
    props: {
        chatDataSource: Array,
        chatId: String,
    },
    data() {
        return {
            dataSource: ref(this.chatDataSource),
            replyMethodOptios: ref([{
                value: 'all',
                payload: {
                    title: '全部生成后回复',
                    style: {
                        backgroundColor: 'rgba(0, 122, 204)'
                    },
                    icon: UnorderedListOutlined,
                },
            },
            {
                value: 'immediate',
                payload: {
                    icon: DashOutlined,
                    title: '即时回复',
                    style: {
                        backgroundColor: 'rgba(0, 122, 204)'
                    },
                },
            },
            ]),
            config: ref({
                replyMethod: 'immediate',
                backgroundColor: ''
            }),
            axios: inject('$axios'),
            drawerShow: false,
            currentMessage: ref('')
        }
    },
    computed: {},
    mounted() {
        let sessionConfig = localStorage.getItem('gptFrontConfig')
        if (sessionConfig) {
            this.config = JSON.parse(sessionConfig)
            if (this.config.color) {
                this.setBackgroundColor(config.backgroundColor)
            }
        }
    },
    watch: {
        config: {
            handler(curVal, oldVal) {
                this.setBackgroundColor(curVal.backgroundColor)
                localStorage.setItem('gptFrontConfig', JSON.stringify(curVal))
            },
            deep: true
        },
        chatDataSource: {
            handler(curVal, oldVal) {
                this.dataSource = ref(this.chatDataSource)
            },
            deep: true
        },
        dataSource: {
            handler(curVal, oldVal) {
                this.$emit("update", curVal)
            },
            deep: true
        },
        currentMessage: function (curVal, oldVal) {
            if (curVal.length) {
                let currentItem = this.dataSource.find(x => x.status == 'current')
                if (currentItem) {
                    currentItem.message = curVal
                } else {
                    this.dataSource.push({
                        id: generateUUID(),
                        status: 'current',
                        type: "message from",
                        message: curVal,
                        isFinish: false
                    })
                }
            } else {
                let index = this.dataSource.findIndex(x => x.status == 'current')
                if (index != -1) {
                    this.dataSource.splice(index, 1)
                }
            }
            this.handleScrollBottom()
        },
    },
    methods: {
        setBackgroundColor(backgroundColor) {
            const oppositeColor = (a, ilighten, transparent = 'FF') => {
                a = a.replace('#', '');
                var max16 = Math.floor(15 + (ilighten || 0));
                if (max16 < 0 || max16 > 15) max16 = 15;
                var c16, c10, b = [];
                for (var i = 0; i < a.length; i++) {
                    c16 = parseInt(a.charAt(i), 16);
                    c10 = parseInt(max16 - c16, 10);
                    if (c10 < 0) c10 = Math.abs(c10);
                    b.push(c10.toString(16));
                }
                return `#${b.join('')}${transparent}`;
            }
            let textColor = oppositeColor(backgroundColor, 0)
            document.documentElement.style.setProperty('--color-background', backgroundColor);
            document.documentElement.style.setProperty('--color-text', textColor);
            document.documentElement.style.setProperty('--color-border-soft', oppositeColor(backgroundColor, -1, '26'));
            document.documentElement.style.setProperty('--color-border-hover', oppositeColor(backgroundColor, -1, '59'));
            document.documentElement.style.setProperty('--color-background-soft', oppositeColor(textColor, -1));
        },
        handleKeyPress(e) {
            if (e.ctrlKey && (e.keyCode === 10 || e.keyCode === 13)) {
                this.sendMessage()
            }
        },
        sendMessage(event, resend) {
            let _this = this
            const requestApi = (question, answer) => {
                if (_this.config.replyMethod == 'immediate')
                    updateAnswer(question, answer)
                else
                    _this.axios({
                        url: `/api/send`,
                        method: "POST",
                        timeout: 180000,
                        data: JSON.stringify(question),
                    }).then((response) => {
                        answer.message = response.data.result
                        answerFinished(answer)
                    }).catch((error) => {
                        answer.message = "网络故障，对话未送达"
                        console.log(error)
                        answerFinished(answer)
                        answer.status = 'error'
                    })
            }
            const newMessage = (currentItem) => {
                let answer = reactive({
                    id: generateUUID(),
                    status: 'pending',
                    type: "message to",
                    message: '●●●',
                    isFinish: false
                })
                _this.dataSource.push(answer)
                var question = {
                    conversation_id: _this.chatId,
                    prompt: currentItem.message
                }
                requestApi(question, answer)
            }
            const answerFinished = (answer) => {
                answer.recordTime = (new Date()).toLocaleString()
                answer.isFinish = true
                answer.status = 'finish'
                _this.handleScrollBottom()
            }
            const updateAnswer = function (question, answer) {
                const eventSource = new EventSource('/api/stream');
                _this.axios({
                    url: `/api/stream`,
                    method: "POST",
                    timeout: 180000,
                    data: JSON.stringify(question),
                }).catch(e => {
                    handleError(e)
                })
                // 处理服务器发送的消息
                eventSource.addEventListener('update', event => {
                    resetTimer();
                    answer.message += event.data
                    _this.handleScrollBottom()
                });
                // 处理服务器发送的结束消息
                eventSource.addEventListener('finish', event => {
                    answerFinished(answer)
                    _this.handleScrollBottom()
                    eventSource.close();
                });
                // 处理连接错误
                const handleError = (error) => {
                    if (eventSource.readyState == EventSource.CLOSED) {
                        answer.message += `\n出现连接错误！Message:${error}\n`
                        answerFinished(answer)
                        answer.status = 'error'
                        eventSource.close();
                        _this.handleScrollBottom()
                    }
                }
                eventSource.onerror = handleError
                let timerId;
                // 设置计时器，如果在规定的时间内没有接收到消息，则手动处理
                function setTimer() {
                    timerId = setTimeout(() => {
                        if (eventSource.readyState != EventSource.CLOSED) {
                            handleError("连接无响应！")
                            handle_disconnect();
                        }
                    }, 120000);
                }

                function resetTimer() {
                    clearTimeout(timerId);
                    setTimer();
                }
                setTimer();

                function handle_disconnect() {
                    if (!answer.isFinish)
                        answerFinished(answer)
                    _this.handleScrollBottom()
                }
            };
            const finishCurrentMessage = () => {
                let currentItem = _this.dataSource.find(x => x.status == 'current')
                currentItem.recordTime = (new Date()).toLocaleString()
                currentItem.isFinish = true
                currentItem.status = 'finish'
                _this.currentMessage = ref('')
                return currentItem
            }
            if (resend) {
                requestApi(resend.question, resend.answer)
                return
            }
            let item = finishCurrentMessage()
            newMessage(item)
        },
        handleScrollBottom() {
            var element = document.getElementById('warp');
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
            });
        },
        resendMessage(id) {
            let faildItemIndex = this.dataSource.findIndex(x => x.id == id)
            let faildItem = this.dataSource[faildItemIndex]
            let question = this.dataSource[faildItemIndex - 1]
            faildItem.message = '●●●'
            let resend = {
                question: {
                    id: this.chatId,
                    msg: question.message
                },
                answer: faildItem
            }
            this.sendMessage(null, resend)
            faildItem.isFinish = false
            faildItem.status = 'pending'
        },
    }
}
</script>

<style scoped>
.ant-input-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}

:global(.ant-input::-webkit-scrollbar-thumb) {
    border-radius: 10px;
    background: (0, 122, 204);
    box-shadow: inset 0 0 10px rgba(0, 122, 204);
}

:global(.ant-input::-webkit-scrollbar) {
    width: 5px;
    height: 80vh;
    background: transparent;
}

:global(.ant-input::-webkit-scrollbar-track) {
    border-radius: 10px;
    background: #ededed;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, .1);
}

span.input-textarea {
    width: calc(100% - 200px);
}

.warp {
    overflow-x: hidden;
    position: relative;
    padding-right: 15px;
    width: 98%;
    height: 80vh;
    max-height: 80vh;
    overflow-y: auto;
}

.warp::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #9e9e9e;
    box-shadow: inset 0 0 2px lawngreen;
}

.warp::-webkit-scrollbar {
    width: 5px;
    height: 80vh;
    background: transparent;
}

.warp::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    border-radius: 10px;
    background: #ededed;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, .1);
}

.ant-input-group>* {
    flex-grow: 1;
    height: auto;
}

.container-move,
.container-enter-active,
.container-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.container-enter-from,
.container-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translate(30px, 0);
}

.container-leave-active {
    position: absolute;
}
</style>