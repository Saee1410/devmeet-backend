import Question from "../models/question.model.js";

export const createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            data: question,
        });
    } catch (error){
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};