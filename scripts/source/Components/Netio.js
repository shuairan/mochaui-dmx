/*

Script: Netio.js
    Handles NetIOs.

Copyright:
    Copyright (c) 2007-2009 Greg Houston, <http://greghoustondesign.com/>.

License:
    MIT-style license.    

Requires:
    Core.js ECMD.js

*/

var NetIO = Netio = netio = new Hash({
    
});

NetIO.extend({
    Devices: {
        instances:  new Hash(),
        count:      0,
        getById: function(id) {
            return NetIO.Devices.instances[id];
        },
        eraseNetio: function(id) {
            console.info("Erased Netio: " + id);
            NetIO.Devices.instances.erase(id);
            this.count--;
            $('desktop').fireEvent('netioDeleted', id);
        },
        update: function(id, options) {
            NetIO.Devices.getById(id).options = options;
        },
        newID: function() {
            i=1;
            while (NetIO.Devices.instances.has('netio' + i)) {
                i++;
            }
            return 'netio' + i;
        },
        
    }
});

NetIO.Devices.options = {
    id:                null,
    title:             'NetIO',
    ip:               '',
};

NetIO.Device = new Class({
    Implements: [Events, Options, ECMD],
    
    options: NetIO.Devices.options,
    
    initialize: function(options){
        this.setOptions(options);
        
        var options = this.options;

        if (options.id && !NetIO.Devices.instances.has(options.id)) {
            //ID is set and not yet in the device list
            console.warn("Device '"+options.id+"' is new");
            NetIO.Devices.count++;
        }
        else {
            // Device has no ID, give it one.
            options.id = NetIO.Devices.newID();
            NetIO.Devices.count++;
        }
        //TODO: check if device with that ID already exists
        
        this.newNetio();
        
        return this;
    },
    
    newNetio: function(properties){ // options is not doing anything
        var devices = NetIO.Devices.instances;
        var deviceID = NetIO.Devices.instances.get(this.options.id);
        var options = this.options;
        //todo: correct, fix possible bugs
        // Here we check to see if there is already a class instance for this device
        //if (deviceID) var devices = deviceID;    
        //console.log("New Netio: " + options.id);
        //console.log(options);
        
        //Save the NetIO Devices
        devices.set(options.id, this);
        $('desktop').fireEvent('netioAdded', options);
    },
    
    onEcmdFailure: function() {
        console.warn("NETIO ECMD FAILURE");
    },
    
    getIP: function() {
        return this.options.ip;
    }
});
