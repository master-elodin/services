(function() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '${bin/combined.css}';
    document.getElementsByTagName('head')[0].appendChild(style);
});
${src/service-instance/service-instance.js}
${src/service/service.js}
${src/host-group/host-group.js}
${src/environment/environment.js}
${src/page/page.js}

${bin/combined.html}
    ko.applyBindings(new Page());