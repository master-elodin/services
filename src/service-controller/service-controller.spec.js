describe("ServiceController", function() {
    
    var activeHostGroup;
    var serviceController;

    beforeEach(function() {
        activeHostGroup = ko.observable({getServiceHealths: function() {}});
        serviceController = new ServiceController({activeHostGroup: activeHostGroup});
    });

    afterEach(function() {
        activeHostGroup = null;
        serviceController = null;
    });

    var createHostHealth = function(selected, id, version, hostName) {
        return {selected: ko.observable(selected), id: ko.observable(id), version: ko.observable(version), hostName: ko.observable(hostName), isReal: ko.observable(true)};
    }

    describe("addSelected", function() {

        it("should add data for each service that has a selected host", function() {
            activeHostGroup().getServiceHealths = function() {
                var serviceHealth1 = {
                    name: ko.observable("serviceHealth1"),
                    hostHealths: ko.observableArray([
                        createHostHealth(true, "id1", "1.21.0", "host1"),
                        createHostHealth(true, "id2", "1.21.1", "host2"),
                        createHostHealth(false, "id3", "1.21.0", "host1")
                    ])
                };
                var serviceHealth2 = {
                    name: ko.observable("serviceHealth2"),
                    hostHealths: ko.observableArray([
                        createHostHealth(false, "id4", "1.22.0", "host1")
                    ])
                };
                var serviceHealth3 = {
                    name: ko.observable("serviceHealth3"),
                    hostHealths: ko.observableArray([
                        createHostHealth(true, "id5", "1.23.0", "host1"),
                        createHostHealth(false, "id6", "1.23.0", "host2")
                    ])
                };
                return [serviceHealth1, serviceHealth2, serviceHealth3];
            }

            serviceController.addSelected();

            expect(serviceController.selectionGroup()[0].services().length).toBe(2);
            expect(serviceController.selectionGroup()[0].services()[0].name).toBe("serviceHealth1");
            expect(serviceController.selectionGroup()[0].services()[0].data()[0].id).toBe("id1");
            expect(serviceController.selectionGroup()[0].services()[0].data()[0].version).toBe("1.21.0");
            expect(serviceController.selectionGroup()[0].services()[0].data()[1].id).toBe("id2");
            expect(serviceController.selectionGroup()[0].services()[0].data()[1].version).toBe("1.21.1");
            expect(serviceController.selectionGroup()[0].services()[1].name).toBe("serviceHealth3");
            expect(serviceController.selectionGroup()[0].services()[1].data()[0].id).toBe("id5");
            expect(serviceController.selectionGroup()[0].services()[1].data()[0].version).toBe("1.23.0");
        });

        it("should set selected to be false for all hostHealths", function() {
            var serviceHealth1 = {
                name: ko.observable("serviceHealth1"),
                hostHealths: ko.observableArray([
                    createHostHealth(true, "id1", "1.21.0", "host1"),
                    createHostHealth(false, "id2", "1.21.0", "host1")
                ])
            };
            var serviceHealth2 = {
                name: ko.observable("serviceHealth2"),
                hostHealths: ko.observableArray([
                    createHostHealth(false, "id3", "1.22.0", "host1")
                ])
            };
            activeHostGroup().getServiceHealths = function() {
                return [serviceHealth1, serviceHealth2];
            }

            serviceController.addSelected();

            expect(serviceHealth1.hostHealths()[0].selected()).toBe(false);
            expect(serviceHealth1.hostHealths()[1].selected()).toBe(false);
            expect(serviceHealth2.hostHealths()[0].selected()).toBe(false);
        });

        it("should sort service instance data based on host name", function() {
            var serviceHealth1 = {
                name: ko.observable("serviceHealth1"),
                hostHealths: ko.observableArray([
                    createHostHealth(true, "id1", "1.21.0", "host2"),
                    createHostHealth(true, "id2", "1.21.0", "host1")
                ])
            };
            var serviceHealth2 = {
                name: ko.observable("serviceHealth2"),
                hostHealths: ko.observableArray([
                    createHostHealth(true, "id3", "1.22.0", "host1")
                ])
            };
            activeHostGroup().getServiceHealths = function() {
                return [serviceHealth1, serviceHealth2];
            }

            serviceController.addSelected();

            expect(serviceController.selectionGroup()[0].services()[0].data()[0].id).toBe("id2");
            expect(serviceController.selectionGroup()[0].services()[0].data()[1].id).toBe("id1");
            expect(serviceController.selectionGroup()[0].services()[1].data()[0].id).toBe("id3");
        });

        it("should not include non-real host healths", function() {
            var serviceHealth1 = {
                name: ko.observable("serviceHealth1"),
                hostHealths: ko.observableArray([
                    createHostHealth(true, "id1", "1.21.0", "host2"),
                    createHostHealth(true, "id2", "1.21.0", "host1")
                ])
            };
            serviceHealth1.hostHealths()[0].isReal(false);
            activeHostGroup().getServiceHealths = function() {
                return [serviceHealth1];
            }

            serviceController.addSelected();

            expect(serviceController.selectionGroup()[0].services()[0].data().length).toBe(1);
        });
    });
});