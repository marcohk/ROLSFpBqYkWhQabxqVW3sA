var _db = null;

exports.init = function(db) {
    _db = db;
};

exports.database = function() {
    return _db;
};