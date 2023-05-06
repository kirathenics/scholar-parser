import updateData from './updateDatabase.js'
import parse from './parser.js'
//import { sorting } from './sortArray.js'

(async () => {
    let start = (new Date()).getTime()
    //await parse()
    await updateData()
    let end = (new Date()).getTime()
    console.log(end - start)
    
    /*let profiles = [
        {name: "John", age: 30},
        {name: "Bob", age: 25},
        {name: "Alice", age: 35}
    ]
    
    console.log(profiles)
    profiles = await sorting(profiles, 'age', -1)
    console.log(profiles)*/
})();
