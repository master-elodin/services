function ServiceInstance(id) {
    var instance = this;

    instance.id = id;

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