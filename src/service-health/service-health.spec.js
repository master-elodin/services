describe("ServiceHealth", function() {

    var serviceHealth;
    var filterValue;

    beforeEach(function() {
        filterValue = ko.observable();
        serviceHealth = new ServiceHealth({name: "service", filterValue: filterValue});
    });

    afterEach(function() {
        filterValue = null;
        serviceHealth = null;
    });

    describe("addHostHealth", function() {

        it("should set host healths", function() {
            var hostHealth1 = new HostHealth({});
            var hostHealth2 = new HostHealth({status: ServiceInstance.Status.RUNNING});

            serviceHealth.addHostHealth(hostHealth1);
            serviceHealth.addHostHealth(hostHealth2);

            expect(serviceHealth.hostHealths()[0]).toBe(hostHealth1);
            expect(serviceHealth.hostHealths()[1]).toBe(hostHealth2);
        });
    });

    describe("matchesFilter", function() {
        
        it("should return true if filterValueEmpty", function() {
            filterValue("");

            expect(serviceHealth.matchesFilter()).toBe(true);
        });
        
        it("should return true if it equals filterValue", function() {
            filterValue("service");

            expect(serviceHealth.matchesFilter()).toBe(true);
        });
        
        it("should return false if filterValue has more letters", function() {
            filterValue("services");

            expect(serviceHealth.matchesFilter()).toBe(false);
        });
        
        it("should return false if second part of filter does not match", function() {
            filterValue("service something");

            expect(serviceHealth.matchesFilter()).toBe(false);
        });
        
        it("should return true if second part of filter matches", function() {
            filterValue("service vice");

            expect(serviceHealth.matchesFilter()).toBe(true);
        });
    });
});