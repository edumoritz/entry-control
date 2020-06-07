module.exports = function RecursoIndevidoError(message = 'This resource does not belong to the user') {
    this.name = 'RecursoIndevidoError';
    this.message = message;
};