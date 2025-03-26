const express = require("express");
const cors= require("cors");
const mysql= require("mysql");
const nodeMailer=require("nodemailer");

const app = express(); 
app.use(cors());
app.use(express.json());

const db={
    host:'localhost',
    user:'root',
    password:'',
    database:'task',
    port: 4000  
}

const conn = mysql.createConnection(db);

conn.connect((err)=>{
    if(err){
        console.log("Mysql connection failed");
        return
    } 
    console.log("MySql Connection success");  
})

const transPorter= nodeMailer.createTransport({
    service:"gmail",
    auth:{
        user:"ananthliterature@gmail.com",
        pass: 'smwa gqfy bodl zhcb',
    }
})

const sendReminderEmails=()=>{
    const today = new Date();
    const todayStr=today.toISOString().split("T")[0];


    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1); 
    const nextMonthStr = nextMonth.toISOString().split("T")[0];


    const query = `SELECT id, email, due_date, subject, content FROM users 
    WHERE DATE(due_date) BETWEEN ? AND ? 
    AND (last_email_sent IS NULL OR last_email_sent < ?)`;


        conn.query(query, [todayStr,nextMonthStr,todayStr], (err,info)=>{

        if(err){
            console.log("Database Query Error",err);
            return 
        } 

        if(info.length===0){
            console.log("No users found for email reminders.");
            
            return;            
        }

        info.forEach(result=> {
            const mailOptions={
                from: "ananthliterature@gmail.com",
                to: result.email,
                subject: result.subject,
                text: result.content
            }

        transPorter.sendMail(mailOptions,(err,reslove)=>{
              
            if(err){
                    console.log(`Failed Email Send To ${result.email}`);
                } else {
                    console.log(`Email Send To ${result.email}`);
                
                const query = "UPDATE users SET last_email_sent = ? WHERE id = ?";
              
                conn.query(query, [todayStr,result.id], (err, response)=>{
                 
                    if(err){
                        console.log(`Error Updating For last_email_sent ${result.email}:`, err);
                    } else {
                        console.log(`Updated last_email_sent for ${result.email}`);
                    }
                })
                }
            })
        });
    })


}

sendReminderEmails();
setInterval(sendReminderEmails, 24 * 60 * 60 * 1000)




app.post("/email",(req,res)=>{
    const {name, receive, dueDate, subject, body}= req.body;

    const query = "INSERT INTO users (name,email,due_date,subject,content) VALUES (?, ?, ?, ?, ?)";
   
    conn.query(query,[name,receive,dueDate,subject,body],(err,info)=>{

        if(err){
            console.log("Can't insert the data");
            return res.status(400).json({success:false, message:'Server Error'})            
        } else {
            console.log("Successfully inserted data");
            return res.status(200).json({success:true, message:'Data Inserted'})
        }
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
    return console.log("Port Listen");
})

