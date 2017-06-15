describe("A Host Group", function() {

    var hostGroup;
    var page;

    beforeEach(function() {
        page = {activateItem: function(){}, save: function(){}};
        spyOn(page, "activateItem").and.stub();
        hostGroup = new HostGroup({name: "", page: page});
    });

    afterEach(function() {
        page = null;
        hostGroup = null;
    });

    describe("addHost", function() {

        it("should return host", function() {
            var host = hostGroup.addHost("alpha");

            expect(hostGroup.hosts()[0]).toBe(host);
        });

        it("should add host in alphabetic order based on name", function() {
            hostGroup.addHost("charlie");
            hostGroup.addHost("beta");
            hostGroup.addHost("alpha");

            expect(hostGroup.hosts()[0].name()).toBe("alpha");
            expect(hostGroup.hosts()[1].name()).toBe("beta");
            expect(hostGroup.hosts()[2].name()).toBe("charlie");
        });
    });

    describe("addService", function() {

        it("should add services in alphabetical order", function() {
            hostGroup.addService(new Service({name: "charlie"}));
            hostGroup.addService(new Service({name: "beta"}));
            hostGroup.addService(new Service({name: "alpha"}));

            expect(hostGroup.services()[0].name()).toBe("alpha");
            expect(hostGroup.services()[1].name()).toBe("beta");
            expect(hostGroup.services()[2].name()).toBe("charlie");
        });

        it("should merge services instances if service already exists", function() {
            var service1 = new Service({name: "name1"});
            spyOn( service1, 'merge' ).and.stub();

            hostGroup.addService(service1);

            var service2 = new Service({name: "name1"});
            var serviceInstance = new ServiceInstance("serviceInstance1");
            service2.addServiceInstance(serviceInstance);

            hostGroup.addService(service2);

            var service3 = new Service({name: "name2"});
            service3.addServiceInstance(new ServiceInstance("serviceInstance2"));

            hostGroup.addService(service3);

            expect( service1.merge ).toHaveBeenCalledWith( service2 );
            expect( hostGroup.services().length ).toBe( 2 );
        });
    });

    describe("select", function() {

        it("should toggle active", function() {
            expect(hostGroup.isActive()).toBe(false);

            hostGroup.select();

            expect(hostGroup.isActive()).toBe(true);

            hostGroup.select();

            expect(hostGroup.isActive()).toBe(false);
        });

        it("should active item if active is true", function() {
            hostGroup.isActive(false);

            hostGroup.select();

            expect(page.activateItem).toHaveBeenCalledWith(hostGroup);
        });
                
        it("should save page", function() {
            spyOn(page, "save").and.stub();

            hostGroup.select();

            expect(page.save).toHaveBeenCalled();
        });
    });

    describe("getService", function() {

        it("should get the service with the same name", function() {
            var service1 = new Service({name: "service1"});
            hostGroup.addService(service1);
            var service2 = new Service({name: "service2"});
            hostGroup.addService(service2);
            var service3 = new Service({name: "service3"});
            hostGroup.addService(service3);

            expect(hostGroup.getService("service3")).toBe(service3);
        });
    });

    describe("loadData", function() {

        it("should load data for each host and add it to the appropriate services", function() {
            var returningService1 = {name: "service1", instancesByHost: {host1: {id: "service1-host1"}}};
            var returningService2 = {name: "service2", instancesByHost: {host1: {id: "service2-host1"}}};
            var returningService3 = {name: "service1", instancesByHost: {host1: {id: "service1-host2"}}};
            var returningService4 = {name: "service2", instancesByHost: {host1: {id: "service2-host2"}}};
            var returningService5 = {name: "service3", instancesByHost: {host1: {id: "service3-host2"}}};
            var host1 = hostGroup.addHost("host1");
            spyOn(host1, "getData").and.returnValue(jQuery.Deferred().resolve([returningService1, returningService2]));
            var host2 = hostGroup.addHost("host2");
            spyOn(host2, "getData").and.returnValue(jQuery.Deferred().resolve([returningService3, returningService4, returningService5]));

            var service1 = new Service("service1");
            spyOn(service1, "merge").and.stub();
            hostGroup.addService(service1);
            var service2 = new Service("service2");
            spyOn(service2, "merge").and.stub();
            hostGroup.addService(service2);
            var service3 = new Service("service3");
            spyOn(service3, "merge").and.stub();
            hostGroup.addService(service3);

            hostGroup.loadData().then(function() {
                expect(service1.merge).toHaveBeenCalledWith(returningService1);
                expect(service1.merge).toHaveBeenCalledWith(returningService3);
                expect(service2.merge).toHaveBeenCalledWith(returningService2);
                expect(service2.merge).toHaveBeenCalledWith(returningService4);
                expect(service3.merge).toHaveBeenCalledWith(returningService5);
            });
        });
    });

    describe("getServiceHealths", function() {

        var host1;
        var host2;

        beforeEach(function() {
           host1 = hostGroup.addHost("host1");
           host2 = hostGroup.addHost("host2");
        });

        it("should return a ServiceHealth for each service for each host", function() {
            var service1 = new Service({name: "alpha-service"});
            service1.addServiceInstance("host1", new ServiceInstance({id: "service1-host1", version: "1.0.0"}));
            service1.addServiceInstance("host2", new ServiceInstance({id: "service1-host2", version: "1.0.0"}));
            hostGroup.addService(service1);
            var service2 = new Service({name: "beta-service"});
            service2.addServiceInstance("host1", new ServiceInstance({id: "service2-host1", version: "1.0.0"}));
            service2.addServiceInstance("host2", new ServiceInstance({id: "service2-host2", version: "1.0.0"}));
            hostGroup.addService(service2);

            var serviceHealths = hostGroup.getServiceHealths();

            expect(serviceHealths[0].name()).toBe("alpha-service");
            expect(serviceHealths[0].hostHealths()[0].hostName()).toBe("host1");
            expect(serviceHealths[0].hostHealths()[1].hostName()).toBe("host2");

            expect(serviceHealths[1].name()).toBe("beta-service");
            expect(serviceHealths[1].hostHealths()[0].hostName()).toBe("host1");
            expect(serviceHealths[1].hostHealths()[1].hostName()).toBe("host2");
        });

        it("should set HostHealth as unknown if no ServiceInstance for host", function() {
            var service1 = new Service({name: "alpha-service"});
            service1.addServiceInstance("host1", new ServiceInstance({id: "service1-host1", version: "1.0.0"}));
            hostGroup.addService(service1);

            var serviceHealths = hostGroup.getServiceHealths();

            expect(serviceHealths[0].name()).toBe("alpha-service");
            expect(serviceHealths[0].hostHealths()[1].hostName()).toBe("host2");
            expect(serviceHealths[0].hostHealths()[1].status()).toBe(ServiceInstance.Status.UNKNOWN);
        });
    });
});