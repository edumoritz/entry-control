module.exports = (app) => {
    const getAll = (req, res) => {
        app.services.schedule.findAll()
            .then(result => res.status(200).json(result));
    };

    const get = (req, res) => {
        app.services.schedule.findOne({id: req.params.id})
            .then((result) => res.status(200).json(result));
    };
    
    const create = async (req, res) => {
        try {
            const result = await app.services.schedule.save(req.body);
            return res.status(201).json(result[0]);
        } catch(err) {
            return res.status(400).json({ error: err.message});
        }
    };

    const update = (req, res) => {
        app.services.schedule.update(req.params.id, req.body)
            .then(result => res.status(200).json(result[0]));
    };

    const remove = (req, res) => {
        app.services.schedule.remove(req.params.id)
            .then(() => res.status(204).send());
    };

    return { getAll, create, get, update, remove };
}