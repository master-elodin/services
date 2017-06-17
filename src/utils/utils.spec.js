describe("utils", function () {

    describe("createOnDelete", function () {

        it("should return a function that removes an item from an observable array", function () {
            var item1 = {id: "item1"};
            var item2 = {id: "item2"};
            var item3 = {id: "item3"};
            var observableArray = ko.observableArray([item1, item2, item3]);

            createOnDelete(observableArray)({owner: item2});

            expect(observableArray().length).toBe(2);
            expect(observableArray()[0]).toBe(item1);
            expect(observableArray()[1]).toBe(item3);
        });
    });
});