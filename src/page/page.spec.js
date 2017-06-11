describe("A Page", function() {

    var page;

    beforeEach(function() {
        page = new Page();
    });

    afterEach(function() {
        page = null;
    });

    it("should exist", function() {
        expect(page).not.toBe(null);
    });

    describe("addApplication", function() {
        
        it("should add application with given name to applications", function() {
            page.addApplication("name");

            expect(page.applications().length).toBe(1);
            expect(page.applications()[0].name()).toBe("name");
        });
    });
});