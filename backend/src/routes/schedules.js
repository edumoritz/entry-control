module.exports = (app) => {
    const getAll = (req, res, next) => {
        app.services.schedule.findAll()
            .then(result => res.status(200).json(result))
            .catch(err => next(err));
    };

    const get = (req, res, next) => {
        app.services.schedule.findOne({id: req.params.id})
            .then((result) => res.status(200).json(result))
            .catch(err => next(err));
    };
    
    const create = (req, res, next) => {
        app.services.schedule.save(req.body)
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