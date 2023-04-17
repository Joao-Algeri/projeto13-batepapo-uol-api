import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import dayjs from 'dayjs'
import joi from 'joi'

dotenv.config()


const userschema = joi.object({
    name: joi.string().required().min(1)
})
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
app.use(cors);

app.post("/participants", async (req, res) => {

    const { name } = req.body;
    const user = { name, lastStatus: Date.now() }
    const message = {
        from: name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss')
    }
    const validation = userschema.validate(req.body);
    if (validation.error) res.status(422).send

    try {
        await db.collection('users').insertOne(user)
        await db.collection('messages').insertOne(message)
        res.sendStatus(201);
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Houve um problema no servidor, tente novamente mais tarde');
    }


})

const PORT = 5000
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))