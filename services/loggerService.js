import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import { format } from 'date-fns'

const dirPath = path.dirname(fileURLToPath(import.meta.url))

class LoggerService {
    logFileName = 'logs.txt'

    constructor() {
        this.logFilePath = path.resolve(path.join(dirPath, '../data/' + this.logFileName))
    }

    addLog({ msg, type }) {
        let message = format(new Date(), 'HH:mm:ss dd-MM-yyyy') + " | "

        if (type === 'ERROR') {
            message += type + "   | "
        }

        if (type === 'INFO') {
            message += type + "    | "
        }

        if (type === 'SUCCESS') {
            message += type + " | "
        }

        if (!msg) {
            return
        }

        if (typeof msg === 'string') {
            message += msg
        } else {
            message += JSON.stringify(msg)
        }

        fs.appendFileSync(this.logFilePath, message + '\n', (err) => {
            if (err) {
                console.log(err)
                return
            }
        })
    }

}

export default new LoggerService()