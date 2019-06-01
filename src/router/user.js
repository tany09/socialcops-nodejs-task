const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const fetch = require('node-fetch');
const sharp = require('sharp');
const jsonpatch = require('fast-json-patch');

const router = new express.Router();

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch(e) {
        res.status(400).send();
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findUser(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/createthumbnail', auth, async (req, res) => {
    try {
        const fileUrl = req.body.url;
        const originalBuffer = await fetch(fileUrl).then(res => res.buffer());
        const resizeBuffer = await sharp(originalBuffer).resize({width: 50, height: 50}).png().toBuffer();

        res.set('Content-Type', 'image/png');
        res.send(resizeBuffer);

    } catch (e) {
        res.status(400).send();
    }
});

router.patch('/jsonpatch', auth, async (req, res) => {
    try{
        const updates = Object.keys(req.body);
        const validUpdates = ['name','email', 'password', 'age'];
        const isValidUpdate = updates.every(update => validUpdates.includes(update));
        if(!isValidUpdate) {
            throw new Error();
        }
        // const user = req.user;
        // updates.forEach(update => user[update] = req.body[update]);
        // await user.save();
        // res.send(user);

        const patch = jsonpatch.compare(req.user, req.body);
        patch.splice(0,6);
        const user = jsonpatch.applyPatch(req.user, patch).newDocument;
        await user.save();
        res.send(user);


    } catch (err) {
        res.status(400).send();
    }
})



module.exports = router;