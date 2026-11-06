import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
    {
        contest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },

        code: {
            type: mongoose.Schema.Types.String,
            required: true,
        },

        language: {
        type: String,
        enum: ["cpp", "java", "python", "c"],
        required: true,
        },

        verdict: {
            type: String,
            enum:[
                "Accepted",
                "Wrong Answer",
                "Time Limit Exceeded",
                "Compilation Error",
                "Runtime Error",
            ],
            default: "Wrong Answer",
        },

        executionTime: {
            type: Number,
            default: 0,
        },

        memoryUsed: {
            type: Number,
            default: 0,
        },

        score: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;