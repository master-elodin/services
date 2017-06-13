function Host(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.select = function() {

    };

    instance.dataRow = new DataRow(null, "host", instance.name, instance.select, ",");
}
