import express from 'express';
import cors from 'cors';
import { UserController } from './controllers/UserController.js';
import mongoose from 'mongoose';


const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const PORT = process.env.PORT || 3000;
const db = mongoose.connect('mongodb+srv://test:test@cluster0.6cfjym0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
if(db){
  console.log("Connected to MongoDB")
}
else{
  console.log("Failed to connect to MongoDB");
  process.exit(1);
}
app.use(express.json());

app.use('/api/v1', UserController)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});