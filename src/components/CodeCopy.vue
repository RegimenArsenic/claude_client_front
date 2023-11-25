<template>
    <div class="copy-content">
        <!-- 复制按钮 -->
        <CopyOutlined class="copy-btn code-data-copy" @click="copyMessageThrottle" data-clipboard-action="copy"
            :data-clipboard-text="code" />
        <Alert v-if="success" message="复制成功!" type="success" closable />
        <div v-html="originHtml"></div>
    </div>
</template>

<script>
    import {
        CopyOutlined
    } from '@ant-design/icons-vue';
    import { Alert } from 'ant-design-vue';
    import ClipboardJS from 'clipboard' //复制插件
    export default {
        components: {
            CopyOutlined,Alert
        },
        props: {
            code: String,
            originHtml: String,
        },
        data() {
            return {
                success: false,
                copyMessageThrottle: this.throttle(this.copyMessage, 3000)
            }
        },
        methods: {
            throttle(event, wait) {
                let pre = 0;
                return function (...args) {
                    if (new Date() - pre > wait) {
                        pre = new Date();
                        event.apply(this, args);
                    }
                };
            },
            copyMessage(value) {
                let _this = this
                _this.success = false
                let clipboard = new ClipboardJS('.code-data-copy')
                clipboard.on('success', function (e) {
                    _this.success = true
                    setTimeout(() => {
                        _this.success = false
                    }, 1500)
                    clipboard.destroy() // 销毁,避免多次点击重复出现
                })
                clipboard.on('error', function (e) {
                    console.log('复制失败')
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .copy-content {
        height: auto;
    }

    .icon {
        width: 0.8rem;
        height: 0.8rem;
        fill: white;
    }

    .copy-btn {
        user-select: none;
        opacity: 1;
        text-align: right;
        right: 5px;
        top: 5px;
        cursor: pointer;
        padding: 5px;
        border-radius: 3px;
        transition: 0.3s;
        background: rgba(255, 255, 255, 0);

        &:active {
            background: rgba(253, 253, 253, 0.575);
        }
    }

    .copy-success-text {
        color: blue;
        font-size: 16px;
        position: fixed;
        top: 8px;
        right: 2.5rem;
        font-weight: 200;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        animation: successCopy 0.5s ease both 1;
    }

    @keyframes successCopy {
        70% {
            opacity: 1;
            transform: scale(1);
        }

        100% {
            opacity: 0;
            transform: scale(0.5);
        }
    }
</style>