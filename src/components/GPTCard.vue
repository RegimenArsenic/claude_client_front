<template>
    <a-space direction="vertical" :style="{ width: '100%' }" :size="[0, 48]">
        <a-layout class="opacity">
            <a-layout-header class="opacity nopadding">
                <a-row :gutter="16" style="vertical-align: bottom;" :class="isFromType ? 'namerow reverse' : ''">
                    <a-col>
                        <a-avatar :size="30" :class="isFromType ? 'blue' : 'white'">
                            <template #icon>
                                <i>
                                    <UngroupOutlined v-if="!isFromType" />
                                    <UserOutlined v-else />
                                </i>
                            </template>
                        </a-avatar>
                    </a-col>
                    <a-col class="namecol">
                        <a-typography-text
                            :style="{ color: isFromType ? 'dodgerblue' : 'lawngreen', '-webkit-text-stroke': '0.3px var(--color-text)' }">
                            {{ isFromType ? '你' : 'GPT' }}
                        </a-typography-text>
                    </a-col>
                    <a-col class="namecol">
                        <a-typography-text
                            :style="{ color: isFromType ? 'dodgerblue' : 'lawngreen', '-webkit-text-stroke': '0.3px var(--color-text)' }">
                            {{ pharseDate(recordTime) }}
                        </a-typography-text>
                    </a-col>
                    <a-col class="namecol">
                        <a-spin :spinning="!isFinish" />
                        <a-tooltip placement="top">
                            <template #title>
                                <span>出现错误，点击重试</span>
                            </template>
                            <a-spin :spinning="status == 'error'">
                                <template #indicator>
                                    <WarningTwoTone two-tone-color="red" @click="resendMessage" />
                                </template>
                            </a-spin>
                        </a-tooltip>
                    </a-col>
                </a-row>
            </a-layout-header>
            <a-layout-content class="opacity">
                <a-row :class="type" style="margin: 8px;width: auto;max-width: 50vw;min-width: 5vw;">
                    <a-col :span="24">
                        <div v-html="markedDownContent"></div>
                        <a-divider v-if="attachments?.length" style="margin-top: -3px;margin-bottom: 5px;" />
                        <a-tooltip v-for="item in attachments" placement="bottom">
                            <template #title>
                                <span>{{ item.file_name }}</span>
                            </template>
                            <a-button v-if="attachments?.length" size="large" type="dashed" style="margin-left: 5px;"
                                @click="showFile(item)">
                                <template #icon>
                                    <component :is="getFileTypeIcon(item.file_type)" />
                                </template>
                            </a-button>
                        </a-tooltip>
                    </a-col>
                </a-row>
            </a-layout-content>
        </a-layout>
    </a-space>
</template>
<script>
import CodeCopy from '../components/CodeCopy.vue'
import {
    UngroupOutlined,
    WarningTwoTone,
    UserOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    FileImageOutlined,
    FilePptOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FileZipOutlined,
    FileUnknownOutlined,
} from '@ant-design/icons-vue';
import {
    Marked
} from 'marked';
import hljs from 'highlight.js';
import "highlight.js/styles/paraiso-light.css";
import {
    markedHighlight
} from "marked-highlight";
import {
    ref,
    createApp,
} from 'vue'
import moment from "moment"
const marked = new Marked(
    markedHighlight({
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, {
                language
            }).value;
        }
    }), {
    gfm: true, // 启动类似Github样式的Markdown,
    pedantic: false, // 只解析符合Markdown定义的，不修正Markdown的错误
    sanitize: false, // 原始输出，忽略HTML标签
    tables: true, // 支持Github形式的表格，必须打开gfm选项
    breaks: true, // 支持Github换行符，必须打开gfm选项
    smartLists: true, // 优化列表输出
    smartypants: false
}
);
export default {
    emits: ['resend', 'showFile'],
    components: {
        UngroupOutlined,
        WarningTwoTone,
        UserOutlined,
        FilePdfOutlined,
        FileTextOutlined,
        FileImageOutlined,
        FilePptOutlined,
        FileWordOutlined,
        FileExcelOutlined,
        FileZipOutlined,
        FileUnknownOutlined,
    },
    props: {
        type: String,
        message: String,
        isFinish: Boolean,
        recordTime: String,
        status: String,
        id: String,
        attachments: Array,
    },
    data() {
        return {
            isFromType: this.type == 'message from',
        }
    },
    computed: {
        markedDownContent: function () {
            return marked.parse(this.message)
        }
    },
    mounted() {
        this.update()
    },
    updated() {
        this.update()
    },
    methods: {
        showFile(file) {
            this.$emit("showFile", file)
        },
        getFileTypeIcon(type) {
            switch (type.toLowerCase()) {
                case "doc":
                case "docx":
                    return FileWordOutlined
                case "xls":
                case "xlsx":
                    return FileExcelOutlined
                case "txt":
                    return FileTextOutlined
                case "pdf":
                    return FilePdfOutlined
                case "ppt":
                case "pptx":
                    return FilePptOutlined
                case "zip":
                    return FileZipOutlined
                case "jpg":
                case "jpeg":
                case "bmp":
                case "gif":
                case "png":
                case "webp":
                    return FileImageOutlined
                default:
                    return FileWordOutlined
            }
        },
        pharseDate(date) {
            return moment(date).format("YYYY-MM-DD HH:mm:ss")
        },
        resendMessage() {
            this.$emit('resend', this.id)
        },
        update() {
            setTimeout(() => {
                document.querySelectorAll('pre').forEach(el => {
                    if (el.classList.contains('code-copy-added')) return
                    const app = createApp(CodeCopy, {
                        code: el.innerText,
                        originHtml: el.innerHTML
                    })
                    app.mount(el);
                    el.classList.add('code-copy-added')
                })
            }, 100)
        }
    }
}
</script>
<style scoped>
.namecol {
    display: flex;
    flex-wrap: inherit;
    align-content: flex-end
}

div.message.to {
    float: left;
    background: lawngreen;
    border-top-left-radius: 0;
}

.opacity {
    background-color: transparent;
}

.green {
    background-color: lawngreen;
}

.white {
    background-color: #73c151;
}

.blue {
    background-color: dodgerblue;
}

.nopadding {
    padding-inline: 0px;
}

div.message {
    color: black;
    border-radius: 20px;
    padding: 12px 22px;
    font-size: 0.905rem;
    display: flex;
    padding: 10px 15px 8px;
    border-radius: 20px;
    margin-bottom: 5px;
    float: right;
    clear: both;
    max-width: 65%;
    word-wrap: break-word;
}

div.namerow.reverse {
    display: flex;
    flex-direction: row-reverse;
}

div.message.from {
    background: dodgerblue;
    color: #fff;
    flex-direction: row-reverse;
    border-top-right-radius: 0;
}
</style>