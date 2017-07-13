describe("ServiceInstanceDetails", function() {

    describe("constructor", function() {

        it("should add keys for whatever is passed in", function() {
            var serviceInstanceDetails = new ServiceInstanceDetails({something: "foo", somethingElse: "bar"});

            expect(serviceInstanceDetails.something).toBe("foo");
            expect(serviceInstanceDetails.somethingElse).toBe("bar");
        });
    });
});