import express from 'express';
import cors from 'cors';
import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
const db = mongoClient.db();

const app = express();
app.use(express.json());
app.use(cors())

app.get('/participants',(req,res)=>{
    res.send("servidor funcionando corretamente")
})

app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000')
  })