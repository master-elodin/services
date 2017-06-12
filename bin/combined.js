var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = [    '.data-row { font-size: 18px; line-height: 25px; padding: 5px 0; text-align: left; width: 400px; }  .data-row--invalid { background-color: rgba(150, 0, 0, .2); }  .data-row__data {  }  .data-row__name.data-row__name--editing{ display: flex; justify-content: space-between; padding-left: 25px; } .data-row__name.data-row__name--not-editing { text-align: left; }  .data-row__name input { font-size: 18px; padding-left: 5px; }  .data-row__braces {  }  .data-row__actions { padding-left: 20px; }  .data-row__action { cursor: pointer; font-size: 25px; margin: 0 10px; }  /* TODO: rename? */ .data-block { text-align: left; padding-left: 30px; } ',
    '.service-page { background-color: #ecf0f1; height: 100%; min-height: 100%; }  .service-page__header { background-color: #2c3e50; height: 50px; width: 100%; }  .service-page__header-icon { float: left; height: 100%; }  .service-page__header-icon .fa { color: #ecf0f1; cursor: pointer; font-size: 40px; padding: 5px; }  .service-page__body { display: flex; font-size: 18px; height: calc(100% - 70px); min-height: calc(100% - 70px); padding: 10px; }  .service-page__data-rows { display: flex; flex-direction: column; margin-left: 30px; margin-top: 30px; }  .service-page__edit-toggle { color: #ecf0f1; cursor: pointer; font-size: 30px; position: absolute; right: 20px; top: 10px; }  .service-page__edit-toggle label { cursor: pointer; padding-right: 10px; }  .service-page a:visited { color: #2683f0; } ',
    'html, body { background-color: #ecf0f1; height: 100%; margin: 0; min-height: 100%; padding: 0; }  p { margin: 0 }  a { color: #2683f0; } '].join('');
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
        instance.separator = separator || ", {";
        instance.editModeSeparator = editModeSeparator || instance.separator;
        instance.editing = ko.observable(instance.isNewDataRow);
    
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
    
        instance.previousName = "";
        instance.onCancel = function() {
            instance.name(instance.previousName);
        }
    }
    function ServiceInstance(id, version) {
        var instance = this;
    
        instance.id = id;
        instance.version = version;
        
        instance.status = ko.observable(ServiceInstance.Status.UNKNOWN);
    
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
        RUNNING: "Up",
        STOPPED: "Stopped",
        STOPPING: "Stopping",
        STARTING: "Starting",
        UNKNOWN: "Unknown"
    };
    function Service(name) {
        var instance = this;
    
        instance.name = name;
        instance.instancesByHost = {};
    
        instance.addServiceInstance = function(hostName, serviceInstance) {
            if(!instance.instancesByHost[hostName]) {
                instance.instancesByHost[hostName] = [];
            }
            // find an existing one with the same ID
            var foundExisting = false;
            for(var i = 0; i < instance.instancesByHost[hostName].length; i++) {
                if(instance.instancesByHost[hostName][i].id === serviceInstance.id) {
                    instance.instancesByHost[hostName][i] = serviceInstance;
                    foundExisting = true;
                    break;
                }
            }
            if(!foundExisting) {
                instance.instancesByHost[hostName].push(serviceInstance);
            }
            instance.instancesByHost[hostName].sort(function(a, b) {
                // sort in descending order by version (major.minor.patch)
                var partsA = a.version.split(".");
                var partsB = b.version.split(".");
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
            Object.keys(otherService.instancesByHost).forEach(function(host) {
                otherService.instancesByHost[host].forEach(function(serviceInstance) {
                    instance.addServiceInstance(host, serviceInstance);
                });
            });
        };
    }
    function Host(name) {
        var instance = this;
    
        instance.name = ko.observable(name);
        instance.services = [];
    
        instance.addService = function(newService) {
            var existingService = instance.services.find(function(service) {
                return service.name === newService.name;
            });
            if(existingService) {
                existingService.merge(newService);
            } else {
                instance.services.push(newService);
                instance.services.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
            }
        };
    
        instance.select = function() {
    
        };
    
        instance.dataRow = new DataRow(null, "host", instance.name, instance.select, ",");
    }
    function HostGroup(name) {
        var instance = this;
    
        instance.name = ko.observable(name);
        instance.hosts = ko.observableArray();
    
        instance.addHost = function(hostName) {
            instance.hosts.push(new Host(hostName));
            instance.hosts.sort(function(a, b) {
                return a.name().localeCompare(b.name());
            });
        };
    
        instance.select = function() {
    
        };
    
        instance.dataRow = new DataRow(null, "host-group", instance.name, instance.select, ",", ", {");
        instance.addDataRow = new DataRow(instance.addHost, "host");
    }
    function Environment(name) {
        var instance = this;
    
        instance.name = ko.observable(name);
    
        instance.hostGroups = ko.observableArray();
    
        instance.addHostGroup = function(hostGroupName) {
            instance.hostGroups.push(new HostGroup(hostGroupName));
            instance.hostGroups.sort(function(a, b) {
                return a.name().localeCompare(b.name());
            });
        };
    
        instance.select = function() {
    
        };
    
        instance.dataRow = new DataRow(null, "environment", instance.name, instance.select);
        instance.addDataRow = new DataRow(instance.addHostGroup, "host-group");
    }
    function Application(name) {
        var instance = this;
    
        instance.name = ko.observable(name);
        instance.environments = ko.observableArray();
    
        instance.addEnvironment = function(name) {
            instance.environments.push(new Environment(name));
        };
    
        instance.select = function() {
    
        };
    
        instance.dataRow = new DataRow(null, "application", instance.name, instance.select);
        instance.addDataRow = new DataRow(instance.addEnvironment, "environment");
    }
    function Page() {
        var instance = this;
    
        instance.applications = ko.observableArray();
        instance.editMode = ko.observable(true);
        instance.toggleEdit = function() {
            instance.editMode(!instance.editMode());
            localStorage.setItem(Page.DATA_NAME, JSON.stringify(ko.mapping.toJS(instance)));
            console.log(JSON.stringify(ko.mapping.toJS(instance)));
        }
    
        instance.addApplication = function(name) {
            instance.applications.push(new Application(name));
        };
        instance.addDataRow = new DataRow(instance.addApplication, "application");
    }
    
    Page.DATA_NAME = "all-data";

    jQuery('body').removeClass().removeAttr('style').html('<body><div class="service-page"><div class="service-page__header"><div class="service-page__header-icon"><i class="fa fa-home" aria-hidden="true"></i></div><div data-bind="click: toggleEdit" class="service-page__edit-toggle"><!-- ko ifnot: editMode --><label>EDIT</label><i class="fa fa-toggle-off" aria-hidden="true"></i><!-- /ko --><!-- ko if: editMode --><label>SAVE</label><a href="#">cancel</a><i class="fa fa-toggle-on" aria-hidden="true"></i><!-- /ko --></div></div><div class="service-page__body"><div class="service-page__data-rows"><div class="data-block"><div class="data-row__braces"><span>{</span></div><!-- ko foreach: applications --><div class="data-block"><!-- ko with: dataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --><!-- ko foreach: environments --><div class="data-block"><!-- ko with: dataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --><!-- ko foreach: hostGroups --><div class="data-block"><!-- ko with: dataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --><!-- ko if: $root.editMode --><!-- ko foreach: hosts --><div class="data-block"><!-- ko with: dataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --></div><!-- ko if: $index < $parent.hosts - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- /ko --><!-- ko if: $root.editMode --><!-- ko with: addDataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --><!-- /ko --><div class="data-row__braces"><!-- ko if: $root.editMode --><span>}</span><span>,</span><!-- /ko --></div></div><!-- ko if: $index < $parent.hostGroups - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- ko if: $root.editMode --><!-- ko with: addDataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --><!-- /ko --><div class="data-row__braces"><span>}</span><!-- ko if: $root.editMode --><span>,</span><!-- /ko --></div></div><!-- ko if: $index < $parent.environments.length - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- ko if: $root.editMode --><!-- ko with: addDataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --><!-- /ko --><div class="data-row__braces"><span>}</span><!-- ko if: $root.editMode --><span>,</span><!-- /ko --></div></div><!-- /ko --><!-- ko if: editMode --><!-- ko with: addDataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><!-- ko if: $root.editMode --><span data-bind="text: editModeSeparator"></span><!-- /ko --><!-- ko ifnot: $root.editMode --><span data-bind="text: separator"></span><!-- /ko --></div><!-- /ko --></div></div><!-- /ko --><!-- /ko --><div class="data-row__braces"><span>}</span></div></div></div></div></div></body>');

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

    ko.applyBindings(new Page());
