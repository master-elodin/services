// hide existing body while things are loading
document.body = document.createElement("body");
document.body.innerHTML = "<div><h2>Loading...</h2></div>";
// remove existing css so it doesn't conflict
for(var i=0;i<document.styleSheets.length;i++){document.styleSheets[i].disabled=true;}

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = [    '.data-row { font-size: 18px; line-height: 25px; padding: 5px 0; text-align: left; width: 400px; }  .data-row--invalid { background-color: rgba(150, 0, 0, .2); }  .data-row__data {  }  .data-row__name.data-row__name--editing{ display: flex; justify-content: space-between; }  .data-row__name.data-row__name--new-data{ padding-left: 25px; }  .data-row__name.data-row__name--not-editing { cursor: pointer; text-align: left; }  .data-row__name input { font-size: 18px; padding-left: 5px; }  .data-row__braces {  }  .data-row__actions { padding-left: 20px; }  .data-row__action { cursor: pointer; font-size: 25px; margin: 0 10px; }  /* TODO: rename? */ .data-block { text-align: left; padding-left: 30px; } ',
    '.host-health { display: inline-block; padding: 2px; color: #ecf0f1; }  .host-health__icon { border-radius: 10px; padding: 2px 5px; }  /* TODO: get good colors for health icons */ .host-health__icon.host-health__icon--running { background-color: green; }  .host-health__icon.host-health__icon--stopped { background-color: red; }  .host-health__icon.host-health__icon--starting { background-color: rgba(0, 255, 0, .5); }  .host-health__icon.host-health__icon--stopping { background-color: rgba(255, 0, 0, .5); }  .host-health__icon.host-health__icon--unknown { background-color: grey; } ',
    '.service-page { background-color: #ecf0f1; height: 100%; min-height: 100%; }  .service-page__header { background-color: #2c3e50; color: #ecf0f1; height: 50px; width: 100%; }  .service-page__header-icon { background-color: #152739; float: left; height: 100%; padding: 0 10px; }  .service-page__header-icon .fa { cursor: pointer; font-size: 40px; padding: 5px; }  .service-page__body { display: flex; font-size: 18px; height: calc(100% - 70px); min-height: calc(100% - 70px); padding: 10px; }  .service-page__data-rows { display: flex; flex-direction: column; margin-left: 30px; margin-top: 30px; }  .service-page__edit-toggle { color: #ecf0f1; cursor: pointer; font-size: 30px; position: absolute; right: 20px; top: 10px; }  .service-page__edit-toggle label { cursor: pointer; padding-right: 10px; }  .service-page a:visited { color: #2683f0; }  .service-page__active-items { float: left; font-size: 25px; height: 100%; line-height: 50px; }  .service-page__active-item { background: #152739; cursor: pointer; float: left; padding: 0 30px; width: 150px; }  .service-page__active-item--application { background: linear-gradient(to left, #152739, #1D2F41); }  .service-page__active-item--environment { background: linear-gradient(to left, #1D2F41, #243648); }  .service-page__active-item--host-group { background: linear-gradient(to left, #243648, #2c3e50); }  .service-page__active-item-divider { float: left; }  .service-page__host-group-health { display: flex; flex-direction: column; flex-flow: column wrap; padding: 20px 50px; } ',
    '.service-health { height: 30px; padding: 5px 0; width: 300px; }  .service-health__name { float: left; line-height: 40px; height: 100%; }  .service-health__host-healths { float: right; } ',
    'html, body { background-color: #ecf0f1; font-family: Helvetica, sans-serif; height: 100%; margin: 0; min-height: 100%; padding: 0; }  p { margin: 0 }  a { color: #2683f0; } '].join('');
document.getElementsByTagName('head')[0].appendChild(style);

// TODO: modularize external CSS
var external = document.createElement('link');
external.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
external.rel = "stylesheet";
document.getElementsByTagName('head')[0].appendChild(external);

    function DataRow(onSave, dataType, name, onSelect, separator, editModeSeparator) {
        var instance = this;
    
        instance.invalid = ko.observable(false);
        // if data row is for adding new data as opposed to changing existing data
        instance.isNewDataRow = !name || !name();
        instance.separator = separator || ": {";
        instance.editModeSeparator = editModeSeparator || instance.separator;
        instance.editing = ko.observable(instance.isNewDataRow);
        instance.toggleEdit = function(dataRow, target) {
            instance.editing(!instance.editing());
            if(instance.editing()) {
                // TODO: focus on selected
            }
        };
    
        instance.dataType = dataType;
    
        instance.name = name || ko.observable();
        instance.name.subscribe(function(newValue) {
            instance.invalid(false);
        });
    
        instance.onSave = function() {
            if(instance.name()) {
                instance.invalid(false);
                if(instance.isNewDataRow) {
                    onSave(instance.name());
                    instance.name("");
                } else {
                    instance.editing(false);
                }
            } else {
                instance.invalid(true);
            }
        };
    
        instance.onSelect = onSelect || function() { console.log("select!") };
    
        instance.previousName = instance.name();
        instance.onCancel = function() {
            instance.name(instance.previousName);
            if(!instance.isNewDataRow) {
                instance.editing(false);
            }
        }
    }
    function ServiceInstance(loadingData) {
        var instance = this;
    
        instance.id = ko.observable(loadingData.id);
        instance.version = ko.observable(loadingData.version);
        
        instance.status = ko.observable(loadingData.status || ServiceInstance.Status.UNKNOWN);
    
        instance.isRunning = function() {
            return instance.status() === ServiceInstance.Status.RUNNING;
        }
    
        instance.start = function() {
            console.log( "Start!" );
        }
    
        instance.stop = function() {
            console.log( "Stop!" );
        }
    
        instance.restart = function() {
            console.log( "Restart!" );
        }
    }
    ServiceInstance.Status = {
        // TODO: find real statuses
        // TODO: add ForceStopping, Not Responding
        RUNNING: "Up",
        STOPPED: "Stopped",
        STOPPING: "Stopping",
        STARTING: "Starting",
        UNKNOWN: "Unknown"
    };
    /* Viewmodel for showing host-group health */
    function ServiceHealth(loadingData) {
        var instance = this;
    
        instance.name = ko.observable(loadingData.name);
        instance.hostHealths = ko.observableArray();
        instance.addHostHealth = function(hostHealth) {
            instance.hostHealths.push(hostHealth);
        }
    }
    /* Per-host component of Service Health */
    function HostHealth(loadingData) {
        var instance = this;
    
        // TODO: do these really need to be observables and computeds? Will this data just be overwritten?
        instance.hostName = ko.observable(loadingData.hostName);
        instance.status = ko.observable(loadingData.status || ServiceInstance.Status.UNKNOWN);
    
        var iconMappings = {};
        iconMappings[ServiceInstance.Status.RUNNING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--running" };
        iconMappings[ServiceInstance.Status.STOPPED] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--stopped" };
        // TODO: different colors or icons for starting and stopping
        iconMappings[ServiceInstance.Status.STARTING] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--starting" };
        iconMappings[ServiceInstance.Status.STOPPING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--stopping" };
        iconMappings[ServiceInstance.Status.UNKNOWN] = { icon: "fa-question-circle-o", colorClass: "host-health__icon--unknown" };
    
        instance.getHealthIcon = ko.pureComputed(function() {
            return iconMappings[instance.status()].icon;
        });
    
        instance.getHealthColorClass = ko.pureComputed(function() {
            return iconMappings[instance.status()].colorClass;
        });
    }
    function Service(loadingData) {
        var instance = this;
    
        instance.name = ko.observable(loadingData.name);
        instance.instancesByHost = ko.observable({});
    
        instance.getInstancesForHost = function(hostName) {
            if(!instance.instancesByHost()[hostName]) {
                instance.instancesByHost()[hostName] = [];
            }
            return instance.instancesByHost()[hostName];
        };
    
        instance.addServiceInstance = function(hostName, serviceInstance) {
            var instancesForHost = instance.getInstancesForHost(hostName);
            // find an existing one with the same ID
            var foundExisting = false;
            for(var i = 0; i < instancesForHost.length; i++) {
                if(instancesForHost[i].id() === serviceInstance.id()) {
                    instancesForHost[i] = serviceInstance;
                    foundExisting = true;
                    break;
                }
            }
            if(!foundExisting) {
                instancesForHost.push(serviceInstance);
            }
            instancesForHost.sort(function(a, b) {
                // sort in descending order by version (major.minor.patch)
                var partsA = a.version().split(".");
                var partsB = b.version().split(".");
                for(var i = 0; i < partsA.length; i++) {
                    var diff = parseInt(partsB[i]) - parseInt(partsA[i]);
                    if(diff !== 0) {
                        return diff;
                    }
                }
                return 0;
            });
        };
    
        instance.merge = function(otherService) {
            // add each service from each host on otherService
            Object.keys(otherService.instancesByHost()).forEach(function(host) {
                otherService.getInstancesForHost(host).forEach(function(serviceInstance) {
                    instance.addServiceInstance(host, serviceInstance);
                });
            });
        };
    
        Object.keys(loadingData.instancesByHost || {}).forEach(function(host) {
            loadingData.instancesByHost[host].forEach(function(serviceInstanceData) {
                instance.addServiceInstance(host, new ServiceInstance(serviceInstanceData));
            });
        });
    
        instance.getRunningOrHighestVersionInstance = function(hostName) {
            // versions are already sorted, so just grab the first one
            return instance.getInstancesForHost(hostName)[0] || Service.UNKNOWN_INSTANCE;
        }
    }
    Service.UNKNOWN_INSTANCE = new ServiceInstance({id: "UNKNOWN", version: "0.0.0"});
    function Host(name) {
        var instance = this;
    
        instance.name = ko.observable(name);
    
        instance.dataRow = new DataRow(null, "host", instance.name, null, ",");
    
        instance.getData = function() {
            var getRandomNumber = function(upperBound) {
                return Math.floor(Math.random()*upperBound);
            };
    
            var createFakeService = function(serviceName) {
                var service = new Service({name: serviceName});
                var version = [1, getRandomNumber(5), getRandomNumber(10)].join(".");
                var possibleStatii = Object.keys(ServiceInstance.Status);
                var status = ServiceInstance.Status[possibleStatii[getRandomNumber(possibleStatii.length)]];
                service.addServiceInstance(instance.name(), new ServiceInstance({id: serviceName + instance.name(), version: version, status: status}));
                return service;
            }
            var results = [];
            for(var i = 0; i < getRandomNumber(25); i++) {
                results.push(createFakeService("service" + i));
            }
            return jQuery.Deferred().resolve(results);
        };
    }
    function HostGroup(loadingData) {
        var instance = this;
    
        instance.parent = loadingData.parent;
        instance.page = loadingData.page;
        instance.name = ko.observable(loadingData.name);
        instance.hosts = ko.observableArray();
        instance.services = ko.observableArray();
    
        instance.addHost = function(hostName) {
            var host = new Host(hostName);
            instance.hosts.push(host);
            instance.hosts.sort(function(a, b) {
                return a.name().localeCompare(b.name());
            });
            return host;
        };
    
        instance.addService = function(newService) {
            var existingService = instance.getService(newService.name());
            if(existingService) {
                existingService.merge(newService);
            } else {
                instance.services.push(newService);
                instance.services.sort(function(a, b) {
                    return a.name().localeCompare(b.name());
                });
            }
        };
    
        instance.isActive = ko.observable(false);
        instance.select = function() {
            instance.isActive(!instance.isActive());
            if(instance.isActive()) {
                instance.page.activateItem(instance);
            }
            instance.page.save();
        };
    
        instance.dataRow = new DataRow(null, "host-group", instance.name, instance.select, ",", ", {");
        instance.addDataRow = new DataRow(instance.addHost, "host");
    
        instance.getService = function(serviceName) {
            return instance.services().find(function(service) {
                return service.name() === serviceName;
            });
        };
    
        instance.loadData = function() {
            var loadCompleted = jQuery.Deferred();
            var numHosts = instance.hosts().length;
            var numCompleted = 0;
            instance.hosts().forEach(function(host) {
                host.getData().then(function(servicesDataForHost) {
                    servicesDataForHost.forEach(instance.addService);
                    if(++numCompleted === numHosts) {
                        loadCompleted.resolve();
                    }
                });
            });
            return loadCompleted;
        };
    
        instance.getServiceHealths = ko.pureComputed(function() {
            var serviceHealths = [];
            instance.services().forEach(function(service) {
                var serviceHealth = new ServiceHealth({name: service.name()});
                instance.hosts().forEach(function(host) {
                    var serviceInstance = service.getRunningOrHighestVersionInstance(host.name());
                    serviceHealth.addHostHealth(new HostHealth({hostName: host.name(), status: serviceInstance.status()}));
                });
                serviceHealths.push(serviceHealth);
            });
            return serviceHealths;
        });
    }
    function Environment(loadingData) {
        var instance = this;
    
        instance.page = loadingData.page;
        instance.parent = loadingData.parent;
        instance.name = ko.observable(loadingData.name);
    
        instance.hostGroups = ko.observableArray();
        instance.addHostGroup = function(hostGroupName) {
            var hostGroup = new HostGroup({name: hostGroupName, page: instance.page, parent: instance});
            instance.hostGroups.push(hostGroup);
            instance.hostGroups.sort(function(a, b) {
                return a.name().localeCompare(b.name());
            });
            return hostGroup;
        };
    
        instance.isActive = ko.observable(false);
        instance.select = function() {
            instance.isActive(!instance.isActive());
            if(instance.isActive()) {
                instance.page.activateItem(instance);
            }
            instance.page.save();
        };
    
        instance.dataRow = new DataRow(null, "environment", instance.name, instance.select);
        instance.addDataRow = new DataRow(instance.addHostGroup, "host-group");
    }
    function Application(loadingData) {
        var instance = this;
    
        instance.page = loadingData.page;
        instance.name = ko.observable(loadingData.name);
    
        instance.environments = ko.observableArray();
        instance.addEnvironment = function(name) {
            var environment = new Environment({name: name, page: instance.page, parent: instance});
            instance.environments.push(environment);
            return environment;
        };
    
        instance.isActive = ko.observable(false);
        instance.select = function() {
            instance.isActive(!instance.isActive());
            if(instance.isActive()) {
                instance.page.activateItem(instance);
            }
            instance.page.save();
        };
    
        instance.dataRow = new DataRow(null, "application", instance.name, instance.select);
        instance.addDataRow = new DataRow(instance.addEnvironment, "environment");
    }
    function Page() {
        var instance = this;
    
        instance.applications = ko.observableArray();
        instance.editMode = ko.observable(false);
        instance.toggleEdit = function() {
            instance.editMode(!instance.editMode());
            if(!instance.editMode()) {
                instance.save();
            }
        }
    
        instance.showHostGroupHealth = ko.pureComputed(function() {
            return !!instance.activeHostGroup() && !instance.editMode();
        });
    
        instance.save = function() {
            var SAVEABLE_TYPES = [String, Boolean];
            var addObservables = function(obj) {
                var objToSave = {};
                Object.keys(obj).forEach(function(key) {
                    if(ko.isObservable(obj[key])) {
                        var value = obj[key]();
                        if(!value || SAVEABLE_TYPES.indexOf(value.constructor) > -1) {
                            objToSave[key] = value;
                        } else if(value.constructor === Array) {
                            objToSave[key] = [];
                            value.forEach(function(val) {
                                objToSave[key].push(addObservables(val));
                            });
                        } else {
                            objToSave[key] = addObservables(value);
                        }
                    }
                });
                return objToSave;
            }
            var objToSave = addObservables(instance);
            localStorage.setItem(Page.DATA_NAME, JSON.stringify(ko.mapping.toJS(objToSave)));
            if(instance.activeHostGroup()) {
                // re-activate in order to re-load
                instance.activateItem(instance.activeHostGroup());
            }
        }
    
        instance.addApplication = function(name) {
            var application = new Application({name: name, page: instance});
            instance.applications.push(application);
            return application;
        };
        instance.addDataRow = new DataRow(instance.addApplication, "application");
    
        instance.load = function() {
            var existingPageJson = localStorage.getItem(Page.DATA_NAME);
            if(existingPageJson) {
                var existingPage = JSON.parse(existingPageJson);
                // TODO: find better way to do this rather than lots of loops.
                existingPage.applications.forEach(function(app) {
                    var application = instance.addApplication(app.name);
                    application.isActive(!!app.isActive);
                    var isActiveApp = existingPage.activeApp && existingPage.activeApp.name === app.name;
                    if(isActiveApp) {
                        instance.activateItem(application);
                    }
                    app.environments.forEach(function(env) {
                        var environment = application.addEnvironment(env.name);
                        environment.isActive(!!env.isActive);
                        var isActiveEnv = isActiveApp && existingPage.activeEnv && existingPage.activeEnv.name === env.name;
                        if(isActiveEnv) {
                            instance.activateItem(environment);
                        }
                        env.hostGroups.forEach(function(group) {
                            var hostGroup = environment.addHostGroup(group.name);
                            hostGroup.isActive(!!group.isActive);
                            if(isActiveEnv && existingPage.activeHostGroup && existingPage.activeHostGroup.name === group.name) {
                                instance.activateItem(hostGroup);
                            }
                            group.hosts.forEach(function(host) {
                                hostGroup.addHost(host.name);
                            });
                            group.services.forEach(function(service) {
                                hostGroup.addService(new Service(service));
                            });
                        });
                    });
                });
            } else {
                instance.editMode(true);
            }
        };
    
        instance.activeApp = ko.observable();
        instance.activeEnv = ko.observable();
        instance.activeHostGroup = ko.observable();
        instance.activateItem = function(item) {
            var updateActiveItem = function(current, newVal, onChange) {
                if(current()) {
                    current().isActive(false);
                }
                onChange();
                newVal.isActive(true);
                current(newVal);
            }
            if(item.constructor === Application) {
                var onChange = function() {
                    instance.activeEnv(null); 
                    instance.activeHostGroup(null);
                };
                updateActiveItem(instance.activeApp, item, onChange);
            } else if(item.constructor === Environment) {
                var onChange = function() {
                    instance.activateItem(item.parent);
                    instance.activeHostGroup(null);
                };
                updateActiveItem(instance.activeEnv, item, onChange);
            } else if(item.constructor === HostGroup) {
                var onChange = function() {
                    instance.activateItem(item.parent);
                    item.loadData();
                };
                updateActiveItem(instance.activeHostGroup, item, onChange);
            }
        }
    }
    
    Page.DATA_NAME = "all-data";

    jQuery('body').removeClass().removeAttr('style').html('<body><div class="service-page"><div class="service-page__header"><div class="service-page__header-icon"><i class="fa fa-home" aria-hidden="true"></i></div><div class="service-page__active-items"><!-- ko with: activeApp --><div data-bind="click: $root.activateItem" class="service-page__active-item service-page__active-item--application"><span data-bind="text: name"></span></div><!-- /ko --><!-- ko with: activeEnv --><div data-bind="click: $root.activateItem" class="service-page__active-item service-page__active-item--environment"><span data-bind="text: name"></span></div><!-- /ko --><!-- ko with: activeHostGroup --><div class="service-page__active-item service-page__active-item--host-group"><span data-bind="text: name"></span></div><!-- /ko --></div><div data-bind="click: toggleEdit" class="service-page__edit-toggle"><!-- ko ifnot: editMode --><label>EDIT</label><i class="fa fa-toggle-off" aria-hidden="true"></i><!-- /ko --><!-- ko if: editMode --><label>SAVE</label><a href="#">cancel</a><i class="fa fa-toggle-on" aria-hidden="true"></i><!-- /ko --></div></div><div class="service-page__body"><!-- ko if: showHostGroupHealth --><!-- ko with: activeHostGroup --><div class="service-page__host-group-health"><!-- ko if: services().length === 0 --><span>No hosts selected for given host-group!</span><br/><span>Edit settings to add hosts.</span><!-- /ko --><!-- ko foreach: getServiceHealths --><div class="service-health"><div class="service-health__name"><span data-bind="text: name"></span></div><div class="service-health__host-healths"><!-- ko foreach: hostHealths --><div class="host-health"><div data-bind="css: getHealthColorClass" class="host-health__icon"><i data-bind="css: getHealthIcon" class="fa" aria-hidden="true"></i></div></div><!-- /ko --></div></div><!-- /ko --></div><!-- /ko --><!-- /ko --><!-- ko ifnot: showHostGroupHealth --><div class="service-page__data-rows"><div class="data-block"><div class="data-row__braces"><span>{</span></div><!-- ko foreach: applications --><div class="data-block"><!-- ko with: dataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --><!-- ko if: isActive() ||  $root.editMode() --><!-- ko foreach: environments --><div class="data-block"><!-- ko with: dataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --><!-- ko if: isActive() ||  $root.editMode() --><!-- ko foreach: hostGroups --><div class="data-block"><!-- ko with: dataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --><!-- ko if: $root.editMode --><!-- ko foreach: hosts --><div class="data-block"><!-- ko with: dataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --></div><!-- ko if: $index < $parent.hosts - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- ko with: addDataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --><div class="data-row__braces"><span>}</span><span>,</span></div><!-- /ko --></div><!-- ko if: $index < $parent.hostGroups - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- /ko --><!-- ko if: $root.editMode --><!-- ko with: addDataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --><!-- /ko --><div class="data-row__braces"><span>}</span><!-- ko if: $root.editMode --><span>,</span><!-- /ko --></div></div><!-- ko if: $index < $parent.environments.length - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- /ko --><!-- ko if: $root.editMode --><!-- ko with: addDataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --><!-- /ko --><div class="data-row__braces"><span>}</span><!-- ko if: $root.editMode --><span>,</span><!-- /ko --></div></div><!-- /ko --><!-- ko if: editMode --><!-- ko with: addDataRow --><div data-bind="click: onSelect" class="data-row"><div class="data-row__data"><!-- ko if: editing --><div data-bind="css: {\'data-row__name--new-data\': isNewDataRow}" class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><!-- ko if: $root.editMode --><div data-bind="click: toggleEdit" class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: editModeSeparator"></span></div><!-- /ko --><!-- ko ifnot: $root.editMode --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span data-bind="text: separator"></span></div><!-- /ko --><!-- /ko --></div></div><!-- /ko --><!-- /ko --><div class="data-row__braces"><span>}</span></div></div></div><!-- /ko --></div></div></body>');

    ko.bindingHandlers.enterkey = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var callback = valueAccessor();
            $(element).keypress(function (event) {
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13) {
                    callback.call(viewModel);
                    return false;
                }
                return true;
            });
        }
    };
    var page = new Page();
    page.load();

    ko.applyBindings(page);
