import xlsx from 'xlsx';
import parseUserAgentString from '../utils/parseUserAgentString.js';

class ExcelService {

    getDataFromFile(path) {
        const workbook = xlsx.readFile(path)

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data = xlsx.utils.sheet_to_json(worksheet);

        return data
    }

    compraseData(data) {
        return data.map(item => {
            const { os, bv, osv } = parseUserAgentString(item.User_Agent)

            let token = ''
            if (item['Discord_Token']) {
                token = item['Discord_Token'].slice(0, 6) + '....' + item['Discord_Token'].slice(-6)
            }

            let proxy = ''

            if (item.HTTP_Proxy) {
                proxy = item.HTTP_Proxy.split('@')[1]
            }

            return {
                ...item,
                User_Agent: `${os} ${osv} ${bv}`,
                Discord_Token: token,
                HTTP_Proxy: proxy
            }
        })
    }

}

export default new ExcelService()