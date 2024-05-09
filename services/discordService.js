
import parseUserAgentString from '../utils/parseUserAgentString.js'
import parseProxyString from '../utils/parseProxyString.js';
import base64 from 'base-64';
import { HttpsProxyAgent } from 'https-proxy-agent';
import loggerService from './loggerService.js'

class DiscordService {

    createOperationList(accountsData, serverData) {
        try {
            this.accountData = accountsData
            this.serverData = serverData

            const operationList = []

            for (let i = 0; i < serverData.length; i++) {

                const {
                    Message: msg,
                    Server_Name: serverName,
                    Accounts_List: accountList,
                    Channel_ID: channelId
                } = serverData[i]

                const usersAccountsListNum = this.getAccountsListNum(accountList)

                for (let j = 0; j < usersAccountsListNum.length; j++) {
                    const acc = accountsData[usersAccountsListNum[j] - 1]

                    operationList.push({
                        msg,
                        channelId,
                        token: acc.Discord_Token,
                        proxy: acc.HTTP_Proxy,
                        userAgent: acc.User_Agent,
                        accountName: acc.Name,
                        serverName
                    })
                }
            }

            return operationList
        } catch (err) {
            loggerService.addLog({ type: 'ERROR', msg: `Error create operation list ${err}` })
            return []
        }
    }

    getAccountsListNum(usersId) {
        let usersRunIdList = usersId?.toString().replace(/\./g, ',')

        if (!usersRunIdList || usersRunIdList === "0") {
            usersRunIdList = Array.from({ length: this.accountData.length }, (_, index) => index + 1)
        } else if (usersRunIdList.includes('-')) {
            let [start, end] = usersRunIdList.split('-')
            start = parseInt(start)
            end = parseInt(end)

            usersRunIdList = Array.from({ length: end - start + 1 }, (_, index) => index + start)
        } else {
            usersRunIdList = usersRunIdList.split(',').filter(item => !!(item && item !== " "))
        }

        return usersRunIdList
    }

    randomSortOperation(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async sendMsgToChannel({ msg, channelId, token, proxy, userAgent }) {
        try {
            const url = `https://discord.com/api/v9/channels/${channelId}/messages`
            const { os, bv, osv } = parseUserAgentString(userAgent)

            const data = {
                os: os,
                browser: 'Chrome',
                device: '',
                system_locale: 'en-US',
                browser_user_agent: userAgent,
                browser_version: bv,
                os_version: osv,
                referrer: 'https://www.google.com/',
                referring_domain: 'www.google.com',
                search_engine: 'google',
                referrer_current: 'https://www.google.com/',
                referring_domain_current: 'www.google.com',
                search_engine_current: 'google',
                release_channel: 'stable',
                client_build_number: 169464,
                client_event_source: null
            }

            const config = {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en,en-EN;q=0.9,uk;q=0.8,ru;q=0.7",
                    "authorization": token,
                    "content-type": "application/json",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-debug-options": "bugReporterEnabled",
                    "x-discord-locale": "en",
                    "x-discord-timezone": "Europe/Berlin",
                    "x-super-properties": base64.encode(JSON.stringify(data)),
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": JSON.stringify({ content: msg }),
                "method": "POST",
            }

            if (proxy) {
                config.agent = new HttpsProxyAgent(parseProxyString(proxy))
            }
            const res = await fetch(url, config)

            return await res.json()
        } catch (err) {
            return {
                code: 0,
                message: err.message
            }
        }
    }

}

export default new DiscordService()