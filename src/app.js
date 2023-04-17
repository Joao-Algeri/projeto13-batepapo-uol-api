import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import dayjs from 'dayjs'
import joi from 'joi'

dotenv.config()

const app = express();
app.use(express.json());
app.use(cors());


const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
    await mongoClient.connect()
    db = mongoClient.db()
} catch (error) {
    console.error(error)
    console.log('Houve um problema no servidor, tente novamente mais tarde')
}

app.post("/participants", async (req, res) => {
    const userSchema = joi.object({
        name: joi.string().min(3).required()
    })
    const { name } = req.body;
    
    const {error} = userSchema.validate({name});
    
    if (error)  return res.status(422).send("Nome invalido")
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
})
app.get("/participants",async(req,res)=>{
    try{
        const participants= await db.collection("participants").find().toArray()
        if(!participants) res.status(404).send("Nenhum usuário online")
        res.send(participants)
    }
    catch{
        res.status(500).send('Houve um problema no servidor, tente novamente mais tarde')
    }
    
})
app.post("/messages",(req,res)=>{
    const {to,next,type}=req.body;
    const {participant}=req.headers
    const messageSchema=joi.object({
        to:joi.string().min(3).required(),
        text:string().min(3).required(),
        type:string().min(3).required()        
    })
    const {error}=messageSchema.validate({to,next,type, from:participant},{abortEarly:false})
    if(error){
    const errorStatus = error.details.map((err)=>err.message)
    return res.sendStatus(422).send(errorStatus)
    }
})
app.get("/messages",async(req,res)=>{
    const { user } = req.headers
    const limit = req.query.limit
    if(limit/1==limit && limit ||parseInt(limit)<=0) return res.sendStatus(422)
    try {

        const allMessages = await db.collection("messages").find({$or: [{ from: user },{ to: { $in: [user, "Todos"] } },{ type: "message" }]
        }).limit(Number(limit)).toArray()
    
        res.send(allMessages)
    
      } catch (err) {
        console.error(err)
        res.status(500).send("Houve um problema no servidor, tente mais tarde")
      }
    })


const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))

