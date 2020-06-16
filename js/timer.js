function Timer(callback, delay){
    var lastUpdate = null;
    var isRunning = false;
    var delay = delay;

    var loop = function(){
        requestAnimationFrame(function(){
            var now = Date.now();
            if(!isRunning){
                lastUpdate = Date.now();
                loop();
            }else{
                var timePassed = now - lastUpdate;
                if(lastUpdate == null || timePassed > delay){
                    callback();
                    lastUpdate = now - (timePassed % delay);// ignore the excceed time, to control the refresh rate as delay
                }
                loop();
            }
        });
    }

    this.stop = function(){
        isRunning = false;
    }

    this.start = function(){
        isRunning = true;
        lastUpdate = Date.now();
    }

    this.resetDelay = function(newDelay){
        delay = newDelay;
        this.start();
    }

    

    loop();
}