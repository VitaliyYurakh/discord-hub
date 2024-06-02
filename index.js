import { Box, Text, render, useApp, useInput } from 'ink';
import React, { useEffect, useState } from 'react';
import BigText from 'ink-big-text';
import SelectInput from 'ink-select-input';
import { Table } from '@tqman/ink-table';
import { TaskList, Task } from 'ink-task-list';
import path from "path";
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { fileURLToPath } from 'url';
import base64 from 'base-64';
import discordService from './services/discordService.js';
import excelService from './services/excelService.js';
import parseProxyString from './utils/parseProxyString.js';
import { MAXIMUM_RETRY, SLEEP_TIME, RESTART_TIME } from './data/config.js';
import sleep from './utils/sleep.js';
import randomNum from './utils/randomNum.js';
import loggerService from './services/loggerService.js';
loggerService.addLog({
  type: 'INFO',
  msg: 'start program'
});
const dirPath = path.dirname(fileURLToPath(import.meta.url));
const accountsFilePath = path.join(dirPath, './data/accounts_data.xls');
const serverDataPath = path.join(dirPath, './data/spam_msg.xls');
const accountsData = excelService.getDataFromFile(accountsFilePath);
const serverData = excelService.getDataFromFile(serverDataPath);
const App = () => {
  const [screen, setScreen] = useState('main');
  return /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: '100%'
  }, /*#__PURE__*/React.createElement(Box, {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    columnGap: 2
  }, /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Text, {
    color: 'grey'
  }, /*#__PURE__*/React.createElement(BigText, {
    align: "center",
    text: "Discord"
  }), /*#__PURE__*/React.createElement(BigText, {
    align: "center",
    text: "- Hub -"
  }))), /*#__PURE__*/React.createElement(Box, {
    alignSelf: "center"
  }, /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "Donate(Any EVM) 0x938c6bd70E152b261735F6CDc6E5be075feD4664 | Support & suggestions - Telegram: ", /*#__PURE__*/React.createElement(Text, {
    color: 'blueBright'
  }, "@i_66_77")))), screen === 'main' && /*#__PURE__*/React.createElement(MainScreen, {
    changeScreen: setScreen
  }), screen === 'info' && /*#__PURE__*/React.createElement(AccountInfoScreen, {
    changeScreen: setScreen
  }), screen === 'discord' && /*#__PURE__*/React.createElement(DicordInfoScreen, {
    changeScreen: setScreen
  }), screen === 'proxy' && /*#__PURE__*/React.createElement(ProxyScreen, {
    changeScreen: setScreen
  }), screen === 'standart' && /*#__PURE__*/React.createElement(DiscrodSpamScreen, {
    changeScreen: setScreen
  }), screen === 'smart' && /*#__PURE__*/React.createElement(SmartScreen, {
    changeScreen: setScreen
  }));
};
const CustomIndicator = ({
  isSelected
}) => {
  return /*#__PURE__*/React.createElement(Box, {
    marginRight: 1
  }, isSelected ? /*#__PURE__*/React.createElement(Text, {
    color: "green"
  }, '>>') : /*#__PURE__*/React.createElement(Text, null, " "));
};
const CustomItem = ({
  isSelected = false,
  label
}) => {
  return /*#__PURE__*/React.createElement(Text, {
    color: isSelected ? 'green' : undefined
  }, label, " ", /*#__PURE__*/React.createElement(Text, {
    color: "gray"
  }, isSelected ? '(Press Enter)' : ''));
};
const MainScreen = ({
  changeScreen
}) => {
  const {
    exit
  } = useApp();
  const mainItems = [{
    label: '# Check accounts info',
    value: 'info'
  }, {
    label: '# Discords info',
    value: 'discord'
  }, {
    label: '# Check proxy',
    value: 'proxy'
  }, {
    label: '# Standart spam',
    value: 'standart'
  }, {
    label: '# Smart discord chating (waiting)',
    value: 'smart'
  }, {
    label: '# Exit',
    value: 'exit'
  }];
  const handlerSelectMainScreen = ({
    value
  }) => {
    if (value === 'exit') {
      exit();
      return;
    }
    changeScreen(value);
  };
  return /*#__PURE__*/React.createElement(Box, {
    marginTop: 1,
    marginBottom: 5,
    flexGrow: 2
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(SelectInput, {
    indicatorComponent: CustomIndicator,
    itemComponent: CustomItem,
    items: mainItems,
    onSelect: handlerSelectMainScreen
  })));
};
const AccountInfoScreen = ({
  changeScreen
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const countRow = 10;
  const maxPage = Math.ceil(data.length / countRow);
  useInput((_, key) => {
    if (key.leftArrow) {
      setPage(prev => prev === 1 ? prev : prev - 1);
    }
    if (key.rightArrow) {
      setPage(prev => prev === maxPage ? prev : prev + 1);
    }
  });
  useEffect(() => {
    const compraseData = excelService.compraseData(accountsData);
    setData(compraseData);
    setPage(1);
    loggerService.addLog({
      type: 'INFO',
      msg: 'show account info'
    });
  }, []);
  useEffect(() => {
    const end = page * countRow;
    const start = end - countRow;
    setCurrentData(data.slice(start, end));
  }, [page]);
  const items = [{
    label: '# Back',
    value: 'back'
  }];
  const handlerSelectMainScreen = ({
    value
  }) => {
    if (value === 'back') {
      changeScreen('main');
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column",
    marginTop: 1,
    marginBottom: 5,
    flexGrow: 2,
    width: "100%",
    padding: 1
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    justifyContent: "space-between",
    padding: 1
  }, /*#__PURE__*/React.createElement(Text, null, "press ", /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "\u2190"), " to flip left | press ", /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "\u2192"), " to flip right")), /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexGrow: 1
  }, /*#__PURE__*/React.createElement(Table, {
    data: currentData
  })), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Text, null, "Show: ", page * countRow - countRow + 1, " - ", page * countRow > data.length ? data.length : page * countRow, " / ", data.length))), /*#__PURE__*/React.createElement(Box, {
    position: "absolute",
    height: "100%",
    display: "flex",
    alignItems: "flex-end"
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(SelectInput, {
    indicatorComponent: CustomIndicator,
    itemComponent: CustomItem,
    items: items,
    onSelect: handlerSelectMainScreen
  }))));
};
const ProxyScreen = ({
  changeScreen
}) => {
  const [proxyList, setProxyList] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  useEffect(() => {
    const fileteredAccountData = accountsData.filter(({
      HTTP_Proxy: proxy
    }) => proxy);
    let countError = 0;
    loggerService.addLog({
      type: 'INFO',
      msg: 'starting check proxy'
    });
    const checkedProxy = async () => {
      for (let i = 0; i < fileteredAccountData.length; i++) {
        const {
          HTTP_Proxy: proxy,
          Name: name
        } = fileteredAccountData[i];
        setProxyList(prev => [...prev, {
          proxy,
          status: 'pending',
          name
        }]);
        try {
          const httpAgent = new HttpsProxyAgent(parseProxyString(proxy));
          await fetch('https://google.com', {
            method: "GET",
            agent: httpAgent
          });
          setProxyList(prev => prev.map((info, j) => j === i ? {
            ...info,
            status: 'success'
          } : {
            ...info
          }));
          loggerService.addLog({
            type: 'SUCCESS',
            msg: `${proxy} successfully checked`
          });
        } catch (err) {
          setProxyList(prev => prev.map((info, j) => j === i ? {
            ...info,
            status: 'error'
          } : {
            ...info
          }));
          countError++;
          loggerService.addLog({
            type: 'ERROR',
            msg: `${proxy} checked proxy. ${err}`
          });
        }
      }
      return countError;
    };
    checkedProxy().then(countError => {
      if (!countError) {
        setStatusMsg('Checked out successfully!');
      } else {
        setStatusMsg(`Checked out successfully with ${countError} error! View the log.`);
      }
      loggerService.addLog({
        type: 'INFO',
        msg: `end checked proxy`
      });
    }).catch(err => {
      setStatusMsg('Error when checked proxy. Check Log');
      loggerService.addLog({
        type: 'ERROR',
        msg: `Error when checked proxy. ${err}`
      });
    });
  }, []);
  const handlerSelectMainScreen = ({
    value
  }) => {
    if (value === 'back') {
      changeScreen('main');
    }
  };
  const items = [{
    label: '# Back',
    value: 'back'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column",
    marginTop: 1,
    marginBottom: 5,
    flexGrow: 2,
    width: "100%",
    padding: 1
  }, proxyList.length ? /*#__PURE__*/React.createElement(TaskList, null, proxyList.map(({
    status,
    proxy,
    name
  }, i) => {
    return /*#__PURE__*/React.createElement(Task, {
      key: i,
      label: `${name} => ${proxy}`,
      state: status
    });
  }), /*#__PURE__*/React.createElement(Box, {
    marginTop: 1
  }, !statusMsg ? /*#__PURE__*/React.createElement(Task, {
    label: "Loading",
    state: "loading",
    spinner: {
      "interval": 80,
      "frames": ["[    ]", "[=   ]", "[==  ]", "[=== ]", "[====]", "[ ===]", "[  ==]", "[   =]", "[    ]", "[   =]", "[  ==]", "[ ===]", "[====]", "[=== ]", "[==  ]", "[=   ]"]
    }
  }) : /*#__PURE__*/React.createElement(Text, null, statusMsg))) : /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Text, null, "No Proxy"))), /*#__PURE__*/React.createElement(Box, {
    position: "absolute",
    height: "100%",
    display: "flex",
    alignItems: "flex-end"
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(SelectInput, {
    indicatorComponent: CustomIndicator,
    itemComponent: CustomItem,
    items: items,
    onSelect: handlerSelectMainScreen
  }))));
};
const DicordInfoScreen = ({
  changeScreen
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const countRow = 10;
  const maxPage = Math.ceil(data.length / countRow);
  useInput((_, key) => {
    if (key.leftArrow) {
      setPage(prev => prev === 1 ? prev : prev - 1);
    }
    if (key.rightArrow) {
      setPage(prev => prev === maxPage ? prev : prev + 1);
    }
  });
  useEffect(() => {
    const info = accountsData.map(({
      Discord_Token,
      Name
    }) => {
      const slicedToken = Discord_Token.split('.')[0];
      const encodedToken = slicedToken;
      const id = base64.decode(encodedToken);
      const date = getCreationDate(id);
      return {
        Name,
        Id: id,
        Created_Date: date
      };
    });
    setData(info);
    setPage(1);
  }, []);
  useEffect(() => {
    const end = page * countRow;
    const start = end - countRow;
    setCurrentData(data.slice(start, end));
  }, [page]);
  const getCreationDate = id => new Date(id / 4194304 + 1420070400000).toUTCString();
  const items = [{
    label: '# Back',
    value: 'back'
  }];
  const handlerSelectMainScreen = ({
    value
  }) => {
    if (value === 'back') {
      changeScreen('main');
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column",
    marginTop: 1,
    marginBottom: 5,
    flexGrow: 2,
    width: "100%",
    padding: 1
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    justifyContent: "space-between",
    padding: 1
  }, /*#__PURE__*/React.createElement(Text, null, "press ", /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "\u2190"), " to flip left | press ", /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "\u2192"), " to flip right")), /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexGrow: 1
  }, /*#__PURE__*/React.createElement(Table, {
    data: currentData
  })), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Text, null, "Show: ", page * countRow - countRow + 1, " - ", page * countRow > data.length ? data.length : page * countRow, " / ", data.length))), /*#__PURE__*/React.createElement(Box, {
    position: "absolute",
    height: "100%",
    display: "flex",
    alignItems: "flex-end"
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(SelectInput, {
    indicatorComponent: CustomIndicator,
    itemComponent: CustomItem,
    items: items,
    onSelect: handlerSelectMainScreen
  }))));
};
const DiscrodSpamScreen = ({
  changeScreen
}) => {
  const [data, setData] = useState([]);
  const [operationList, setOperationList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isRunnig, setRunnig] = useState(false);
  const [page, setPage] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const [infinity, setInfinity] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [goodOperation, setGoodOpeartion] = useState(0);
  const [badOperation, setBadOpeartion] = useState(0);
  const countRow = 10;
  const maxPage = Math.ceil(data.length / countRow);
  useInput((_, key) => {
    if (key.leftArrow) {
      setPage(prev => prev === 1 ? prev : prev - 1);
    }
    if (key.rightArrow) {
      setPage(prev => prev === maxPage ? prev : prev + 1);
    }
  });
  useEffect(() => {
    const operationList = discordService.createOperationList(accountsData, serverData);
    const compraseData = operationList.map(({
      accountName,
      serverName,
      msg
    }) => ({
      Account_Name: accountName,
      Server_Name: serverName,
      Message: msg.length > 20 ? msg.slice(0, 20) + "..." : msg
    }));
    setOperationList(operationList);
    setData(compraseData);
    setPage(1);
  }, []);
  useEffect(() => {
    const end = page * countRow;
    const start = end - countRow;
    setCurrentData(data.slice(start, end));
  }, [page]);
  const items = [{
    label: '# Start one-time spam',
    value: 'run'
  }, {
    label: `# Start spam with restart between sessions after ${RESTART_TIME} hours`,
    value: 'while'
  }, {
    label: '# Back',
    value: 'back'
  }];
  const runOperations = async (infinity = false) => {
    const randomizeOperationList = discordService.randomSortOperation(operationList);
    loggerService.addLog({
      type: 'INFO',
      msg: `start send spam msg`
    });
    const run = async (infinity = false) => {
      for (let i = 0; i < randomizeOperationList.length; i++) {
        const {
          msg,
          channelId,
          token,
          proxy,
          userAgent,
          accountName,
          serverName
        } = randomizeOperationList[i];
        setLogs(prev => [...prev, {
          msg: `Sending message - "${msg}" on server - "${serverName}" from account - "${accountName}"`,
          color: ''
        }]);
        loggerService.addLog({
          type: 'INFO',
          msg: `Sending message - "${msg}" on server - "${serverName}" from account - "${accountName}"`
        });
        let error = 0;
        while (error < MAXIMUM_RETRY) {
          const data = await discordService.sendMsgToChannel({
            msg,
            channelId,
            token,
            proxy,
            userAgent
          });
          if ('code' in data) {
            setLogs(prev => [...prev, {
              msg: `Error [${error + 1}/${MAXIMUM_RETRY}]. ${data.message}`,
              color: 'red'
            }]);
            loggerService.addLog({
              type: 'ERROR',
              msg: data
            });
            const time = randomNum(SLEEP_TIME[0], SLEEP_TIME[1]);
            if (error + 1 !== MAXIMUM_RETRY) {
              setLogs(prev => [...prev, {
                msg: `Resending message after ${Math.floor(time / 1000)}s`,
                color: ''
              }]);
              await sleep(time);
            }
            error++;
          } else {
            setLogs(prev => [...prev, {
              msg: `Message sent successfully`,
              color: 'green'
            }]);
            loggerService.addLog({
              type: 'SUCCESS',
              msg: `Message - "${msg}" on server - "${serverName}" from account - "${accountName}" sent successfully`
            });
            break;
          }
        }
        if (error) {
          setBadOpeartion(prev => prev += 1);
        } else {
          setGoodOpeartion(prev => prev += 1);
        }
        if (i + 1 !== randomizeOperationList.length) {
          const time = randomNum(SLEEP_TIME[0], SLEEP_TIME[1]);
          setLogs(prev => [...prev, {
            msg: '\n' + `Waiting ${Math.floor(time / 1000)}s next account` + '\n\n',
            color: ''
          }]);
          await sleep(time);
        }
      }
      if (infinity) {
        setLogs(prev => [...prev, {
          msg: '\n\n' + `Spam session ended!\n\n`,
          color: 'green'
        }]);
      }
    };
    const changeDate = milliseconds => {
      const nextDate = Date.now() + milliseconds;
      const formatDate = new Date(nextDate).toString();
      setNextDate(formatDate);
    };
    if (infinity) {
      const milliseconds = RESTART_TIME * 3600 * 1000;
      run(true);
      changeDate(milliseconds);
      setInterval(() => {
        run(true);
        changeDate(milliseconds);
      }, milliseconds);
    } else {
      run();
    }
    if (!infinity) {
      setLogs(prev => [...prev, {
        msg: '\n\n' + `Successefully completed! Waiting 10s to redirect at home!`,
        color: 'green'
      }]);
      loggerService.addLog({
        type: 'INFO',
        msg: `end send spam msg`
      });
      setTimeout(() => {
        setRunnig(false);
        changeScreen('main');
      }, 10000);
    }
  };
  const handlerSelectMainScreen = ({
    value
  }) => {
    if (value === 'while' && RESTART_TIME) {
      setRunnig(true);
      setInfinity(true);
      runOperations(true);
    }
    if (value === 'run') {
      setRunnig(true);
      runOperations();
    }
    if (value === 'back') {
      changeScreen('main');
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column",
    marginTop: 1,
    marginBottom: 5,
    flexGrow: 2,
    width: "100%",
    padding: 1
  }, !isRunnig ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    justifyContent: "space-between",
    padding: 1
  }, /*#__PURE__*/React.createElement(Text, null, "press ", /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "\u2190"), " to flip left | press ", /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "\u2192"), " to flip right")), /*#__PURE__*/React.createElement(Table, {
    data: currentData
  }), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Text, null, "Show: ", page * countRow - countRow + 1, " - ", page * countRow > data.length ? data.length : page * countRow, " / ", data.length))) : /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column",
    padding: 1
  }, logs.map(({
    color,
    msg
  }, i) => /*#__PURE__*/React.createElement(Text, {
    key: i,
    color: color
  }, msg)))), /*#__PURE__*/React.createElement(Box, {
    position: "absolute",
    height: "100%",
    display: "flex",
    alignItems: "flex-end"
  }, !isRunnig && /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(SelectInput, {
    indicatorComponent: CustomIndicator,
    itemComponent: CustomItem,
    items: items,
    onSelect: handlerSelectMainScreen
  })), isRunnig && !infinity && /*#__PURE__*/React.createElement(Box, {
    padding: 1
  }, /*#__PURE__*/React.createElement(Text, null, "[", /*#__PURE__*/React.createElement(Text, {
    color: 'green'
  }, goodOperation), "/", /*#__PURE__*/React.createElement(Text, {
    color: 'red'
  }, badOperation), "/", operationList.length, "] - success operations / bad operations / all operations")), infinity && /*#__PURE__*/React.createElement(Box, {
    padding: 1
  }, /*#__PURE__*/React.createElement(Text, null, "Next spam session: ", nextDate))));
};
const SmartScreen = ({
  changeScreen
}) => {
  const handlerSelectMainScreen = ({
    value
  }) => {
    if (value === 'back') {
      changeScreen('main');
    }
  };
  const items = [{
    label: '# Back',
    value: 'back'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column",
    marginTop: 1,
    marginBottom: 5,
    flexGrow: 2,
    width: "100%",
    padding: 1
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(Text, null, "Smart Chating - \u044D\u0442\u043E \u0440\u0435\u0432\u043E\u043B\u044E\u0446\u0438\u043E\u043D\u043D\u0443\u044E \u0444\u0443\u043D\u043A\u0446\u0438\u044F \u0441 \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u0438\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u043E\u043C, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u0441\u0442\u0430\u043D\u0435\u0442 \u0432\u0430\u0448\u0438\u043C \u043D\u0435\u0437\u0430\u043C\u0435\u043D\u0438\u043C\u044B\u043C \u043F\u043E\u043C\u043E\u0449\u043D\u0438\u043A\u043E\u043C \u0432 Discord! ", '\n'), /*#__PURE__*/React.createElement(Text, null, "- \u0421\u0443\u043F\u0435\u0440\u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C: \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442 \u043C\u0443\u043B\u044C\u0442\u0438\u044F\u0437\u044B\u043A\u043E\u0432\u044B\u0435 \u043E\u0442\u0432\u0435\u0442\u044B \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F, \u044D\u043A\u043E\u043D\u043E\u043C\u044F \u0432\u0430\u0448\u0435 \u0432\u0440\u0435\u043C\u044F \u0438 \u043D\u0435\u0440\u0432\u044B. ", '\n', "  \u0418\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0438\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442 \u043C\u043E\u043B\u043D\u0438\u0435\u043D\u043E\u0441\u043D\u043E \u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430, \u0432\u044B\u0434\u0430\u0432\u0430\u044F \u043E\u0441\u0442\u0440\u043E\u0443\u043C\u043D\u044B\u0435 \u0438 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u044B\u0435 \u0440\u0435\u043F\u043B\u0438\u043A\u0438, \u0434\u0435\u043B\u0430\u044F \u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u043D\u044B\u043C \u0438 \u0443\u0432\u043B\u0435\u043A\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C."), /*#__PURE__*/React.createElement(Text, null, "- \u0421\u0443\u043F\u0435\u0440\u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C: Smart Chating \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442 \u0443\u0432\u043B\u0435\u043A\u0430\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u0438\u0441\u0442\u043E\u0440\u0438\u044E, \u0441\u0442\u0438\u0445\u043E\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u0435, \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439 \u0438\u043B\u0438 \u0434\u0430\u0436\u0435 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443 - \u0432\u0441\u0435\u0433\u043E \u043E\u0434\u043D\u0438\u043C \u043A\u043B\u0438\u043A\u043E\u043C! ", '\n', "  \u042D\u0442\u0430 \u0444\u0443\u043D\u043A\u0446\u0438\u044F \u043F\u043E\u043C\u043E\u0436\u0435\u0442 \u0432\u0430\u043C \u0441\u0442\u0430\u0442\u044C \u0437\u0432\u0435\u0437\u0434\u043E\u0439 Discord \u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C WL \u0440\u043E\u043B\u044C."), /*#__PURE__*/React.createElement(Text, null, "- \u0421\u0443\u043F\u0435\u0440\u0432\u043B\u0438\u044F\u043D\u0438\u0435: \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 Smart Chating \u043F\u0440\u043E\u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u043A\u043E\u043D\u0442\u0435\u043D\u0442 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0438 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u043F\u043E\u0441\u043B\u0435 \u0447\u0435\u0433\u043E \u043F\u043E\u0434\u0431\u0435\u0440\u0435\u0442 \u0441\u0430\u043C\u044B\u0435 \u0442\u043E\u0447\u043D\u044B\u0435 \u0438 \u0443\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B, ", '\n', "  \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u0432\u043E\u0435\u0432\u0430\u0442\u044C \u0430\u0432\u0442\u043E\u0440\u0438\u0442\u0435\u0442 \u0438 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u0440\u0443\u0433\u0438\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439. ", '\n'), /*#__PURE__*/React.createElement(Text, null, "\u0412\u0435\u0441\u043E\u043C\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C Smart Chating: ", '\n'), /*#__PURE__*/React.createElement(Text, null, "- \u0411\u043E\u043B\u044C\u0448\u0435 \u0440\u043E\u043B\u0435\u0439: \u0427\u0435\u043C \u0430\u043A\u0442\u0438\u0432\u043D\u0435\u0435 \u0432\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0435 Smart Chating, \u0442\u0435\u043C \u0431\u043E\u043B\u044C\u0448\u0435 \u043E\u043F\u044B\u0442\u0430 \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0435, \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044F \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u044D\u043A\u0441\u043A\u043B\u044E\u0437\u0438\u0432\u043D\u044B\u043C \u0440\u043E\u043B\u044F\u043C \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430\u0445."), /*#__PURE__*/React.createElement(Text, null, "- \u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u0440\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u044F: \u0414\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u0432\u043E\u0438 \u0437\u043D\u0430\u043D\u0438\u044F \u0438 \u043D\u0430\u0432\u044B\u043A\u0438 \u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u0418\u0418, \u043F\u0440\u0438\u043E\u0431\u0440\u0435\u0442\u0430\u044F \u0430\u0432\u0442\u043E\u0440\u0438\u0442\u0435\u0442 \u0438 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435, \u0447\u0442\u043E \u0432\u0435\u0434\u0435\u0442 \u043A \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044E \u043D\u043E\u0432\u044B\u0445 \u0440\u043E\u043B\u0435\u0439. ", '\n'), /*#__PURE__*/React.createElement(Text, null, "Smart Chating - \u043F\u043B\u0430\u0442\u043D\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u044F, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u0431\u0443\u0434\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438.", '\n'), /*#__PURE__*/React.createElement(Text, null, "Smart Chating - \u0431\u0443\u0434\u044C Smart!"), /*#__PURE__*/React.createElement(Text, null, "\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0431\u043E\u043B\u044C\u0448\u0435: Telegram: ", /*#__PURE__*/React.createElement(Text, {
    color: 'blueBright'
  }, "@i_66_77")))), /*#__PURE__*/React.createElement(Box, {
    position: "absolute",
    height: "100%",
    display: "flex",
    alignItems: "flex-end"
  }, /*#__PURE__*/React.createElement(Box, {
    display: "flex",
    flexDirection: "column"
  }, /*#__PURE__*/React.createElement(SelectInput, {
    indicatorComponent: CustomIndicator,
    itemComponent: CustomItem,
    items: items,
    onSelect: handlerSelectMainScreen
  }))));
};
render( /*#__PURE__*/React.createElement(App, null));
