import React, { useState } from "react";
import axios from "axios";

function ExcelUploader() {
    const [file, setFile] = useState(null);

    const handleDownload = () => {
        window.location.href = "http://localhost:3001/download-excel";
    };

    const handleUpload = async () => {
        if (!file) return alert("Select a file first!");

        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post("http://localhost:3001/upload-excel", formData);
            alert("File uploaded successfully!");
        } catch (err) {
            alert("Upload failed!");
        }
    };

    return (
        <div>
            <button onClick={handleDownload}>Download Excel</button> <br /> <br />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Upload Excel</button>
        </div>
    );
}

export default ExcelUploader;
