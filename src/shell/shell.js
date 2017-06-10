var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '${bin/combined.css}';
document.getElementsByTagName('head')[0].appendChild(style);

// TODO: modularize external CSS
var external = document.createElement('link');
external.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
external.rel = "stylesheet";
document.getElementsByTagName('head')[0].appendChild(external);

${src/service-instance/service-instance.js}
${src/service/service.js}
${src/host-group/host-group.js}
${src/environment/environment.js}
${src/application/application.js}
${src/page/page.js}

${bin/combined.html}
    ko.applyBindings(new Page());