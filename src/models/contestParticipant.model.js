import mongoose from 'mongoose';

const contestParticipantSchema = new mongoose.Schema(
    {
        contest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contest',
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        score: {
            type: Number,
            default: 0,
        },

        penalty: {
            type: Number,
            default: 0,
        },

        wrongAttempts: {
            type: Number,
            default: 0,
        },

        solvedQuestions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            },
        ],

        joinedAt: {
            type: Date,
            default: Date.now,
        },

        finishedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const ContestParticipant = mongoose.model(
    "ContestParticipant",
    contestParticipantSchema
);

export default ContestParticipant;