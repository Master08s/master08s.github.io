// ==UserScript==
// @name         iKuuu机场每日签到(修复优化版)
// @version      修复1.0
// @description  每天iKuuu机场自动签到领流量，必须使用脚本猫，请勿使用油猴
// @author       Master (修复优化)
// @icon         https://ikuuu.pw/favicon.ico
// @crontab      0 3 * * *
// @grant        GM_xmlhttpRequest
// @grant        GM_log
// @grant        GM_notification
// @grant        GM_openInTab
// @connect      ikuuu.pw
// @connect      ikuuu.one
// @license      GNU GPLv3
// ==/UserScript==

(function() {
    'use strict';

    const settings = {
        MAX_RETRIES: 7,
        MAX_WAIT_TIME: 32,
        CHECK_INTERVAL: 3000,
    };

    function logMessage(message, level = "info") {
        const levels = {
            info: "INFO",
            error: "ERROR",
            warn: "WARN",
        };
        GM_log(`[${levels[level]}] ${message}`);
    }

    function makeRequest(options) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                ...options,
                onload: (xhr) => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr);
                    } else {
                        reject(new Error(`请求失败，状态码: ${xhr.status}`));
                    }
                },
                onerror: () => reject(new Error("网络错误")),
                ontimeout: () => reject(new Error("请求超时")),
                onabort: () => reject(new Error("请求终止")),
            });
        });
    }

    async function verifyLoginStatus(url) {
        const xhr = await makeRequest({
            method: "GET",
            url: url + "/user",
        });
        if (xhr.finalUrl === url + "/auth/login") {
            throw new Error("未登录");
        } else if (xhr.finalUrl === url + "/user") {
            return;
        } else {
            throw new Error("网页跳转向了一个未知的网址");
        }
    }

    async function executeCheckin(url) {
        const xhr = await makeRequest({
            method: "POST",
            url: url + "/user/checkin",
            responseType: "json",
            timeout: 5000,
        });
        return xhr.response.msg;
    }

    function handleFailure(error, retries) {
        logMessage(`错误: ${error.message}`, "error");
        if (retries >= settings.MAX_RETRIES) {
            GM_notification({
                title: "出错超过七次，已退出脚本。",
                text: "请检查问题并重新运行脚本。",
            });
            throw new Error("出错超过七次，已退出脚本。");
        }
    }

    function retryOperation(fn, maxRetries = settings.MAX_RETRIES, maxWaitTime = settings.MAX_WAIT_TIME) {
        return async function attempt() {
            let retries = 0;
            let waitTime = 0;

            while (true) {
                try {
                    return await fn();
                } catch (error) {
                    handleFailure(error, retries);
                    retries++;

                    if (retries >= maxRetries) {
                        throw new Error("出错超过七次，已退出脚本。");
                    }

                    waitTime += settings.CHECK_INTERVAL / 1000;
                    if (waitTime >= maxWaitTime) {
                        throw new Error("脚本运行超时");
                    }

                    await new Promise(resolve => setTimeout(resolve, settings.CHECK_INTERVAL));
                }
            }
        };
    }

    async function mainFunction() {
        const urls = ["https://ikuuu.pw", "https://ikuuu.one"];
        let success = false;

        for (const url of urls) {
            try {
                await verifyLoginStatus(url);
                success = true;
                break;
            } catch (error) {
                if (error.message === "未登录") {
                    GM_notification({
                        title: "iKuuu未登录！",
                        text: "请点击登陆后重新运行脚本",
                        onclick: () => GM_openInTab(url + "/auth/login"),
                        timeout: 10000,
                    });
                    GM_openInTab(url + "/auth/login");
                    return;
                } else {
                    handleFailure(error, 0);
                }
            }
        }

        if (!success) {
            logMessage("所有备用链接均无法访问，脚本退出。", "error");
            return;
        }

        const retryCheckin = retryOperation(() => executeCheckin(urls[0]), settings.MAX_RETRIES, settings.MAX_WAIT_TIME);
        const message = await retryCheckin();
        GM_notification({
            title: "签到成功",
            text: message,
        });

        // 提示原作者和优化者
        GM_notification({
            title: "脚本信息",
            text: "原作者: Vikrant\n优化者: Master",
        });
    }

    mainFunction().catch(error => logMessage(`脚本运行失败: ${error.message}`, "error"));
})();