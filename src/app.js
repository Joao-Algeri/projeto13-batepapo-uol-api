import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import dayjs from 'dayjs'
import joi from 'joi'

dotenv.config()


const userSchema = joi.object({
    name: joi.string().min(3).required()
})
// const messageSchema=joi.object({
    //     to:joi.string().required().min(1)
    //     text:string.required().min(3)
    //     type:string.required().min(3)
    // })
    const mongoClient = new MongoClient(process.env.DATABASE_URL);
    let db;
    
    try {
        await mongoClient.connect()
        db = mongoClient.db()
    } catch (error) {
        console.error(error)
        console.log('Houve um problema no servidor, tente novamente mais tarde')
    }
    const app = express();
    app.use(express.json());
    app.use(cors());
    
    app.post("/participants", async (req, res) => {
        
        const { name } = req.body;

        const {error} = userSchema.validate({name});

        if (error) res.status(422).send()
        try {
            const participantIsLogged = await db.collection("participants").findOne({ name })

            if(participantIsLogged) return res.status(409).send("Este nome ja foi utilizado")

   
        await db.collection("participants").insertOne({ name, lastStatus: Date.now() })

        await db.collection("messages").insertOne({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        })

        res.status(201).send("OK");
        
    }
    catch (error) {
        
        res.status(500).send('Houve um problema no servidor, tente novamente mais tarde');
    }
    app.get("/participants",async(req,res)=>{
        try{
            const participants= await db.collection("participants").find().toArray()
            if(participants===undefined) res.status(404).send("Nenhum usuário online")
            res.send(participants)
        }
        catch{
            res.status(500).send('Houve um problema no servidor, tente novamente mais tarde')
        }
   
 })
 app.post("/messages",(req,res)=>{

 })
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))