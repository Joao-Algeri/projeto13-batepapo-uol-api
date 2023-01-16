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
app.post('/participants',async(req,res)=>{
    const {nome}=req.body;    
    const user={nome,lastStatus:Date.now()};
    const userSchema = joi.object({
        nome: joi.string().required(),
        lastStatus:joi.number().required()          
      });
      const validation = userSchema.validate(user,{abortEarly:false});
      if (validation.error) {
        return res.status(422).send(validation.error.details)
      }
      const userExists=await db.collection("participants").findOne({nome});
    
      if(userExists) return res.sendStatus(409)
    await db.collection("participants").insertOne({
        nome,lastStatus:Date.now()
    })
    res.sendStatus(201);
})
app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000')
  })