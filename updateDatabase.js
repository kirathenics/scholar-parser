import mongoose from 'mongoose'
import { ProfileSchema, FacultySchema, DepartmentSchema, TitleSchema } from './models/index.js'

const makeTop = async () => {
    ProfileSchema.find()
        .sort({cited: -1})
        .exec((error, profiles) => {
            if (error) {
                console.error(error)
                return
            }

            let count = 0
            for (let index = 0; index < profiles.length; index++) {
                const profile = profiles[index]

                if (profile.profileLink === 'name') continue
                if (count < 30) {
                    profile.position = 'top30'
                } else if (count < 310) {
                    profile.position = 'top310'
                } else break
                count++

                profile.save(error => {
                    if (error) console.error(error)
                })
            }
    })
}

const computeI10index = async (array) => {
    array.sort((a, b) => a - b)
  
    for (let i = 0; i < array.length; i++) {
        if (array.length - i <= array[i]) {
            return array.length - i
        }
    }
  
    return array.length + 1
}

const findAndUpdate = async (CollectionSchema, key) => {
    try {
        // const resultInfo = await ProfileSchema.aggregate([
        //     {
        //         $group: {
        //             _id: key,
        //             amount: { $sum: 1 },
        //             total_cited: { $sum: '$cited' },
        //             total_h_index: { $sum: '$hIndex' },
        //             total_i10_index: { $sum: '$i10Index' },
        //         }
        //     }
        // ])
        const resultInfo = await ProfileSchema.aggregate([
            {
                $group: {
                    _id: key,
                    amount: { $sum: 1 },
                    total_cited: { $sum: '$cited' },
                    total_h_index: { $sum: '$hIndex' },
                    total_i10_index: { 
                        $push: '$hIndex'
                    },
                }
            }
        ])

        for (let index = 0; index < resultInfo.length; index++) {
            resultInfo[index].total_i10_index = await computeI10index(resultInfo[index].total_i10_index)
            // console.log(resultInfo[index])
        } 

        const resultCitArray = await ProfileSchema.aggregate([
            {
                $unwind: '$citationArray'
            },
            {
                $group: {
                    _id: {
                        name: key,
                        year: '$citationArray.year'
                    },
                    total_cited: { $sum: '$citationArray.cited' }
                }
            },
            {
                $sort: { '_id.year': 1 }
            },
            {
                $group: {
                    _id: '$_id.name',
                    cited_by_year: { $push: { year: '$_id.year', cited: '$total_cited' } }
                }
            }
        ])

        await Promise.all(resultInfo.map(async (element) => await CollectionSchema.findOneAndUpdate(
            { 
                name: element._id 
            }, 
            { 
                amount: element.amount, 
                cited: element.total_cited, 
                hIndex: element.total_h_index, 
                i10Index: element.total_i10_index,
            }, { new: true, upsert: true }
        )))

        await Promise.all(resultCitArray.map(async (element) => await CollectionSchema.findOneAndUpdate(
            { 
                name: element._id 
            }, 
            { 
                citationArray: element.cited_by_year
            }, { new: true, upsert: true }
        )))
    } catch (error) {
        console.log(error)
    }
}

const updateData = async () => {
    await mongoose.connect(process.env.DB_CONN)
    .catch(error => console.log(`Database connection error\n${error}`))

    await makeTop()
    // await findAndUpdate(FacultySchema, '$faculty')
    // await findAndUpdate(DepartmentSchema, '$department')
    // await findAndUpdate(TitleSchema, '$title')

    await mongoose.disconnect()
}

export default updateData