export default (str) => {
    const [userInfo, urlInfo] = str.split('@')
    const [login, password] = userInfo.split(':')
    const [address, port] = urlInfo.split(':')

    return `http://${login}:${password}@${address}:${port}`
}