import dotenv from 'dotenv'
import updateData from './updateDatabase.js'
import parse from './parser.js'

(async () => {
    await dotenv.config()
    let start = (new Date()).getTime()
    await parse()
    //await updateData()
    let end = (new Date()).getTime()
    console.log(end - start)
})();
