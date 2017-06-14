describe("An Application", function() {

    var application;
    var page;

    beforeEach(function() {
        page = {activateItem: function(){}, save: function(){}};
        spyOn(page, "activateItem").and.stub();
        application = new Application({name:"", page: page});
    });

    afterEach(function() {
        page = null;
        application = null;
    });

    describe("addEnvironment", function() {

        it("should add and return new environment", function() {
            var env = application.addEnvironment("env");

            expect(application.environments()[0]).toBe(env);
        });

        it("should set name, page, parent when adding environment", function() {
            var env = application.addEnvironment("env");

            expect(env.name()).toBe("env");
            expect(env.page).toBe(application.page);
            expect(env.parent).toBe(application);
        });
    });

    describe("select", function() {

        it("should toggle active", function() {
            expect(application.isActive()).toBe(false);

            application.select();

            expect(application.isActive()).toBe(true);

            application.select();

            expect(application.isActive()).toBe(false);
        });

        it("should active item if active is true", function() {
            application.isActive(false);

            application.select();

            expect(page.activateItem).toHaveBeenCalledWith(application);
        });

        it("should save page", function() {
            spyOn(page, "save").and.stub();

            application.select();

            expect(page.save).toHaveBeenCalled();
        });
    });
});