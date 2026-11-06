import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
    {
        contestCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
            },
        ],

        participants: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ContestParticipant",
            }
        ],

        duration: {
            type: Number,
            default: 30,
        },

        status: {
            type: String,
            enum: ["waiting", "running", "ended"],
            default: "waiting",
        },

        maxParticipants: {
            type: Number,
            default: 5,
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "private",
        },

        startTime: {
            type: Date,
            default: null,
        },

        endTime: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Contest = mongoose.model("Contest", contestSchema);

export default Contest;