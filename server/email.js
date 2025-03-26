const express= require('express');
const nodemailer= require('nodemailer');
const cors=require('cors');

const app= express();
app.use(cors());
app.use(express.json())


const transPorter=nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'ananthliterature@gmail.com',
        pass: 'smwa gqfy bodl zhcb'
    }
})

app.post('/email',(req,res)=>{
     
    const {receive,subject,body}= req.body;

    const mailOptions={
        from:'ananthliterature@gmail.com',
        to:receive,
        subject:subject,
        text:body
    }

    transPorter.sendMail(mailOptions,(err,info)=>{
        
        if(err){
            console.log("Error",err);
     return res.status(404).json({success:false, message:'Failed to send email'})
        } 

    console.log('successfuly sended email');
    return res.status(200).json({success:true, message:'Successfully sended'})

    })

})


app.listen(3001,(err)=>{
    if(err) throw err;
    console.log('Post Listening on 3001');
})

