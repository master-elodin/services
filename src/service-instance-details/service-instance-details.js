function ServiceInstanceDetails(creationData) {
    this.extraDataLoaded = false;
    var creationDataKeys = Object.keys(creationData);
    for(var i = 0; i < creationDataKeys.length; i++) {
        this[creationDataKeys[i]] = creationData[creationDataKeys[i]];
    }
    this.displayInfo = [
        {title: "Host", value: this.hostName},
        {title: "Version", value: this.version},
        {title: "Status", value: this.status}
    ];
    if(this.extraDataLoaded) {
        this.displayInfo.push({title: "Last Action", value: this.lastAction});
        this.displayInfo.push({title: "Last Action Time", value: this.lastActionTime});
        this.displayInfo.push({title: "Last User", value: this.lastActionUserId});
        this.displayInfo.push({title: "JMX Port", value: this.jmxPort});
    }
    this.displayInfo.forEach(function(info) {
        info.title = info.title + ": ";
        info.extraCss = ko.observable();
        info.copyValue = function() {
            info.extraCss("host-health__detail-row--copied");
            setTimeout(function() {
                info.extraCss("");
            }, 500);
        }
    });
}
