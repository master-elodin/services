describe("A Page", function() {

    var page;

    beforeEach(function() {
        page = new Page();
        localStorage.setItem(Page.DATA_NAME, null);
    });

    afterEach(function() {
        page = null;
    });

    describe("creating", function() {

        xit("should read from local storage if local storage exists", function() {
            page.addApplication("application");
            page.toggleEdit();

            page = new Page();

            expect(page.applications().length).toBe(1);
            expect(page.applications()[0].name()).toBe("application");
        });
    });

    describe("addApplication", function() {
        
        it("should add application with given name to applications", function() {
            page.addApplication("name");

            expect(page.applications().length).toBe(1);
            expect(page.applications()[0].name()).toBe("name");
        });
    });

    describe("toggleEdit", function() {

        it("should reverse value of editMode", function() {
            page.editMode(true);

            page.toggleEdit();

            expect(page.editMode()).toBe(false);

            page.toggleEdit();

            expect(page.editMode()).toBe(true);
        });

        it("should save to localStorage", function() {
            spyOn(localStorage, "setItem").and.stub();

            page.toggleEdit();

            expect(localStorage.setItem).toHaveBeenCalledWith(Page.DATA_NAME, JSON.stringify(ko.mapping.toJS(page)));
        });
    });
});