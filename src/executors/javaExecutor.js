import fs from "fs";
import path from "path";
import { exec } from "child_process";

import { createTempFolder } from "../utils/createTempFolder.js";
import { deleteTempFolder } from "../utils/deleteTempFolder.js";
import { dockerCommand } from "../utils/dockerCommand.js";

export const runJava = (code, input = "") => {

    const tempDir = createTempFolder();

    const filePath = path.join(tempDir, "Main.java");
    const inputPath = path.join(tempDir, "input.txt");

    fs.writeFileSync(filePath, code, "utf8");
    fs.writeFileSync(inputPath, input, "utf8");

    const command = dockerCommand(
        "sandbox-java",
        tempDir,
        "javac Main.java && java Main < input.txt"
    );

    console.log("Java Docker Command:", command);
    console.log("Java Test Input:", JSON.stringify(input));

    return new Promise((resolve) => {

        exec(
            command,
            {
                timeout: 5000,
                windowsHide: true,
            },
            (error, stdout, stderr) => {

                deleteTempFolder(tempDir);

                if (error) {

                    if (error.killed) {
                        resolve({
                            success: false,
                            error: "Execution timed out",
                        });
                        return;
                    }

                    resolve({
                        success: false,
                        error: stderr || error.message,
                    });
                    return;
                }

                resolve({
                    success: true,
                    output: stdout.trim(),
                });
            }
        );
    });
};


// import fs from "fs";
// import path from "path";
// import { exec } from "child_process";

// import { createTempFolder } from '../utils/createTempFolder.js';
// import { deleteTempFolder } from '../utils/deleteTempFolder.js';
// import { dockerCommand } from '../utils/dockerCommand.js';

// export const runJava = (code) => {
//     const tempDir = createTempFolder();

//     const filePath = path.join(tempDir, "Main.java");
//     fs.writeFileSync(filePath, code);

//     const command = dockerCommand("sandbox-java", tempDir);

//     return new Promise((resolve) => {
//         exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
//             deleteTempFolder(tempDir);

//             if(error){
//                 if(error.killed){
//                     resolve({
//                         success: false,
//                         error: "Execution timed out"
                    
//                     });


//                 } else {
//                     resolve ({
//                         success: false,
//                         error: stderr || error.message
//                     });
//                 }
                    
//                 } else {
//                     resolve({
//                         success: true,
//                         output: stdout
//                     });
//                 } 
            
//         });
//     });
// };