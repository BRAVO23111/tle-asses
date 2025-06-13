import express from 'express';
import UserModel from '../models/UserModel.js';

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const {name, email, contact ,  codeforcesId , currentRating , maxRating} = req.body;
        if(!name || !email || !contact || !codeforcesId || currentRating === undefined || maxRating === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newuser = await UserModel.create({
            name,
            email,
            contact,
            codeforcesId,
            currentRating: currentRating || 0,
            maxRating: maxRating || 0
        });
        res.status(201).json(newuser);
    } catch (error) {
        console.error('Error in UserController:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/all-users', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in UserController:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);  

router.get('/user/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error in UserController:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);
router.put('/edit/:id', async (req, res) => {
    try {
        const { name, email, contact, codeforcesId, currentRating, maxRating } = req.body;
        const user = await UserModel.findByIdAndUpdate(req.params.id, {
            name,
            email,
            contact,
            codeforcesId,
            currentRating,
            maxRating
        }, { new: true });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error in UserController:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.delete('/delete/:id', async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in UserController:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
export { router as UserController };
