import { compileService } from "../services/compileService.js";

export const compileCode = async (req, res) => {
    try {

        const {
            code,
            language,
            roomId,
            input
        } = req.body;

        console.log("📥 CONTROLLER INPUT:", {
            language,
            roomId,
            input
        });

        if (!code || !language || !roomId) {
            return res.status(400).json({
                success: false,
                error: "Code, Language, and Room ID are required"
            });
        }

        const result = await compileService(
            code,
            language,
            roomId,
            input || ""
        );

        return res.status(202).json(result);

    } catch (error) {

        console.error("compile controller Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};


// import { compileService } from "../services/compileService.js";


// export const compileCode = async (req, res)=> {
//     try {
//         const { code, language, roomId} = req.body;

//         if(!code || !language || !roomId) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Code, Language, and Room ID are required"
//             });
//         }

//         const result = await compileService(code, language, roomId);

//         return res.status(202).json(result);
//     } catch (error) {
//         console.error("compile controller Error:");
//         console.error(error);

//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// };

