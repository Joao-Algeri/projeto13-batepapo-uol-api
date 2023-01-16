import express from 'express';
import cors from 'cors';
import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
const db = mongoClient.db();

const app = express();
app.use(express.json());
app.use(cors())

app.get('/participants',async (req,res)=>{
   const participants= await db.collection("users").find().toArray();

    res.send(participants);
})
app.post('/participants',async(req,res)=>{
    const {nome}=req.body;
    await db.mongoClient.db()
    res.send("servidor funcionando corretamente")
})
app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000')
  })