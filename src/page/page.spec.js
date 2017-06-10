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
});