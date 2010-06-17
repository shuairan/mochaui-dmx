var DMX = dmx = new Hash({

});

DMX.extend({
    Devices: {
        instances:  new Hash(),
        count:      0,
        getById: function(id) {
                return DMX.Devices.instances[id];
        },
        eraseDevice: function(id) {
            console.info("Erased DMX Device: " + id);
            DMX.Devices.instances.erase(id);
            this.count--;
            $('desktop').fireEvent('dmxDeviceDeleted', id);
        },
        update: function(id, options) {
            DMX.Devices.getById(id).options = options;
        },
        newID: function() {
            i=1;
            while (DMX.Devices.instances.has('dmxdevice' + i)) {
                i++;
            }
            return 'dmxdevice' + i;
        },
    },
});

DMX.Devices.options = {
    id:                '',
    title:             '',
    startchannel:          0,
    channels:          0,
    channelConfig:     [],
    ecmdDevice:        '',
};

DMX.Device = new Class({
    Implements: [Events, Options, ECMD],
    
    options: DMX.Devices.options,
    
    initialize: function(options){
        console.warn("init DMX Device");
        this.setOptions(options);
        //this.setOptions(options);
        
        if (this.options.id && DMX.Devices.instances.has(this.options.id)) {
            //ID is set and not yet in the device list
            console.warn("DMX Device '"+this.options.id+"' is known");
            //DMX.Devices.count++;
        }
        else {
            // Device has no ID, give it one.
            console.warn("DMX Device '"+this.options.id+"' is new");
            this.options.id = DMX.Devices.newID();
            DMX.Devices.count++;
        }
        //TODO: check if device with that ID already exists
        
        this.newDMXDevice();
        
        return this;
    },
    
    newDMXDevice: function(properties) {
        var devices = DMX.Devices.instances;
        var deviceID = DMX.Devices.instances.get(this.options.id);
        var options = this.options;
        //todo: correct, fix possible bugs
        // Here we check to see if there is already a class instance for this device
        //if (deviceID) var devices = deviceID;    
        console.log("New DMX Device: " + options.id);
        //console.log(options);
        
        //Save the DMX Devices
        devices.set(options.id, this);
        $('desktop').fireEvent('dmxdeviceAdded', options);
    },
    
    getIP: function() {
        return this.getEcmdDevice().getIP();
    },
    getEcmdDevice: function() {
        return NetIO.Devices.getById(this.options.ecmdDevice);
    }
    
});
