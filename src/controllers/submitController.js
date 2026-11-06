import { submitCodeService } from "../services/submitService.js";

export const submitCode = async (req, res) => {

    try {

        console.log("\n==============================");
        console.log("📥 SUBMIT REQUEST");
        console.log("==============================");

        console.log("BODY:", req.body);
        console.log("USER:", req.user);


        // ==========================================
        // GET DATA FROM REQUEST
        // ==========================================

        const {
            contestCode,
            questionId,
            code,
            language
        } = req.body;


        // User ID JWT middleware मधून
        const userId =
            req.user?.id ||
            req.user?._id;


        console.log("Contest Code:", contestCode);
        console.log("User ID:", userId);
        console.log("Question ID:", questionId);
        console.log("Language:", language);


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!contestCode) {

            return res.status(400).json({
                success: false,
                message: "Contest code is required."
            });
        }


        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "User authentication required."
            });
        }


        if (!questionId) {

            return res.status(400).json({
                success: false,
                message: "Question ID is required."
            });
        }


        if (!code) {

            return res.status(400).json({
                success: false,
                message: "Code is required."
            });
        }


        if (!language) {

            return res.status(400).json({
                success: false,
                message: "Language is required."
            });
        }


        // ==========================================
        // CALL SERVICE
        // ==========================================

        const result = await submitCodeService({

            contestCode,

            userId,

            questionId,

            code,

            language
        });


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Code submitted successfully.",

            data: result
        });


    } catch (error) {

        console.error(
            "Submit code Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message: error.message
        });
    }
};


// import {submitCodeService } from "../services/submitService.js";

// export const submitCode = async (req, res) => {
//     try {
//         const result = await submitCodeService(
//             req.user,
//             req.body
//         );

//         return res.status(200).json({
//             success: true,
//             data: result,
//         });
//     } catch (error){
//         console.error(
//             "Submit code Error:",
//             error
//         );
//         return res.status(400).json({
//             success: false,
//             error: error.message,
//         });
//     }
// };