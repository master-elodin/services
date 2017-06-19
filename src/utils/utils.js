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

var downloadAsFile = function(jsonData, fileName) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(jsonData));
    element.setAttribute("download", fileName);
    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

var uploadFile = function(inputId, callback) {
    var inputEl = jQuery(inputId);
    inputEl.on("change", function() {
        var reader = new FileReader();
        reader.onload = function(){
            var configText = reader.result;
            try {
                // parse just to make sure this is valid input
                JSON.parse(configText);
                callback(configText);
            } catch(e) {
                // TODO: in-page error messages
                alert("Failed to load configuration! Make sure it is valid JSON");
            }
        };
        reader.readAsText(this.files[0]);
    });
    inputEl.click();
}