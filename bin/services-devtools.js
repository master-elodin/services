// @name         Services
// @version      0.0.1
// @description  Make the Service Console look nicer!
// @author       Tim VanDoren

var addScript=function(a){var b=document.createElement("script");b.src=a,document.getElementsByTagName("head")[0].appendChild(b)};
var scripts = ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js","https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min.js","https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping.min.js"];
scripts.forEach(addScript);

setTimeout(function(){
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = [    '.data-block { text-align: left; }  .data-block--page {  }  .data-block--application { padding-left: 30px; }  .data-block--environment { padding-left: 60px; } ',
    '.data-row { font-size: 18px; line-height: 25px; padding: 5px 0; text-align: left; width: 400px; }  .data-row--invalid { background-color: rgba(150, 0, 0, .2); }  .data-row__data {  }  .data-row__name.data-row__name--editing{ display: flex; justify-content: space-between; padding-left: 25px; } .data-row__name.data-row__name--not-editing { text-align: left; }  .data-row__name input { font-size: 18px; padding-left: 5px; }  .data-row__braces {  }  .data-row__actions {  }  .data-row__action { cursor: pointer; font-size: 25px; margin: 0 10px; } ',
    '.service-page { background-color: rgba(255, 255, 255, .7); height: 100%; min-height: 100%; }  .service-page__header { background-color: rgba(0, 0, 0, .7); height: 50px; width: 100%; }  .service-page__header-icon { float: left; height: 100%; }  .service-page__header-icon .fa { color: rgba(255, 255, 255, .7); cursor: pointer; font-size: 40px; padding: 5px; }  .service-page__body { display: flex; font-size: 18px; height: calc(100% - 70px); min-height: calc(100% - 70px); padding: 10px; }  .service-page__data-rows { display: flex; flex-direction: column; margin-left: 30px; margin-top: 30px; } ',
    'html, body { background-color: rgba(255, 255, 255, .7); height: 100%; margin: 0; min-height: 100%; padding: 0; }  p { margin: 0 } '].join('');
document.getElementsByTagName('head')[0].appendChild(style);

// TODO: modularize external CSS
var external = document.createElement('link');
external.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
external.rel = "stylesheet";
document.getElementsByTagName('head')[0].appendChild(external);

    function DataRow(onSave, dataType, name, onSelect) {
        var instance = this;
    
        instance.invalid = ko.observable(false);
        // if data row is for adding new data as opposed to changing existing data
        instance.isNewDataRow = !name || !name();
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
    }
    function Environment(name) {
        var instance = this;
    
        instance.name = ko.observable(name);
    
        instance.hostGroups = ko.observableArray();
    
        instance.addHost = function(hostGroupName) {
            instance.hostGroups.push(new HostGroup(hostGroupName));
            instance.hostGroups.sort(function(a, b) {
                return a.name().localeCompare(b.name());
            });
        }
    
        instance.dataRow = new DataRow(instance.addHost, "environment", instance.name);
        instance.addHostGroupRow = new DataRow(instance.addHost, "host-group");
    }
    function Application(name) {
        var instance = this;
    
        instance.name = ko.observable(name);
        instance.environments = ko.observableArray();
    
        instance.addEnvironment = function(name) {
            instance.environments.push(new Environment(name));
        };
    
        instance.dataRow = new DataRow(null, "application", instance.name);
        instance.addEnvironmentRow = new DataRow(instance.addEnvironment, "environment");
    }
    function Page() {
        var instance = this;
    
        instance.applications = ko.observableArray();
        instance.editMode = ko.observable(true);
    
        instance.addApplication = function(name) {
            instance.applications.push(new Application(name));
        };
        instance.addNewDataRow = new DataRow(instance.addApplication, "application");
    }

    jQuery('body').removeClass().removeAttr('style').html('<body><div class="service-page"><div class="service-page__header"><div class="service-page__header-icon"><i class="fa fa-home" aria-hidden="true"></i></div></div><div class="service-page__body"><div class="service-page__data-rows"><div class="data-block data-block--page"><div class="data-row__braces"><span>{</span></div><!-- ko foreach: applications --><div class="data-block data-block--application"><!-- ko with: dataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span>: {</span></div><!-- /ko --></div></div><!-- /ko --><!-- ko foreach: environments --><div class="data-block data-block--environment"><!-- ko with: dataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span>: {</span></div><!-- /ko --></div></div><!-- /ko --><!-- ko foreach: hostGroups --><div class="host-group"></div><!-- ko if: $index < $parent.hostGroups - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- ko with: addHostGroupRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span>: {</span></div><!-- /ko --></div></div><!-- /ko --><div class="data-row__braces"><span>},</span></div></div><!-- ko if: $index < $parent.environments.length - 1 --><span>,</span><!-- /ko --><!-- /ko --><!-- ko with: addEnvironmentRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span>: {</span></div><!-- /ko --></div></div><!-- /ko --><div class="data-row__braces"><span>},</span></div></div><!-- /ko --><!-- ko with: addNewDataRow --><div class="data-row"><div class="data-row__data"><!-- ko if: editing --><div class="data-row__name data-row__name--editing"><input data-bind="value: name, css: {\'data-row--invalid\' : invalid }, valueUpdate: \'afterkeydown\', enterkey: onSave"><div class="data-row__actions"><i data-bind="click: onSave" class="fa fa-check data-row__action" aria-hidden=true></i><i data-bind="click: onCancel" class="fa fa-times data-row__action" aria-hidden=true></i></div></div><!-- /ko --><!-- ko ifnot: editing --><div class="data-row__name data-row__name--not-editing"><span data-bind="text: name"></span><span>: {</span></div><!-- /ko --></div></div><!-- /ko --><div class="data-row__braces"><span>}</span></div></div></div></div></div></body>');

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

}, 1000);
