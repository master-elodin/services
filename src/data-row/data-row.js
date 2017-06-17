function DataRow(loadingData) {
    //onSave, dataType, name, onSelect, separator, editModeSeparator
    var instance = this;

    instance.invalid = ko.observable(false);
    // if data row is for adding new data as opposed to changing existing data
    instance.isNewDataRow = !loadingData.name || !loadingData.name();
    instance.separator = loadingData.separator || ": {";
    instance.editModeSeparator = loadingData.editModeSeparator || instance.separator;
    instance.editing = ko.observable(instance.isNewDataRow);
    instance.toggleEdit = function(dataRow, target) {
        instance.editing(!instance.editing());
        if(instance.editing()) {
            // TODO: focus on selected
        }
    };

    instance.dataType = loadingData.dataType;

    instance.name = loadingData.name || ko.observable();
    instance.name.subscribe(function(newValue) {
        instance.invalid(false);
    });

    instance.onSave = function() {
        if(instance.name()) {
            instance.invalid(false);
            if(instance.isNewDataRow) {
                loadingData.onSave(instance.name());
                instance.name("");
            } else {
                instance.editing(false);
            }
        } else {
            instance.invalid(true);
        }
    };

    instance.onSelect = loadingData.onSelect || function() { console.log("onSelect clicked!") };

    instance.previousName = instance.name();
    instance.onCancel = function() {
        instance.name(instance.previousName);
        if(!instance.isNewDataRow) {
            instance.editing(false);
        }
    };

    instance.onDelete = loadingData.onDelete;
}