import express from 'express';
import cors from 'cors';
import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';

dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
const db = mongoClient.db();
const app = express();
app.use(express.json());
app.use(cors())


app.get('/participants',async (req,res)=>{
   const participants= await db.collection("participants").find().toArray();
    
    res.send(participants);   
})
app.post('/participants', async (req, res) => {
    const { nome } = req.body;
    const user = { nome, lastStatus: Date.now() };
    let now = dayjs();
    const userSchema = joi.object({

        nome: joi.string().required(),
        lastStatus: joi.number().required()
    });
    const validation = userSchema.validate(user, { abortEarly: false });
    if (validation.error) {
        return res.sendStatus(422)
    }
    const userExists = await db.collection("participants").findOne({ nome });

    if (userExists) return res.sendStatus(409)
    await db.collection("participants").insertOne({
        nome, lastStatus: Date.now()
    })
    await db.collection("messages").insertOne({
        from: nome, to: 'Todos', text: 'entra na sala...', type: 'status', time: now.format('HH:mm:ss')
    })
    res.sendStatus(201);
})
app.get('/messages',async (req,res)=>{
    const {limit}=req.query    
    const messages= await db.collection("messages").find().toArray();
    if (limit===undefined) return res.send(messages);
    else if(!isNaN(limit)&&limit>0){
        
            const newMessages=messages.slice(-limit)
            res.send(newMessages)
        }
        else if(limit<=0||isNaN(limit))return res.sendStatus(422)
            
            
    
})
app.post('/messages',async(req,res)=>{
    const {to,text,type}=req.body;
    const from=req.headers.user
    const time=dayjs();
    await db.collection("messages").insertOne({from,to,text,type,time:time.format("HH.mm.ss")})
    res.status(200).send("Deu bom mané");
})
// app.post('/status',async(req,res)=>{
//     const User=req.headers.user;    
//     try {
//         const userExists = await db.collection("participants").findOne({ User })
    
//         if (!userExists) return res.status(404)
    
//          const newParticipants=await db.collection("participants").find({nome:"Paula Fora"})
//          newParticipants.map((user)=>user.nome===User && user)
//         return res.status(200)
//       } catch (error) {
//         return res.status(500).send("Deu um erro no servidor de banco de dados")
//       } 
// })

app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000')
  })




  