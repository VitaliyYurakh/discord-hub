import { Box, Text, render, useApp, useInput } from 'ink'
import React, { useEffect, useState } from 'react'
import BigText from 'ink-big-text'
import SelectInput from 'ink-select-input'
import { Table } from '@tqman/ink-table'
import { TaskList, Task } from 'ink-task-list';
import path from "path"
import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent';
import { fileURLToPath } from 'url';

import discordService from './services/discordService.js'
import excelService from './services/excelService.js'
import parseProxyString from './utils/parseProxyString.js'
import { MAXIMUM_RETRY, SLEEP_TIME } from './data/config.js'
import sleep from './utils/sleep.js'
import randomNum from './utils/randomNum.js';
import loggerService from './services/loggerService.js'

loggerService.addLog({ type: 'INFO', msg: 'start program' })

const dirPath = path.dirname(fileURLToPath(import.meta.url))
const accountsFilePath = path.join(dirPath, './data/accounts_data.xlsx')
const serverDataPath = path.join(dirPath, './data/spam_msg.xlsx')

const accountsData = excelService.getDataFromFile(accountsFilePath)
const serverData = excelService.getDataFromFile(serverDataPath)

const App = () => {

    const [screen, setScreen] = useState('main')

    return (
        <Box
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
            height={'100%'}
        >
            <Box flexGrow={1} display='flex' flexDirection='column' columnGap={2}>
                <Box>
                    <Text color={'grey'}>
                        <BigText align='center' text='Discord' />
                        <BigText align='center' text='- Hub -' />
                    </Text>
                </Box>
                <Box alignSelf='center'>
                    <Text bold>Donate 0x938c6bd70E152b261735F6CDc6E5be075feD4664 | Support & suggestions -  Telegram: <Text color={'blueBright'}>@i_66_77</Text></Text>
                </Box>
            </Box>
            {screen === 'main' && <MainScreen changeScreen={setScreen} />}
            {screen === 'info' && <AccountInfoScreen changeScreen={setScreen} />}
            {screen === 'proxy' && <ProxyScreen changeScreen={setScreen} />}
            {screen === 'standart' && <DiscrodSpamScreen changeScreen={setScreen} />}
            {screen === 'smart' && <SmartScreen changeScreen={setScreen} />}
        </Box>
    )
}

const CustomIndicator = ({ isSelected }) => {
    return (
        <Box marginRight={1}>
            {isSelected ? (
                <Text color="green">{'>>'}</Text>
            ) : (
                <Text> </Text>
            )}
        </Box>
    )
}

const CustomItem = ({ isSelected = false, label }) => {
    return <Text color={isSelected ? 'green' : undefined}>{label} <Text color='gray'>{isSelected ? '(Press Enter)' : ''}</Text></Text>;
}

const MainScreen = ({ changeScreen }) => {
    const { exit } = useApp();

    const mainItems = [
        {
            label: '# Check accounts info',
            value: 'info'
        },
        {
            label: '# Check proxy',
            value: 'proxy'
        },
        {
            label: '# Standart spam',
            value: 'standart'
        },
        {
            label: '# Smart discord chating (waiting)',
            value: 'smart'
        },
        {
            label: '# Exit',
            value: 'exit'
        }
    ];

    const handlerSelectMainScreen = ({ value }) => {
        if (value === 'exit') {
            exit()
            return
        }

        changeScreen(value)
    }

    return (
        <Box marginTop={1} marginBottom={5} flexGrow={2}>
            <Box display='flex' flexDirection='column'>
                <SelectInput
                    indicatorComponent={CustomIndicator}
                    itemComponent={CustomItem}
                    items={mainItems}
                    onSelect={handlerSelectMainScreen}
                />
            </Box>
        </Box>
    )
}

const AccountInfoScreen = ({ changeScreen }) => {
    const [data, setData] = useState([])
    const [page, setPage] = useState(0)
    const [currentData, setCurrentData] = useState([])

    const countRow = 10
    const maxPage = Math.ceil(data.length / countRow)

    useInput((_, key) => {
        if (key.leftArrow) {
            setPage(prev => prev === 1 ? prev : prev - 1)
        }

        if (key.rightArrow) {
            setPage(prev => prev === maxPage ? prev : prev + 1)
        }
    })

    useEffect(() => {
        const compraseData = excelService.compraseData(accountsData)
        setData(compraseData)
        setPage(1)
        loggerService.addLog({ type: 'INFO', msg: 'show account info' })
    }, [])

    useEffect(() => {
        const end = page * countRow
        const start = end - countRow

        setCurrentData(data.slice(start, end))
    }, [page])

    const items = [
        {
            label: '# Back',
            value: 'back'
        }
    ];

    const handlerSelectMainScreen = ({ value }) => {
        if (value === 'back') {
            changeScreen('main')
        }
    }
    return (
        <>
            <Box
                display='flex'
                flexDirection='column'
                marginTop={1}
                marginBottom={5}
                flexGrow={2}
                width='100%'
                padding={1}
            >
                <Box
                    display='flex'
                    justifyContent='space-between'
                    padding={1}
                >
                    <Text>press <Text bold>←</Text> to flip left | press <Text bold>→</Text> to flip right</Text>
                </Box>
                <Box display='flex' flexGrow={1}>
                    <Table data={currentData} />
                </Box>
                <Box>
                    <Text>
                        Show: {page * countRow - countRow + 1} - {page * countRow > data.length ? data.length : page * countRow} / {data.length}
                    </Text>
                </Box>
            </Box>
            <Box position='absolute' height='100%' display='flex' alignItems='flex-end'>
                <Box display='flex' flexDirection='column'>
                    <SelectInput
                        indicatorComponent={CustomIndicator}
                        itemComponent={CustomItem}
                        items={items}
                        onSelect={handlerSelectMainScreen}
                    />
                </Box>
            </Box>
        </>
    )
}

const ProxyScreen = ({ changeScreen }) => {
    const [proxyList, setProxyList] = useState([])
    const [statusMsg, setStatusMsg] = useState('')

    useEffect(() => {
        const fileteredAccountData = accountsData.filter(({ HTTP_Proxy: proxy }) => proxy)
        let countError = 0
        loggerService.addLog({ type: 'INFO', msg: 'starting check proxy' })
        const checkedProxy = async () => {
            for (let i = 0; i < fileteredAccountData.length; i++) {
                const { HTTP_Proxy: proxy, Name: name } = fileteredAccountData[i]
                setProxyList(prev => [...prev, { proxy, status: 'pending', name }])

                try {
                    const httpAgent = new HttpsProxyAgent(parseProxyString(proxy))

                    await fetch('https://google.com', {
                        method: "GET",
                        agent: httpAgent
                    })

                    setProxyList(prev => prev.map((info, j) => j === i ? { ...info, status: 'success' } : { ...info }))

                    loggerService.addLog({ type: 'SUCCESS', msg: `${proxy} successfully checked` })

                } catch (err) {
                    setProxyList(prev => prev.map((info, j) => j === i ? { ...info, status: 'error' } : { ...info }))
                    countError++

                    loggerService.addLog({ type: 'ERROR', msg: `${proxy} checked proxy. ${err}` })
                }
            }

            return countError
        }

        checkedProxy()
            .then(countError => {
                if (!countError) {
                    setStatusMsg('Checked out successfully!')
                } else {
                    setStatusMsg(`Checked out successfully with ${countError} error! View the log.`)
                }

                loggerService.addLog({ type: 'INFO', msg: `end checked proxy` })
            })
            .catch((err) => {
                setStatusMsg('Error when checked proxy. Check Log')

                loggerService.addLog({ type: 'ERROR', msg: `Error when checked proxy. ${err}` })
            })
    }, [])

    const handlerSelectMainScreen = ({ value }) => {
        if (value === 'back') {
            changeScreen('main')
        }
    }

    const items = [
        {
            label: '# Back',
            value: 'back'
        }
    ];

    return (
        <>
            <Box
                display='flex'
                flexDirection='column'
                marginTop={1}
                marginBottom={5}
                flexGrow={2}
                width='100%'
                padding={1}
            >
                {proxyList.length ?
                    <TaskList>
                        {proxyList.map(({ status, proxy, name }, i) => {
                            return (
                                <Task key={i} label={`${name} => ${proxy}`} state={status} />
                            )
                        })}
                        <Box marginTop={1}>
                            {!statusMsg ?
                                <Task
                                    label="Loading"
                                    state="loading"
                                    spinner={{
                                        "interval": 80,
                                        "frames": [
                                            "[    ]",
                                            "[=   ]",
                                            "[==  ]",
                                            "[=== ]",
                                            "[====]",
                                            "[ ===]",
                                            "[  ==]",
                                            "[   =]",
                                            "[    ]",
                                            "[   =]",
                                            "[  ==]",
                                            "[ ===]",
                                            "[====]",
                                            "[=== ]",
                                            "[==  ]",
                                            "[=   ]"
                                        ]
                                    }}
                                />
                                :
                                <Text>{statusMsg}</Text>
                            }
                        </Box>
                    </TaskList>
                    :
                    <Box>
                        <Text>No Proxy</Text>
                    </Box>
                }
            </Box>
            <Box position='absolute' height='100%' display='flex' alignItems='flex-end'>
                <Box display='flex' flexDirection='column'>
                    <SelectInput
                        indicatorComponent={CustomIndicator}
                        itemComponent={CustomItem}
                        items={items}
                        onSelect={handlerSelectMainScreen}
                    />
                </Box>
            </Box>
        </>
    )
}

const DiscrodSpamScreen = ({ changeScreen }) => {
    const [data, setData] = useState([])
    const [operationList, setOperationList] = useState([])
    const [logs, setLogs] = useState([])
    const [isRunnig, setRunnig] = useState(false)
    const [page, setPage] = useState(0)
    const [currentData, setCurrentData] = useState([])

    const [goodOperation, setGoodOpeartion] = useState(0)
    const [badOperation, setBadOpeartion] = useState(0)

    const countRow = 10
    const maxPage = Math.ceil(data.length / countRow)

    useInput((_, key) => {
        if (key.leftArrow) {
            setPage(prev => prev === 1 ? prev : prev - 1)
        }

        if (key.rightArrow) {
            setPage(prev => prev === maxPage ? prev : prev + 1)
        }
    })

    useEffect(() => {
        const operationList = discordService.createOperationList(accountsData, serverData)
        const compraseData = operationList.map(({ accountName, serverName, msg }) => ({
            Account_Name: accountName,
            Server_Name: serverName,
            Message: msg.length > 20 ? msg.slice(0, 20) + "..." : msg
        }))

        setOperationList(operationList)
        setData(compraseData)
        setPage(1)
    }, [])

    useEffect(() => {
        const end = page * countRow
        const start = end - countRow

        setCurrentData(data.slice(start, end))
    }, [page])

    const items = [
        {
            label: '# Start random spam',
            value: 'run'
        },
        {
            label: '# Back',
            value: 'back'
        }
    ];

    const runOperations = async () => {
        const randomizeOperationList = discordService.randomSortOperation(operationList)
        loggerService.addLog({ type: 'INFO', msg: `start send spam msg` })

        const step = Math.round(100 / operationList.length)

        for (let i = 0; i < randomizeOperationList.length; i++) {
            const {
                msg,
                channelId,
                token,
                proxy,
                userAgent,
                accountName,
                serverName
            } = randomizeOperationList[i]

            setLogs(prev => [...prev, {
                msg: `Sending message - "${msg}" on server - "${serverName}" from account - "${accountName}"`,
                color: ''
            }])
            loggerService.addLog({ type: 'INFO', msg: `Sending message - "${msg}" on server - "${serverName}" from account - "${accountName}"` })
            let error = 0

            while (error < MAXIMUM_RETRY) {
                const data = await discordService.sendMsgToChannel({
                    msg,
                    channelId,
                    token,
                    proxy,
                    userAgent,
                })

                if ('code' in data) {
                    setLogs(prev => [...prev,
                    {
                        msg: `Error [${error + 1}/${MAXIMUM_RETRY}]. ${data.message}`,
                        color: 'red'
                    }
                    ])
                    loggerService.addLog({ type: 'ERROR', msg: data })
                    const time = randomNum(SLEEP_TIME[0], SLEEP_TIME[1])

                    if (error + 1 !== MAXIMUM_RETRY) {
                        setLogs(prev => [...prev, {
                            msg: `Resending message after ${Math.floor(time / 1000)}s`,
                            color: ''
                        }])
                        await sleep(time)
                    }
                    error++
                } else {
                    setLogs(prev => [...prev, {
                        msg: `Message sent successfully`,
                        color: 'green'
                    }])
                    loggerService.addLog({ type: 'SUCCESS', msg: `Message - "${msg}" on server - "${serverName}" from account - "${accountName}" sent successfully` })
                    break
                }
            }

            if (error) {
                setBadOpeartion(prev => prev += 1)
            } else {
                setGoodOpeartion(prev => prev += 1)
            }

            if (i + 1 !== randomizeOperationList.length) {
                const time = randomNum(SLEEP_TIME[0], SLEEP_TIME[1])
                setLogs(prev => [...prev,
                {
                    msg: '\n' + `Waiting ${Math.floor(time / 1000)}s next account` + '\n\n',
                    color: ''
                }
                ])
                await sleep(time)
            }
        }
        setLogs(prev => [...prev, {
            msg: '\n\n' + `Successefully completed! Waiting 10s to redirect at home!`,
            color: 'green'
        }])
        loggerService.addLog({ type: 'INFO', msg: `end send spam msg` })
        setTimeout(() => {
            setRunnig(false)
            changeScreen('main')
        }, 10000)
    }

    const handlerSelectMainScreen = ({ value }) => {
        if (value === 'run') {
            setRunnig(true)
            runOperations()
        }

        if (value === 'back') {
            changeScreen('main')
        }
    }

    return (
        <>
            <Box
                display='flex'
                flexDirection='column'
                marginTop={1}
                marginBottom={5}
                flexGrow={2}
                width='100%'
                padding={1}
            >
                {!isRunnig ?
                    <>
                        <Box
                            display='flex'
                            justifyContent='space-between'
                            padding={1}
                        >
                            <Text>press <Text bold>←</Text> to flip left | press <Text bold>→</Text> to flip right</Text>
                        </Box>
                        <Table data={currentData} />
                        <Box>
                            <Text>
                                Show: {page * countRow - countRow + 1} - {page * countRow > data.length ? data.length : page * countRow} / {data.length}
                            </Text>
                        </Box>
                    </>
                    :
                    <Box
                        display='flex'
                        flexDirection='column'
                        padding={1}
                    >
                        {logs.map(({ color, msg }, i) => <Text key={i} color={color}>{msg}</Text>)}
                    </Box>
                }
            </Box>
            <Box position='absolute' height='100%' display='flex' alignItems='flex-end'>
                {!isRunnig &&
                    <Box display='flex' flexDirection='column'>
                        <SelectInput
                            indicatorComponent={CustomIndicator}
                            itemComponent={CustomItem}
                            items={items}
                            onSelect={handlerSelectMainScreen}
                        />
                    </Box>
                }
                {isRunnig &&
                    <Box padding={1}>
                        <Text>
                            [<Text color={'green'}>{goodOperation}</Text>/<Text color={'red'}>{badOperation}</Text>/{operationList.length}] - success operations / bad operations / all operations
                        </Text>
                    </Box>
                }
            </Box>
        </>
    )
}

const SmartScreen = ({ changeScreen }) => {
    const handlerSelectMainScreen = ({ value }) => {
        if (value === 'back') {
            changeScreen('main')
        }
    }

    const items = [
        {
            label: '# Back',
            value: 'back'
        }
    ];

    return (
        <>
            <Box
                display='flex'
                flexDirection='column'
                marginTop={1}
                marginBottom={5}
                flexGrow={2}
                width='100%'
                padding={1}
            >
                <Box display='flex' flexDirection='column'>
                    <Text>Smart Chating - это революционную функция с искусственным интеллектом, которая станет вашим незаменимым помощником в Discord! {'\n'}</Text>
                    <Text>
                        - Суперскорость: Автоматически генерирует мультиязыковые ответы на сообщения, экономя ваше время и нервы. {'\n'}  Искусственный интеллект молниеносно анализирует контекст разговора, выдавая остроумные и интересные реплики, делая общение динамичным и увлекательным.
                    </Text>
                    <Text>
                        - Суперкреативность: Smart Chating сгенерирует увлекательную историю, стихотворение, сценарий или даже картинку - всего одним кликом! {'\n'}  Эта функция поможет вам стать звездой Discord и получить WL роль.
                    </Text>
                    <Text>
                        - Супервлияние: Использование Smart Chating проанализирует контент сервера и сообщений пользователей после чего подберет самые точные и убедительные аргументы, {'\n'}  чтобы завоевать авторитет и уважение других пользователей. {'\n'}
                    </Text>
                    <Text>Весомые аргументы использовать Smart Chating: {'\n'}</Text>
                    <Text>
                        - Больше ролей: Чем активнее вы используете Smart Chating, тем больше опыта вы получаете, открывая доступ к эксклюзивным ролям на серверах.
                    </Text>
                    <Text>
                        - Повышенная репутация: Демонстрируйте свои знания и навыки общения с помощью ИИ, приобретая авторитет и уважение, что ведет к получению новых ролей. {'\n'}
                    </Text>
                    <Text>
                        Smart Chating - платная функция, которая будет доступна в следующем обновлении.{'\n'}
                    </Text>
                    <Text>
                        Smart Chating - будь Smart!
                    </Text>
                    <Text>
                        Узнайте больше: Telegram: <Text color={'blueBright'}>@i_66_77</Text>
                    </Text>
                </Box>
            </Box>
            <Box position='absolute' height='100%' display='flex' alignItems='flex-end'>
                <Box display='flex' flexDirection='column'>
                    <SelectInput
                        indicatorComponent={CustomIndicator}
                        itemComponent={CustomItem}
                        items={items}
                        onSelect={handlerSelectMainScreen}
                    />
                </Box>
            </Box>
        </>
    )
}

render(<App />)