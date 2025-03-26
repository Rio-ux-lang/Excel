const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const db = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'excel',
    port: 4000  
};

const conn = mysql.createConnection(db);

conn.connect((err) => {
    if (err) {
        console.log("Mysql connection failed");
        return;
    } 
    console.log("MySql Connection success");  
});

app.get("/download-excel", (req, res) => {
    const query = "SELECT name, email, due_date FROM info";

    conn.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ error: "Database Query Failed" });
        }

        const worksheet = xlsx.utils.json_to_sheet(results);

        // Apply formatting for the due_date column
        const range = xlsx.utils.decode_range(worksheet["!ref"]);
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
            const cellRef = xlsx.utils.encode_cell({ r: row, c: 2 }); // Column index 2 (due_date)
            if (worksheet[cellRef] && worksheet[cellRef].v) {
                worksheet[cellRef].z = "yyyy-mm-dd"; // Format as Date (YYYY-MM-DD)
            }
        }

        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Users");

        const dir = "./downloads";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = `${dir}/users.xlsx`;
        xlsx.writeFile(workbook, filePath);

        res.download(filePath, "users.xlsx", (err) => {
            if (err) console.error("File Download Error:", err);
            fs.unlinkSync(filePath);
        });
    });
});

const upload = multer({ dest: "uploads/" });

app.post("/upload-excel", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Function to properly parse dates from Excel
    const parseExcelDate = (excelDate) => {
        if (!excelDate) return null; // Handle empty or undefined dates
        if (typeof excelDate === "number") {
            return new Date((excelDate - 25569) * 86400000).toISOString().split("T")[0];
        }
        return new Date(excelDate).toISOString().split("T")[0];
    };

    // Convert all rows to proper format before inserting
    const values = sheetData.map((row) => [
        row.name, 
        row.email, 
        parseExcelDate(row.due_date)
    ]);

    if (values.length === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "No valid data in the file" });
    }

    console.log("Parsed values before DB insert:", values); // Debugging log

    // SQL Query with Duplicate Handling
    const query = `
        INSERT INTO info (name, email, due_date)
        VALUES ? 
        ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        due_date = VALUES(due_date)`;

    conn.query(query, [values], (err) => {
        fs.unlinkSync(filePath); // Delete the uploaded file
        if (err) {
            console.error("Database Insert/Update Error:", err);
            return res.status(500).json({ error: "Database Operation Failed" });
        }
        res.json({ success: true, message: "Data Inserted/Updated Successfully" });
    });
});


app.listen(3001, () => {
    console.log("Server running on port 3001");
});