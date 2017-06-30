// set SCRIPT_VERSION here because it's set in the templates by the build
var SCRIPT_VERSION = "1.0.0";

describe("A Page", function() {

    var page;

    // for testing purposes only
    Item.prototype.addChildWithName = function(name) {
        this.newChildName(name);
        this.addChild();
    }

    beforeEach(function() {
        page = new Page();
        localStorage.removeItem(Page.DATA_NAME);
    });

    afterEach(function() {
        page = null;
    });

    var itemSuffix = 0;

    var createItem = function(name, childrenType, parent) {
        var item = new Item({name: name});
        item.childrenType = childrenType;
        item.parent = parent;
        return item;
    };

    var createApp = function() {
        return createItem("app" + itemSuffix++, Item.ChildrenTypes.ENV);
    }

    var createEnv = function() {
        return createItem("env" + itemSuffix++, Item.ChildrenTypes.HOST_GROUP, createApp());
    }

    var createHostGroup = function() {
        return createItem("host-group" + itemSuffix++, Item.ChildrenTypes.HOST, createEnv());
    }

    describe("load", function() {

        it("should set editMode=true if local storage does not exist", function() {
            page.load();

            expect(page.editMode()).toBe(true);
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

        it("should save to localStorage if no longer editing", function() {
            page.editMode(true);
            spyOn(page, "save").and.stub();

            page.toggleEdit();

            expect(page.save).toHaveBeenCalled();
        });

        it("should not save to localStorage if editing", function() {
            page.editMode(false);
            spyOn(page, "save").and.stub();

            page.toggleEdit();

            expect(page.save).not.toHaveBeenCalled();
        });
    });

    describe("cancelEdit", function() {

        it("should load then turn off edit mode", function() {
            page.editMode(true);
            spyOn(page, "load").and.stub();

            page.cancelEdit();

            expect(page.load).toHaveBeenCalled();
            expect(page.editMode()).toBe(false);
        });
    });

    describe("activateItem", function() {

        it("should set activeApp if childrenType is ENV", function() {
            var item = createApp();

            page.activateItem(item);

            expect(page.activeApp()).toBe(item);
            expect(page.activeEnv()).toBe(null);
            expect(page.activeHostGroup()).toBe(null);
        });

        it("should set activeApp if childrenType is HOST_GROUP", function() {
            var env = createEnv();

            page.activateItem(env);

            expect(page.activeApp()).toBe(env.parent);
            expect(page.activeEnv()).toBe(env);
            expect(page.activeHostGroup()).toBe(null);
        });

        it("should set activeEnv and activeApp if childrenType is HOST", function() {
            var hostGroup = createHostGroup();

            page.activateItem(hostGroup);

            expect(page.activeApp()).toBe(hostGroup.parent.parent);
            expect(page.activeEnv()).toBe(hostGroup.parent);
            expect(page.activeHostGroup()).toBe(hostGroup);
        });

        describe("setting isActive", function() {

            it("should set new item isActive=true and old isActive=false if app", function() {
                var item1 = createApp();
                var item2 = createApp();

                page.activateItem(item1);

                expect(page.activeApp()).toBe(item1);
                expect(item1.isActive()).toBe(true);
                expect(item2.isActive()).toBe(false);

                page.activateItem(item2);

                expect(page.activeApp()).toBe(item2);
                expect(item1.isActive()).toBe(false);
                expect(item2.isActive()).toBe(true);
            });

            it("should set new item isActive=true and old isActive=false if env", function() {
                var item1 = createEnv();
                var item2 = createEnv();

                page.activateItem(item1);

                expect(page.activeEnv()).toBe(item1);
                expect(item1.isActive()).toBe(true);
                expect(item2.isActive()).toBe(false);

                page.activateItem(item2);

                expect(page.activeEnv()).toBe(item2);
                expect(item1.isActive()).toBe(false);
                expect(item2.isActive()).toBe(true);
            });

            it("should set new item isActive=true and old isActive=false if host-group", function() {
                var item1 = createHostGroup();
                var item2 = createHostGroup();

                page.activateItem(item1);

                expect(page.activeHostGroup()).toBe(item1);
                expect(item1.isActive()).toBe(true);
                expect(item2.isActive()).toBe(false);

                page.activateItem(item2);

                expect(page.activeHostGroup()).toBe(item2);
                expect(item1.isActive()).toBe(false);
                expect(item2.isActive()).toBe(true);
            });
        });
    });

    describe("activeHostGroup", function() {

        it("should call refresh on change", function() {
            spyOn(page, "refresh").and.stub();

            page.activeHostGroup(createHostGroup());

            expect(page.refresh).toHaveBeenCalled();

            page.activeHostGroup(createHostGroup());

            expect(page.refresh).toHaveBeenCalled();
        });
    });

    describe("showHostGroupHealth", function() {

        it("should return true if showRefreshIcon and no activeService", function() {
            spyOn(page, "showRefreshIcon").and.returnValue(true);
            page.activeService(null);

            expect(page.showHostGroupHealth()).toBe(true);
        });

        it("should return false if activeService", function() {
            spyOn(page, "showRefreshIcon").and.returnValue(true);
            page.activeService({});

            expect(page.showHostGroupHealth()).toBe(false);
        });
    });

    describe("showRefreshIcon", function() {

        it("should return true if host-group is selected", function() {
            page.activateItem(createHostGroup());

            expect(page.showRefreshIcon()).toBe(true);
        });

        it("should return false if no host-group is selected", function() {
            page.activeHostGroup(null);

            expect(page.showRefreshIcon()).toBe(false);
        });

        it("should return false if editMode=true", function() {
            page.activateItem(createHostGroup());

            page.editMode(true);

            expect(page.showRefreshIcon()).toBe(false);
        });
    });

    describe("refresh", function() {

        var activeHostGroup;

        beforeEach(function() {
            activeHostGroup = createHostGroup();
            page.activateItem(activeHostGroup);

            spyOn(Data, "getDataForHosts").and.returnValue(jQuery.Deferred().resolve([]));
        });

        afterEach(function() {
            activeHostGroup = null;
        });

        it("should call Data.getDataForHosts for each host in activeHostGroup if not refreshing when clicked", function() {
            var hostGroup = createHostGroup();
            hostGroup.addChildWithName("host1");
            hostGroup.addChildWithName("host2");
            page.activeHostGroup(hostGroup);

            page.isRefreshing(false);

            page.refresh();

            expect(Data.getDataForHosts).toHaveBeenCalledWith(hostGroup.getChildrenNames());
        });

        it("should set isRefreshing=true if not refreshing and has activeHostGroup when clicked", function() {
            page.isRefreshing(false);

            page.refresh();

            expect(page.isRefreshing()).toBe(true);
        });

        it("should not set isRefreshing=true if no activeHostGroup", function() {
            page.isRefreshing(false);
            page.activeHostGroup(null);

            page.refresh();

            expect(page.isRefreshing()).toBe(false);
        });
    });

    describe("addServiceData", function() {

        var serviceList;

        beforeEach(function() {
            serviceList = [];
            page.activeHostGroup(createHostGroup());
        });

        afterEach(function() {
            serviceList = null;
        });

        it("should add services in name order if no existing services", function() {
            serviceList.push(new Service({name: "service2"}));
            serviceList.push(new Service({name: "service1"}));

            page.addServiceData(serviceList);

            expect(page.getServicesForActiveHostGroup().length).toBe(2);
            expect(page.getServicesForActiveHostGroup()[0].name).toBe("service1");
            expect(page.getServicesForActiveHostGroup()[1].name).toBe("service2");
        });

        it("should merge service if existing service with same name", function() {
            var service1 = new Service({name: "service1"});
            spyOn(service1, "merge").and.stub();
            serviceList.push(service1);
            var service2 = new Service({name: "service1"});
            serviceList.push(service2);

            page.addServiceData(serviceList);

            expect(page.getServicesForActiveHostGroup().length).toBe(1);
            expect(service1.merge).toHaveBeenCalledWith(service2);
        });
    });

    describe("getServicesForActiveHostGroup", function() {

        it("should return services for activeHostGroup", function() {
            expect(page.getServicesForActiveHostGroup().length).toBe(0);

            var services = [new Service({name: "service1"}), new Service({name: "service2"})];
            var hostGroup = createHostGroup();
            page.activeHostGroup(hostGroup);
            page.activeServices(services);

            expect(page.getServicesForActiveHostGroup().length).toBe(2);
            expect(page.getServicesForActiveHostGroup()[0]).toBe(services[0]);
            expect(page.getServicesForActiveHostGroup()[1]).toBe(services[1]);
        });

        it("should exclude services that don't match filter", function() {
            var service1 = new Service({name: "alpha service"});
            var service2 = new Service({name: "beta service"});
            var service3 = new Service({name: "different name"});
            var hostGroup = createHostGroup();
            page.activeHostGroup(hostGroup);
            page.activeServices([service1, service2, service3]);

            page.filterValue("service");

            expect(page.getServicesForActiveHostGroup()[0]).toBe(service1);
            expect(page.getServicesForActiveHostGroup()[1]).toBe(service2);

            page.filterValue("service Bet");

            expect(page.getServicesForActiveHostGroup()[0]).toBe(service2);
        });
    });

    describe("selectService", function() {

        it("should set active service if startStopUnlocked=false", function() {
            page.startStopUnlocked(false);
            var service = new Service({});

            page.selectService(service);

            expect(page.activeService()).toBe(service);
        });

        it("should set service instances as selected=true if startStopUnlocked=true", function() {
            page.startStopUnlocked(true);
            var activeHostGroup = new Item({});
            activeHostGroup.addChildWithName("host1");
            activeHostGroup.addChildWithName("host2");
            page.activeHostGroup(activeHostGroup);
            var service = new Service({});
            service.addInstance(new ServiceInstance({id: "id1", hostName: "host1", version: ""}));
            service.addInstance(new ServiceInstance({id: "id2", hostName: "host1", version: ""}));
            service.addInstance(new ServiceInstance({id: "id3", hostName: "host2", version: ""}));

            page.selectService(service);

            expect(service.getFirstInstanceForHost("host1").selected()).toBe(true);
            expect(service.getFirstInstanceForHost("host2").selected()).toBe(true);
        });
    });
});