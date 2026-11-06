export const dockerCommand = (
    dockerImage,
    tempDir,
    runCommand
) => {

    const dockerSafePath = tempDir.replace(/\\/g, "/");

    return `docker run --rm --net none -v "${dockerSafePath}:/app" ${dockerImage} sh -c "${runCommand}"`;
};


// export const dockerCommand = (dockerImage, tempDir) => {
//     const dockerSafePath = tempDir.replace(/\\/g, "/");

//     return `docker run --rm --net none -v "${dockerSafePath}:/app" ${dockerImage}`;
// };