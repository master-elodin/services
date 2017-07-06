function Message(creationData) {
    this.text = creationData.text;
    this.type = creationData.type;
    this.visible = ko.observable(true);
    this.getCssClasses = ko.pureComputed(function() {
        return (this.visible() ? "message--visible " : "") + this.type.colorClass;
    }, this);
}

Message.Type = {
    SUCCESS: {
        title: "Success!",
        colorClass: "message--success"
    },
    WARN: {
        title: "Warning!",
        colorClass: "message--warning"
    },
    ERROR: {
        title: "Error!",
        colorClass: "message--error"
    }
}