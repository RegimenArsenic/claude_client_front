<template>
    <a-tooltip placement="bottom">
        <template #title>
            <span>创建新聊天</span>
        </template>
        <a-float-button :style="{ top: '15px', left: '15px' }" @click="isModalShow = true">
            <template #icon>
                <PlusCircleOutlined />
            </template>
        </a-float-button>
    </a-tooltip>
    <div style="width: 96vw">
        <a-row>
            <a-col :span="4">
                <TransitionGroup name="container" tag="div" class="cardWarp" id="cardWarp">
                    <a-card v-for="item in dataSource" :title="item.title" :key="item.id" @click="changeConversation(item)"
                        class="card" :headStyle="{ color: 'var(--color-text)', 'border-color': 'var(--color-border-soft)' }"
                        :style="cardStyle(item)">
                        <template #extra>
                            <a-tooltip placement="bottom" v-if="dataSource.length > 1">
                                <template #title>
                                    <span>删除</span>
                                </template>
                                <CloseCircleOutlined @click.stop="removeConversation(item)"
                                    style="color: var(--color-text)" />
                            </a-tooltip>
                        </template>
                        <p>{{ item.content }}</p>
                    </a-card>
                </TransitionGroup>
            </a-col>
            <a-col :span="19" style="margin-left: 2vw">
                <ChatView :chatDataSource="currentChatView" :chatId="currentChatId" @update="updateChatDataSource" />
            </a-col>
        </a-row>
    </div>
    <a-modal v-model:open="isModalShow" :bodyStyle="modalStyle" title="选择Prompt" @ok="confirmRole" width="80vw">
        <div :style="modalStyle">
            <a-row>
                <a-col :span="5">
                    <TransitionGroup name="container" tag="div" class="cardWarp promptCard">
                        <a-card v-for="item in rolesData" :title="item.act" :key="item.act" @click="changeRole(item)"
                            class="card"
                            :headStyle="{ color: 'var(--color-text)', 'border-color': 'var(--color-border-soft)' }"
                            :style="cardStyle(item)">
                            <p>{{ item.prompt.length > 42 ? item.prompt.slice(0, 42) + "..." : item.prompt }}</p>
                        </a-card>
                    </TransitionGroup>
                </a-col>
                <a-col :span="18" style="margin-left: 20px;">
                    <a-input-search v-model:value="role" enter-button @search="onSearchRole" placeholder="角色名称" />
                    <a-textarea class="input-textarea" v-model:value="prompt" placeholder="角色Prompt" :rows="23"
                        :allowClear="true" :autoSize="{ minRows: 23, maxRows: 23 }"
                        style="overflow: hidden;margin-top: 15px;" />
                </a-col>
            </a-row>
        </div>
    </a-modal>
</template>
<script>
import ChatView from "./ChatView.vue";
import { generateUUID, getValue } from "../stores/common.js";
import { inject, reactive, ref } from "vue";
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";
export default {
    components: {
        ChatView,
        PlusCircleOutlined,
        CloseCircleOutlined,
    },
    data() {
        return {
            dataSource: [],
            roles: [],
            rolesData: [],
            role: '',
            isModalShow: false,
            prompt: '',
            axios: inject("$axios"),
            modalStyle: {
                background: 'var (--color-background)', color: 'var(--color-text)'
            },
            cardStyle(item) {
                let style = {
                    width: "292px",
                    height: "150px",
                    "margin-top": "10px",
                    background: "var(--color-background-soft)",
                    color: "var(--color-text)",
                    "border-color": item.isActive ? "rgba(0, 122, 204)" : "var(--color-border-soft)",
                    "border-radius": "8px",
                    "box-shadow": "4px 4px 7px 0px var(--color-border-hover)",
                };
                return style;
            },
        };
    },
    computed: {
        currentChatView() {
            return this.dataSource.find(x => x.isActive)?.chatDataSource;
        },
        currentChatId() {
            return this.dataSource.find(x => x.isActive)?.id;
        },
    },
    mounted() {
        this.axios({
            url: `/roles.json`,
            method: "GET",
        }).then(response => {
            this.roles = response.data
            this.rolesData = this.roles
        })
        this.axios({
            url: `/api/conversations`,
            method: "GET",
        })
            .then(response => {
                this.dataSource = response.data.result;
                if (response.data.result?.length) {
                    let conversation = response.data.result;
                    //   conversation.map(item => {
                    //     item.messages?.map(x => {
                    //       x.id = generateUUID();
                    //       x.status = "finish";
                    //       x.message = x.content;
                    //       x.isFinish = true;
                    //       x.recordTime = new Date(x.recordTime).toLocaleString();
                    //       x.type = x.role == "user" ? "message from" : "message to";
                    //     });
                    //   });
                    let dataSource = [];
                    conversation.forEach((x, index) => {
                        dataSource.push({
                            title: `对话${index + 1}`,
                            id: x.uuid,
                            content: x.name ?? "对话内容",
                            isActive: index == 0,
                            chatDataSource: ref([]),
                        });
                    });
                    this.dataSource = ref(dataSource);
                } else {
                    this.dataSource = ref([
                        {
                            title: "对话1",
                            id: generateUUID(),
                            content: "问题内容",
                            isActive: true,
                            chatDataSource: ref([
                                {
                                    id: "start",
                                    type: "message to",
                                    status: "start",
                                    message:
                                        "我是Claude, 一个大型语言AI模型, 我旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。我无法对事实性与实时性问题提供准确答复，请慎重对待回答。",
                                    isFinish: true,
                                    recordTime: new Date().toLocaleString(),
                                },
                            ]),
                        },
                    ]);
                }
            })
            .catch(error => {
                this.dataSource = ref([
                    {
                        title: "对话1",
                        id: generateUUID(),
                        content: "问题内容",
                        isActive: true,
                        chatDataSource: ref([
                            {
                                id: "start",
                                type: "message to",
                                status: "start",
                                message:
                                    "我是Claude, 一个大型语言AI模型, 我旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。我无法对事实性与实时性问题提供准确答复，请慎重对待回答。",
                                isFinish: true,
                                recordTime: new Date().toLocaleString(),
                            },
                        ]),
                    },
                ]);
            });
    },
    watch: {},
    methods: {
        confirmRole() {
            this.axios({
                url: `/api/chat`,
                method: "POST",
                timeout: 30000,
                data: JSON.stringify({ prompt: this.prompt }),
            }).then((response) => {
                let answer = reactive({
                    title: this.role,
                    id: response.data.conversation_id,
                    content: "问题内容",
                    chatDataSource: ref([
                        {
                            id: "start",
                            type: "message from",
                            status: "start",
                            message: this.prompt,
                            isFinish: true,
                            recordTime: new Date().toLocaleString(),
                        }, {
                            id: generateUUID(),
                            type: "message to",
                            status: "finish",
                            message: response.data.response,
                            isFinish: true,
                            recordTime: new Date().toLocaleString(),
                        },
                    ]),
                });
                this.dataSource.push(answer);
            }).catch(error => this.$message.error(`创建对话失败！${error}`));
        },
        onSearchRole(data, event) {
            let dataReg = new RegExp(data, "i");
            this.rolesData = this.roles.filter(role => role.act.search(dataReg) != -1)
        },
        updateChatDataSource(newValue) {
            let currentConv = this.dataSource.find(x => x.isActive);
            currentConv.chatDataSource = newValue;
            let firstMsg = currentConv.chatDataSource.find(x => x.status == "start");
            if (firstMsg) {
                currentConv.content =
                    firstMsg.message.length > 42 ? firstMsg.message.slice(0, 42) + "..." : firstMsg.message;
            } else {
                currentConv.content = "";
            }
        },
        changeConversation(item) {
            this.dataSource.find(x => x.isActive).isActive = false;
            this.axios({
                url: `/api/chat${item.uuid}`,
                method: "GET",
                timeout: 10000,
            }).then((response) => {
                let chatDataList = response.chat_messages.sort((a, b) => a.index - b.index)
                chatDataList.map(item => {
                    item.type = item, sender == 'assistant' ? 'message from' : 'message to'
                    item.message = item.text
                    item.status = item.index == 0 ? "start" : "finish"
                    item.isFinish = true
                    item.recordTime = item.created_at
                })
                item.chatDataSource = ref(chatDataList)
                item.isActive = true;
            }).catch(error => this.$message.error(`获取对话内容失败！${error}`));
        },
        changeRole(item) {
            this.role = item.act
            this.prompt = item.prompt
        },
        removeConversation(item) {
            this.axios({
                url: `/api/delete/${item.id}`,
                method: "GET",
            })
                .then(response => {
                    if (response.data.result) {
                        var index = this.dataSource.findIndex(x => x == item);
                        if (index > -1) {
                            this.dataSource.splice(index, 1);
                            if (item.isActive) {
                                let currentIndex = Math.min(this.dataSource.length, index);
                                if (currentIndex > 0) {
                                    this.dataSource[currentIndex - 1].isActive = true;
                                }
                            }
                        }
                    } else {
                        this.$message.error("删除失败！");
                    }
                })
                .catch(error => this.$message.error(`删除失败！${error}`));
        },
    },
};
</script>
<style scoped>
.promptCard {
    height: 60vh !important;
    max-height: 60vh !important;
}

.promptCard::-webkit-scrollbar {
    width: 10px !important;
    height: 60vh !important;
}

.cardWarp {
    overflow-x: hidden;
    position: relative;
    padding-right: 15px;
    width: 101%;
    height: 95vh;
    max-height: 95vh;
    overflow-y: auto;
}

.cardWarp::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #9e9e9e;
    box-shadow: inset 0 0 2px lawngreen;
}

.cardWarp::-webkit-scrollbar {
    width: 5px;
    height: 80vh;
    background: transparent;
}

.cardWarp::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    border-radius: 10px;
    background: #ededed;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
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