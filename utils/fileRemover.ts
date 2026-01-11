import fs from 'fs';

const removeFile = (filePath: string | null | undefined): void => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err: any) {
        console.error(`Error removing file at ${filePath}:`, err.message);
    }
};

export default removeFile;
