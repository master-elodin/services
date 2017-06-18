var createOnDelete = function(observableArray) {
    return function(item) {
        return observableArray.splice(observableArray().indexOf(item.owner), 1);
    };
};

var createToggle = function(observable) {
    return function() {
        return observable(!observable());
    };
};