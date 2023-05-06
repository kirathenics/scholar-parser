import mongoose from 'mongoose'

const TitleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        default: 0,
    },
    cited: {
        type: Number,
        default: 0,
    },
    hIndex: {
        type: Number,
        default: 0,
    },
    i10Index: {
        type: Number,
        default: 0,
    },
    citationArray: {
        type: [
            {
                year: {
                    type: Number,
                    default: 0,
                },
                cited: {
                    type: Number,
                    default: 0,
                }
            }
        ],
        default: []
    }
}, { collection: 'titles' })

export default mongoose.model('TitleSchema', TitleSchema)