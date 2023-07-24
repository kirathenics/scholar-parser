import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    profileLink: {
        type: String,
        required: true,
        unique: true,
    },
    imageLink: {
        type: String,
        required: true,
    },
    faculty: {
        type: String,
        //required: true,
        default: 'Не определен',
    },
    department: {
        type: String,
        //required: true,
        default: 'Не определена',
    },
    title: {
        type: String,
        //required: true,
        default: 'Не определено',
    },
    cited: {
        type: Number,
        default: 0,
        //required: true,
    },
    hIndex: {
        type: Number,
        default: 0,
        //required: true,
    },
    i10Index: {
        type: Number,
        default: 0,
        //required: true,
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
    },
    position: {
        type: String,
        default: 'Не определен',
    }
}, { collection: 'profiles' }/*{ timestamps: true }*/)

export default mongoose.model('ProfileSchema', ProfileSchema)