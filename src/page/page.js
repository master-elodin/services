function Page() {
    var instance = this;

    instance.applications = ko.observableArray([new Application("Suite")]);
}