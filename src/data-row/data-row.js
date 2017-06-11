function DataRow(onSave, dataType, name, onSelect) {
    var instance = this;

    instance.invalid = ko.observable(false);
    // if data row is for adding new data as opposed to changing existing data
    instance.isNewDataRow = !name || !name();
    instance.editing = ko.observable(instance.isNewDataRow);

    instance.dataTypeClass = "data-row-" + dataType.toLowerCase();

    instance.name = name || ko.observable();
    instance.name.subscribe(function(newValue) {
        instance.invalid(false);
    });

    instance.onSave = function() {
        if(instance.name()) {
            onSave(instance.name());
            instance.invalid(false);
            if(instance.isNewDataRow) {
                instance.name("");
            } else {
                instance.editing(false);
            }
        } else {
            instance.invalid(true);
        }
    };

    instance.onSelect = onSelect || function() { console.log("select!") };

    instance.previousName = "";
    instance.onCancel = function() {
        instance.name(instance.previousName);
    }
}