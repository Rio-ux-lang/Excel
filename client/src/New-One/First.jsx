import React, { useEffect, useState } from 'react'
import axios from 'axios';
const First = () => {
    const [users,setUsers]=useState([]);
    const [name,setName]=useState('');
    const [receive,setReceive]=useState('')
    const [dueDate,setDate]=useState('');
    const [subject,setSubject]=useState('')
    const [body,setBody]=useState('')
    const [refresh,setRefresh]=useState(true)
  
const handleClick= async(e)=>{
        e.preventDefault();

    if(!receive || !subject || !body ){
        alert('All field must required')
        return
    }

    try{
        const response=await axios.post('http://localhost:3001/email',{
            name,name,
            receive:receive,
            dueDate:dueDate,
            subject:subject,
            body:body,
    })

    if(response.data.success){
        alert("Email send successfully")
        setRefresh(!refresh)
       }
    else{
        alert("Email Can't Send")
        setRefresh(!refresh)
       }
    }
    catch(err){
        console.log(err.message);
    }

}

useEffect(()=>{
    axios.get('http://localhost:3001/email/get')
    .then((res)=>setUsers(res.data))
    .catch((err)=>console.log("Error Fetching",err))
},[refresh])
    return (
    <div>
        <div style={{marginLeft:'45%', marginTop:'100px'}}>
                <h1>Name</h1>
                <label htmlFor="name"> Name:
                    <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required/>
                </label> <br />
                <label htmlFor="receiver"> Email:
                    <input type="email" value={receive} onChange={(e)=>setReceive(e.target.value)} required/>
                </label> <br />
                <label htmlFor="receiver"> Date:
                    <input type="date" value={dueDate} onChange={(e)=>setDate(e.target.value)} required/>
                </label> <br />
                <label htmlFor="subject"> Subject:
                    <input type="text" value={subject} onChange={(e)=>setSubject(e.target.value)} required/>
                </label> <br />
                <label htmlFor="">Content:
                <textarea value={body} onChange={(e)=>setBody(e.target.value)} placeholder='Write...' required >
                </textarea>
                </label>
                 <br />
                <button onClick={handleClick}>Send</button>
        </div>

        <div style={{marginLeft:'45%'}}>
            <h1>Users</h1>
            <ul> 
            {users.map((user)=>
            <li key={user.id}> 
            <label htmlFor="">Name: {user.name}</label> <br />
            <label htmlFor="">Email: {user.email}</label> <br />
            <label htmlFor="">Due_date: {user.due_date}</label>    <br /> <br />            
           </li> )}
            </ul>
        </div>
    </div>
  )
}

export default First