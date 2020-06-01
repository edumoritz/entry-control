module.exports = (app) => {

    const getAll = (req, res, next) => {
        app.services.schedule.findAll({user_id: req.user.id})
            .then(result => res.status(200).json(result)) 
            .catch(err => next(err));
    };

    const get = (req, res, next) => {
        app.services.schedule.findOne({id: req.params.id})
            .then((result) => {
                if(result.user_id !== req.params.id)
                    return res.status(403).json({ error: 'This resource does not belong to the user'});
                return res.status(200).json(result);
            })
            .catch(err => next(err));
    };
    
    const create = (req, res, next) => {
        app.services.schedule.save({ ...req.body, user_id: req.user.id })
            .then((result) => {
                return res.status(201).json(result[0]);
            }).catch(err => next(err));
    };

    const update = (req, res, next) => {
        app.services.schedule.update(req.params.id, req.body)
            .then(result => res.status(200).json(result[0]))
            .catch(err => next(err));
    };

    const remove = (req, res, next) => {
        app.services.schedule.remove(req.params.id)
            .then(() => res.status(204).send())
            .catch(err => next(err));
    };

    return { getAll, create, get, update, remove };
}