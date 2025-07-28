import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required:true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true,
        default: false
    }
}, {timestamps: true});

export const Todo = mongoose.model('Todo', todoSchema);