import fs from "fs";

export const deleteTempFolder = (tempDir) => {
    try {
        fs.rmSync(tempDir, {
            recursive: true,
            force: true
        });
       
    } catch (err){
        console.error(`Error while deleting temp folder ${tempDir}:`, err);
    }
        
    };
