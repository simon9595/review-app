const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
    const sauceData = JSON.parse(req.body.sauce);
    delete sauceData._id;
    const url = req.protocol + '://' + req.get('host');
    const sauce = new Sauce({
        ...sauceData,
        imageUrl: url + '/images/' + req.file.filename,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save().then(
      () => {
        res.status(201).json({
          message: 'Sauce saved successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    Sauce.updateOne({_id: req.params.id}, {...req.body, _id: req.params.id}).then(
        () => {
            res.status(201).json({
                message: 'Sauce updated successfully!'
            });
        } //modifying the image doesn't work
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then(
        (sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.deleteOne({_id: req.params.id}).then(
                () => {
                    res.status(200).json({
                        message: 'Deleted!'
                    });
                }
            ).catch(
                (error) => {
                    res.status(400).json({
                        error: error
                    });
                }
            );
        });
    }
)};
 

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
}

 exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then((sauceData) => {
        switch (req.body.like) {
            case 0: //Remove like/dislike
                Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (sauce.usersLiked.find(user => user === req.body.userId)){
                        // console.log('User already likes post.');
                        Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { likes: -1 },
                            $pull: { usersLiked: req.body.userId },
                            _id: req.params.id
                          })
                          .then(() => { res.status(201).json({message: 'Like removed!'})})
                          .catch((error) => res.status(400).json({ error: error }))
                    } else if (sauce.usersDisliked.find(user => user === req.body.userId)){
                        // console.log('User already dislikes this post.')
                        Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { dislikes: -1},
                            $pull: { usersDisliked: req.body.userId },
                            _id: req.params.id
                        })
                        .then(() => { res.status(201).json({ message: 'Dislike removed!'})})
                        .catch((error) => { res.status(400).json({ error: error })})
                    }
                })
                break;
            case 1: //Add like
            Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
                _id: req.params.id
            })
            .then(() => { res.status(201).json({ message: 'Liked!'})})
            .catch((error) => { res.status(400).json({ error: error })})
            break;

            case -1: //Add dislike
            Sauce.updateOne({ _id: req.params.id }, {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
                _id: req.params.id
            })
            .then(() => { res.status(201).json({ message: 'Disliked!' })})
            .catch((error) => { res.status(400).json({ error: error})})
            break;

            default:
                console.log('An error has occured.')
        }
    })
    .catch((error) => { res.status(400).json({ error: error }); });
}