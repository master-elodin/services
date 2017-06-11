describe("A Data Row", function() {

    var dataRow;

    var onSave;
    var onSelect;
    var name;

    beforeEach(function() {
        onSave = jasmine.createSpy( "onSave" );
        onSelect = jasmine.createSpy( "onSelect" );
        name = ko.observable();

        dataRow = new DataRow(onSave, "data-type", name, onSelect);
    });

    afterEach(function() {
        onSave = null;
        onSelect = null;
        name = null;

        dataRow = null;
    });

    describe("creation", function() {

        it("should set editing=true if name not given", function() {
            dataRow = new DataRow(onSave, "data-type");

            expect(dataRow.editing()).toBe(true);
        });

        it("should set editing=true if given name is blank", function() {
            dataRow = new DataRow(onSave, "data-type", name);

            expect(dataRow.editing()).toBe(true);
        });

        it("should set editing=false if name given", function() {
            name("something");

            dataRow = new DataRow(onSave, "data-type", name);

            expect(dataRow.editing()).toBe(false);
        });
    });

    describe("name", function() {

        it("should set invalid=false if name changes and is not blank", function() {
            dataRow.invalid(true);

            dataRow.name("something");

            expect(dataRow.invalid()).toBe(false);
        });
    });

    describe("onSave", function() {

        it("should not call given onSave if name is blank", function() {
            dataRow.name("");

            dataRow.onSave();

            expect(onSave).not.toHaveBeenCalled();
        });

        it("should set invalid=true if name is blank", function() {
            dataRow.name("");

            dataRow.onSave();

            expect(dataRow.invalid()).toBe(true);
        });

        it("should set invalid=false if name is not blank", function() {
            dataRow.name("something");

            dataRow.onSave();

            expect(dataRow.invalid()).toBe(false);
        });

        it("should clear name after save if new data row", function() {
            dataRow.isNewDataRow = true;
            dataRow.name("something");

            dataRow.onSave();

            expect(dataRow.name()).toBe("");
        });

        it("should not clear name after save if not new data row", function() {
            dataRow.isNewDataRow = false;
            dataRow.name("something");

            dataRow.onSave();

            expect(dataRow.name()).toBe("something");
        });

        it("should leave editing=true after save if new data row", function() {
            dataRow.isNewDataRow = true;
            dataRow.name("something");

            dataRow.onSave();

            expect(dataRow.editing()).toBe(true);
        });

        it("should set editing=false after save if not new data row", function() {
            dataRow.isNewDataRow = false;
            dataRow.name("something");

            dataRow.onSave();

            expect(dataRow.editing()).toBe(false);
        });
    });

    describe("onCancel", function() {

        it("should set name back as previous name", function() {
            dataRow.previousName = "previousName";

            dataRow.name("something new");

            dataRow.onCancel();

            expect(dataRow.name()).toBe(dataRow.previousName);
        });
    });
});