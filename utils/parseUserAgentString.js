export default (userAgentString) => {

    if (!userAgentString) {
        return { os: '', bv: '', osv: '' }
    }

    const userAgentInfo = {
        os: '',
        bv: '',
        osv: ''
    }

    if (/Windows/.test(userAgentString)) {
        userAgentInfo.os = "Windows";
    } else if (/Macintosh|Mac OS X/.test(userAgentString)) {
        userAgentInfo.osName = "Mac OS X";
    }

    const osVersionMatch = userAgentString.match(/(?:Windows NT|Mac OS X) ([0-9._]+)/);
    if (osVersionMatch) {
        userAgentInfo.osv = osVersionMatch[1];
    }

    const browserVersionMatch = userAgentString.match(/Chrome\/([0-9.]+)/);
    if (browserVersionMatch) {
        userAgentInfo.bv = browserVersionMatch[1];
    }

    return userAgentInfo;
} 