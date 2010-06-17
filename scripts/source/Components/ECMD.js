ECMD = new Class({
    Implements: [Events, Options],
   
    sendECMD: function(command) {
        ip = this.getIP();   //this has to be set by the class implementing/extending this class
                                //todo: use implement on Netio to give all netios the ecmd thing?
        
        prefix = ((ip.substr(0, 7)=='http://')? '' : 'http://');
        suffix = ((ip.charAt(ip.length-1)=='/') ? 'ecmd' : '/ecmd');
        url = prefix + ip + suffix;

        //console.info("Send ECMD: " +command);
        //console.info("to url: " +url);

        //really dirty workaround for cross domain ajax requests: Sending the url and the command to the 'helper/index.php' script,
        // which makes the ecmd call to the ecmd-device and returns the answer.
        new Request({
                method: 'post',
                data: 'url='+url+"&cmd="+command,
                noCache: true,
                url: 'helper/index.php',
                onSuccess: function(txt){
                    //console.log("Successfull: " + txt);
                    this.fireEvent('ecmdSuccess', txt);
                }.bind(this),
                
                onFailure: function(x){
                    console.warn("Request failed");
                    console.log(x);
                    this.fireEvent('ecmdFailure', url + "?" +command);
                }.bind(this)
        }).send();

/*
        new Request.HTML({
                    method: 'get', 
                    url: url, 
                    //data: command,
                    secure: false,
                    callBackKey: 'callback',
                    
                    onSuccess: function(json, txt){
                        console.log("Successfull: " + txt);
                        this.fireEvent('ecmdSuccess', txt);
                    }.bind(this),
                    
                    onFailure: function(x){
                        console.warn("Request failed");
                        console.log(x);
                        this.fireEvent('ecmdFailure', url + "?" +command);
                    }.bind(this)
        }).send(); 
*/
        //.setHeader({headers: {'Accept': 'text/html, */*'}})
    },
});
