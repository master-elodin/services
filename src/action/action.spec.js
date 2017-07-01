describe("Action", function() {

    var action;

    beforeEach(function() {
        action = new Action({serviceName: "service", hostIndex: 0});
    });

    afterEach(function() {
        action = null;
    });

    describe("merge", function() {

        it("should add host index in order if it doesn't already exist", function() {
            var otherAction = new Action({serviceName: "service", hostIndex: 2});
            otherAction.hostIndexes = [0, 3, 2];

            action.merge(otherAction);

            expect(action.hostIndexes.length).toBe(3);
            expect(action.hostIndexes[0]).toBe(0);
            expect(action.hostIndexes[1]).toBe(2);
            expect(action.hostIndexes[2]).toBe(3);
        });
    });

    describe("hostNameString", function() {

        it("should return hostNames joined by comma", function() {
            action.hostNames(["host1", "host2", "host3"]);

            expect(action.hostNameString()).toBe("host1, host2, host3");
        });

        it("should not include non-real host names", function() {
            action.hostNames(["host1", null, undefined]);

            expect(action.hostNameString()).toBe("host1");
        });
    });

    describe("export", function() {

        it("should should include name", function() {
            expect(action.export().serviceName).toBe("service");
        });

        it("should should include host indexes", function() {
            action.hostIndexes = [1, 3];

            expect(action.export().hostIndexes.length).toBe(2);
            expect(action.export().hostIndexes[0]).toBe(1);
            expect(action.export().hostIndexes[1]).toBe(3);
        });
    });
});