var express = require('express');
var router = express.Router();
var { Todo } = require('../models/todo');
var { authenticate } = require('../middleware/auth')
const _ = require('lodash');


router.post('/',authenticate, (req, res) => {
    console.log(req.body);
    var todo = new Todo({
        title: req.body.title,
        subject:req.body.subject,
        completedAt: req.body.completedAt,
        completed: req.body.completed,
        _creator: req.user._id
    }).save().then((doc) => {
        res.status(201).send(doc);
    }, (err) => {
        res.status(400).send(err);
    });

});

router.get('/',authenticate ,(req, res) => {
    Todo.find({_creator:req.user._id}).then((todos) => {
        res.status(200).send({ todos });
    }, (err) => {
        res.status(400).send(err);
    })
});

router.get('/:id',authenticate, (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOne({_id:id,_creator:req.user._id}).then((todo) => {
        if (!todo) {
            return res.status(404).send({});
        }
        return res.status(200).send({ todo });

    }, (err) => {
        return res.status(400).send();
    }).catch((e) => res.status(400).send())
});

router.put('/todos/:id',authenticate, (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    let body = _.pick(req.body, ['text','subject' ,'completed']);
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    }
    else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findOneAndUpdate({ _id: new ObjectID(id),_creator:req.user._id }, {
        $set: body

    }, { new: true }, (err, todo) => {
        if (err) {
            return res.status(403).send({});
        }
        if (!todo) {
            return res.status(404).send({});
        }
        res.status(200).send({ todo });
    });

});

router.delete('/:id',authenticate ,(req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOneAndRemove({_id:id,_creator:req.user._id}).then((todo) => {
        if (!todo) {
            return res.status(404).send({});
        }
        res.status(200).send({ todo })
    }, (err) => res.status(400).send()).catch((e) => res.status(400).send())
});

module.exports = router;