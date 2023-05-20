const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// fetching all notes '/api/notes/allnotes' --> login required
router.get('/allnotes', fetchuser, async (req, res) => {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes)
})


// adding notes '/api/notes/addnotes' --> login required
router.post('/addnotes', [
    // email and password validation 
    body('title', "Title is too short").isLength({ min: 1 }),
    body('description', "description is too short").isLength({ min: 3 }),
    body('status', "status is too short").isLength({ min: 1 }),
], fetchuser,
    async (req, res) => {
        // checking validations
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const note = await Notes.create({
                user: req.user.id,
                title: req.body.title,
                description: req.body.description,
                status: req.body.status,
            })
            res.status(201).send({ "Success": "True" })
        } catch (error) {
            console.log(error.message);
            res.status(500).send({ error: "server error" });
        }

    })

// updating  a note '/api/notes/updatenote' --> login required
router.put('/updatenote/:id', [
    // email and password validation 
    body('title', "Title is too short").isLength({ min: 1 }),
    body('description', "description is too short").isLength({ min: 3 }),
    body('status', "status is too short").isLength({ min: 1 }),
], fetchuser, async (req, res) => {
    const { title, description, status } = req.body;

    // creating new note object
    const newNote = {};

    if (title) {
        newNote.title = title;
    }
    if (description) {
        newNote.description = description;
    }
    if (status) {
        newNote.status = status;
    }

    try {
        // finding that periticular notes
        const note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send({ error: "internal server error" })
        }
        // checking whether a user is valid to that node
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send({ error: "access denied" })
        }
        const newData = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.send({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ error: "server error" });
    }
})

// delete a note '/api/notes/deletenote' --> login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // fetching that note
        const note = await Notes.findById(req.params.id);
        // checking notes user id is same to req user id
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send({ error: "access denied" })
        }
        await Notes.findByIdAndDelete(req.params.id);
        res.send({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ error: "server error" });
    }
})

module.exports = router;