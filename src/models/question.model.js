import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
    input: {
        type: String,
        required: true,
    
    },
    output: {
        type: String,
        required: true,
    },
    isHidden: {
        type: Boolean,
        default: true,
    },
},
{_id: false }

);


const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },
         
        constraints: {
            type: String,
            default: "",
        },

        examples: [
            {
                input: String,
                output: String,
                explanation: String,
            },
        ],

        testCases: [testCaseSchema],

        tags: [
            {
                type: String,
            },
        ],

        timeLimit: {
            type: Number,
            default: 2,
        },

        memoryLimit: {
            type: Number,
            default: 256,
        },

    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;