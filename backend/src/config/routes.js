module.exports = (app) => {

    app.route('/auth/signin').post(app.routes.auth.signin);
    app.route('/auth/signup').post(app.routes.users.create);

    app.route('/users')
        .all(app.config.passport.authenticate())
        .get(app.routes.users.findAll)
        .post(app.routes.users.create)

    app.route('/schedules')
        .all(app.config.passport.authenticate())
        .get(app.routes.schedules.getAll)
        .post(app.routes.schedules.create)

    app.route('/schedules/:id')
        .all(app.config.passport.authenticate())
        .get(app.routes.schedules.get)
        .put(app.routes.schedules.update)
        .delete(app.routes.schedules.remove)
}