const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');

exports.modifySauce = (req, res, next) => {
    let sauce = new Sauce({ _id: req.params.id });
    const url = req.protocol + '://' + req.get('host');
    if(req.file){
        Sauce.findOne({_id: req.params.id}).then(
            (sauce) => {
                req.body.sauce = JSON.parse(req.body.sauce);
                let oldPicture = sauce.imageUrl.split('/images/')[1]; 
                fs.unlink('images/' + oldPicture, () => {
                    sauce = {
                        _id: req.params.id,
                        userId: req.body.sauce.userId,
                        name: req.body.sauce.name,
                        manufacturer: req.body.sauce.manufacturer,
                        description: req.body.sauce.description,
                        mainPepper: req.body.sauce.mainPepper,
                        imageUrl: url + '/images/' + req.file.filename,
                        heat: req.body.sauce.heat,
                    }
                    Sauce.updateOne({ _id: req.params.id }, sauce).then(
                        () => {
                            res.status(200).json({
                                message: 'Sauce updated successfully!'
                            });
                        }
                    ).catch(
                        (error) => {
                            res.status(400).json({
                                error: error
                            });
                        }
                    );
                }
            );
        });

    } else {
        sauce = {
            _id: req.params.id,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat
        }
    Sauce.updateOne({ _id: req.params.id }, sauce).then(
        () => {
            res.status(200).json({
                message: 'Sauce updated successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    )};
}; 

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