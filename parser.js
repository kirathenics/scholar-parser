import puppeteer from 'puppeteer'
import mongoose from 'mongoose'
import ProfileSchema from './models/Profile.js'

const googleScholarLink = 'https://scholar.google.com'
const URLlink = 'https://scholar.google.com/citations?hl=ru&view_op=search_authors&mauthors=bstu.by&btnG='
const dataBaseURL = 'mongodb+srv://admin:eeeeee@clustercitations.isavmzv.mongodb.net/scholarData?retryWrites=true&w=majority'
//const URLlink = 'https://scholar.google.com/citations?view_op=search_authors&hl=ru&mauthors=bstu.by&before_author=Rdw5_wIAAAAJ&astart=360'
//const URLlink = 'https://scholar.google.com/citations?view_op=search_authors&hl=ru&mauthors=bstu.by&before_author=HfHN_gIAAAAJ&astart=380'

function convertString(str) {
    const regex = /[\u0400-\u04FF\.]+/g
    let ArrRegexResult = str.match(regex)
    if (!ArrRegexResult) return str
    let regexResult = ArrRegexResult.join(' ')

    let count = 0;
    let result = ''
    for (let index = 0; index < regexResult.length; index++) {
        if (regexResult[index] === ' ') count++
        if(count === 3) break
        result += regexResult[index]
    }

    return result
}

const parse = async () => {
    mongoose.connect(dataBaseURL)
    .catch(error => console.log(`Database connection error\n${error}`))
    //await ProfileSchema.deleteMany({})

    const browser = await puppeteer.launch( { headless: true } )
    const page = await browser.newPage()
    await page.goto(URLlink)

    //let i = 0
    //for (let index = 0; index < 1; index++) {
    while(await page.$('button.gsc_pgn_pnx[disabled]') === null) {
        //i++
        //console.log(i)
        await page.waitForSelector('a.gs_ai_pho')
        const arrProfileLinks = await page.$$eval('a.gs_ai_pho', arr => arr.map(element => element.href))

        await Promise.all(arrProfileLinks.map(async (element) => {
            const newPa = await browser.newPage()
            await newPa.goto(element)

            /*await newPa.waitForSelector('#gsc_prf_pup-img')*/ //временно убрал
            let fullName = await newPa.$eval('#gsc_prf_pup-img', element => element.getAttribute('alt'))
            fullName = await convertString(fullName)
            let imgURL = await newPa.$eval('#gsc_prf_pup-img', element => element.getAttribute('src'))
            if (imgURL[0] === '/') imgURL = `${googleScholarLink}${imgURL}`
            let res = await newPa.$$eval('td.gsc_rsb_std', arr => arr.map(element => element.innerText))
            res = await res.filter( (element, index) => index % 2  === 0 )
            const cited = (typeof res[0] !== 'undefined') ? res[0] : '0'
            const hIndex = (typeof res[1] !== 'undefined') ? res[1] : '0'
            const i10Index = (typeof res[2] !== 'undefined') ? res[2] : '0'

            const arrCit = await newPa.$$eval('a.gsc_g_a', arr => arr.map((element, index) => {
                return { 
                    'year': new Date().getFullYear() - arr.length + index + 1,
                    'cited': element.innerText,
                }}))

            const filter = { profileLink: element }
            const update = {
                fullName: fullName,
                imageLink: imgURL,
                cited: parseInt(cited),
                hIndex: parseInt(hIndex),
                i10Index: parseInt(i10Index),
                citationArray: arrCit,
            }
            await ProfileSchema.findOneAndUpdate(filter, { $set: update }, { new: true, upsert: true })//.then(err => console.log(err))

            /*const profile = new ProfileSchema({
                fullName: fullName,
                profileLink: element,
                imageLink: imgURL,
                cited: parseInt(cited),
                hIndex: parseInt(hIndex),
                i10Index: parseInt(i10Index),
                citationArray: arrCit,
            })
            await profile.save()*/

            await newPa.close()
        }))
        
        /*await page.waitForSelector('button.gsc_pgn_pnx')*/ //временно убрал
        await page.click('button.gsc_pgn_pnx')
    }

    await browser.close()
    await mongoose.disconnect()
}

export default parse