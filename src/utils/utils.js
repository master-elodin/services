var createOnDelete = function(observableArray) {
    return function(item) {
        return observableArray.splice(observableArray().indexOf(item.owner), 1);
    }
};