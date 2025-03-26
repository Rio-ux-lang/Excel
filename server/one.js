const express= require('express');
const nodemailer= require('nodemailer');
const mysql2=require('mysql2');
const cors=require('cors');

const app= express();
app.use(cors());
app.use(express.json());


const db={
    host:'localhost',
    user:'root',
    password:'',
    database:'task',
    port: 4000  
}

const conn= mysql2.createConnection(db);

conn.connect((err)=>{
    if(err){
        console.log("Mysql connection failed");
        return
    } 
    console.log("MySql Connection success");  
})


const transPorter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'ananthliterature@gmail.com',
        pass:'smwa gqfy bodl zhcb',
    }
})

const sendReminderEmails = () => {
    console.log("Checking for users who need email reminders...");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; 

    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30); 
    const nextMonthStr = nextMonth.toISOString().split("T")[0];

    const query = `
        SELECT id, email, subject, content, due_date, last_email_sent 
        FROM users 
        WHERE due_date BETWEEN ? AND ? 
        AND (last_email_sent IS NULL OR last_email_sent < ?)
    `;                                    
                                    //  2025-03-25 < 2025-03-26

    conn.query(query, [todayStr, nextMonthStr, todayStr], (err, users) => {
        if (err) {
            console.log("Database Query Error:", err);
            return;
        }
        if (users.length === 0) {
            console.log("No users found for email reminders.");
            return;
        }

        users.forEach((user) => {
            const mailOptions = {
                from: "ananthliterature@gmail.com",
                to: user.email,
                subject: user.subject,
                text: user.content,
            };

            transPorter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(`Error sending email to ${user.email}:`, err);
                } else {
                    console.log(`Email sent to ${user.email}`);

                    const updateQuery = `UPDATE users SET last_email_sent = ? WHERE id = ?`;
                    conn.query(updateQuery, [todayStr, user.id], (err, result) => {
                        if (err) {
                            console.log(`Error updating last_email_sent for ${user.email}:`, err);
                        } else {
                            console.log(`Updated last_email_sent for ${user.email}`);
                        }
                    });
                }
            });
        });
    });
};


sendReminderEmails()
setInterval(sendReminderEmails, 24 * 60 * 60 * 1000);


app.post('/email',(req,res)=>{
   const {name,receive,dueDate,subject,body} = req.body;

   const query = "INSERT INTO users (name,email,due_date,subject,content) VALUES (?, ?, ?, ?, ?)";
   
   conn.query(query,[name,receive,dueDate,subject,body],(err,info)=>{
    if(err){
            console.log("Can't insert the data");
    return  res.status(400).json({success:false, message: "Server Error"});
    } 
            console.log("Successfully insert the data");
    return res.status(200).json({success:true, message:"Success"})
   })
})


app.get("/email/get",(req,res)=>{
    const query = "SELECT * FROM users";
    conn.query(query,(err,result)=>{
        if(err) throw err;
        res.json(result);
        return console.log("Successfullly fetch data");
        
    })
})


app.listen(3001,(err)=>{
    if(err) throw err;
    console.log('Post Listening on 3001');
})
