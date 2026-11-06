import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTempFolder = () => {
    const runId = uuidv4();
    const tempDir = path.join(__dirname, "..", `temp_${runId}`);

    fs.mkdirSync(tempDir, { recursive: true });

    return tempDir;

};

