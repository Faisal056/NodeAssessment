const jwt = require('jsonwebtoken');
const axios = require('axios');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'Token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.userId = decoded.id;
        next();
    });
}

const downloadContents = async (urls) => {
    try {
        const downloadPromises = urls.map(async (url) => {
            const response = await axios.get(url);
            return response.data;
        });

        const contents = await Promise.all(downloadPromises);

        return contents;
    } catch (error) {
        console.error('Error downloading contents:', error.message);
        throw error;
    }
}

const fetchDataUtils = async (apiEndpoint) => {
    try {
        const response = await axios.get(apiEndpoint);

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error(`Error: Received unexpected status code ${response.status}`);
            throw new Error(`Unexpected status code: ${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
            if (error.response.status === 404) {
                console.error('Resource not found.');
            }
        } else if (error.request) {
            console.error('Error: No response received from the server.');
        } else {
            console.error('Error:', error.message);
        }

        if (error.code === 'ECONNABORTED') {
            console.error('Error: Request timed out.');
        } else if (error.code === 'ENOTFOUND') {
            console.error('Error: Unable to resolve the server hostname.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Error: Connection refused by the server.');
        }

        throw error;
    }
}

// Problem 3: File System Operations
const listFilesWithExtension = (directoryPath, fileExtension) => {
    try {
        const files = fs.readdirSync(directoryPath);

        const filteredFiles = files.filter(file => path.extname(file) === fileExtension);

        console.log(`Files with extension ${fileExtension} in ${directoryPath}:`);
        filteredFiles.forEach(file => {
            console.log(file);
        });

        return filteredFiles;
    } catch (error) {
        console.error('Error reading directory:', error.message);
        return [];
    }
}

module.exports = { verifyToken, downloadContents, fetchDataUtils, listFilesWithExtension };