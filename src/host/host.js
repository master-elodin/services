function Host(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.dataRow = new DataRow(null, "host", instance.name, null, ",");
}
