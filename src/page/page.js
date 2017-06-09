function Page() {
    var instance = this;

    instance.environments = [new Environment('DEV'), new Environment('QA'), new Environment('PROD')];
}