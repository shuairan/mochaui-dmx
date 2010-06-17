/*

Script: Workspaces.js
	Save and load workspaces. The Workspaces emulate Adobe Illustrator functionality remembering what windows are open and where they are positioned.

Copyright:
	Copyright (c) 2007-2009 Greg Houston, <http://greghoustondesign.com/>.

License:
	MIT-style license.

Requires:
	Core.js, Window.js

To do:
	- Move to Window

*/

MUI.files[MUI.path.source + 'Components/Configuration.js'] = 'loaded';

Element.Events.configloaded = {
/*
    base: 'change', //we set a base type
    condition: function(event){ //and a function to perform additional checks.
        console.warn("Condition in configloaded");
        return true; //this means the event is free to fire
    },
*/
    onAdd: function(e) {
        //console.warn("Added the configloaded Eventlistener");
    }
};

/*
var ConfigEvents = new Class({
    Implements: [Events, Options],
    
    initialize: function(options){
		this.setOptions(options);
    },

    configloaded: function() {
        console.log("ConfigEvents configloaded");
        this.fireEvent("onConfigloaded");
    }
});
*/
MUI.extend({			
    
    Config: {
        type: 'cookie',
    },
    Options: {
        autosave: true,
        autoload: true
    }
});    

MUI.Config = new Class({

	Implements: [Events],
	/*
	
	Function: saveConfiguration
		Save the current config (NetIOs, DMX Devices, etc).
	
	Syntax:
	(start code)
		MUI.saveConfiguration();
	(end)
	
	Notes:
	*/
	saveConfiguration: function(){
        this.saveGlobalOptions();
        
        this.addCookie('mochaUInetioConfigCookie', function(cookie) {
                NetIO.Devices.instances.each(function(instance) {
                cookie.set(instance.options.id, {
                    options : JSON.encode(instance.options)
                    });
                }.bind(this));
        });
        
        this.addCookie('mochaUIdmxDevicesCookie', function(cookie) {
                DMX.Devices.instances.each(function(instance) {
                cookie.set(instance.options.id, {
                    options : JSON.encode(instance.options)
                    });
                }.bind(this));
        });
        
        //TODO: other cookies for other bla bla bla
        
        new MUI.Window({
			loadMethod: 'html',
			type: 'notification',
			addClass: 'notification',
			content: 'Configuration saved.',
			closeAfter: '1400',
			width: 200,
			height: 40,
			y: 53,
			padding:  { top: 10, right: 12, bottom: 10, left: 12 },
			shadowBlur: 5,
			bodyBgColor: [255, 255, 255]
		});
        
		$('desktop').fireEvent("configsaved");
	},
    
    addCookie: function(cookiename, fnfill) {
        this.cookie = new Hash.Cookie(cookiename, {duration: 3600});
        this.cookie.empty();
        
        fnfill(this.cookie);
		this.cookie.save();
    },
    
    loadCookie: function(cookiename, fn) {
        cookie = new Hash.Cookie(cookiename, {duration: 3600});
		cookiedata = cookie.load();
		if(!cookie.getKeys().length){
            console.warn("cookie "+cookiename+" was empty");
		}
        cookiedata.each(function(data) {
            fn(data);
        });
    },
     
    saveGlobalOptions: function() {
        this.addCookie('mochaUIconfigCookie', function(cookie) {
                cookie.set('config', {
                    autosave : MUI.Options.autosave,
                    autoload : MUI.Options.autoload
                });
        });
        $('desktop').fireEvent("globalconfigsaved");
    },
    
    loadGlobalOptions: function() {
        this.loadCookie("mochaUIconfigCookie", function(data) {
            MUI.Options.autosave = data.autosave;
            MUI.Options.autoload = data.autoload;
        });
        $('desktop').fireEvent("globalconfigloaded");
    },
    
	/*

	Function: loadConfiguration
		Load the saved configuration.

	Syntax:
	(start code)
		MUI.loadConfiguration();
	(end)

	*/
	loadConfiguration: function(){        
        this.loadGlobalOptions();
        
        this.loadCookie("mochaUInetioConfigCookie", function(data) {
            options = JSON.decode(data.options);
            if (!NetIO.Devices.getById(options.id)) {  
                new NetIO.Device(options);
            }
        });
        $('desktop').fireEvent("netioConfigLoaded");
        
        this.loadCookie("mochaUIdmxDevicesCookie", function(data) {
            options = JSON.decode(data.options);
            if (!DMX.Devices.getById(options.id)) {  
                new DMX.Device(options);
            }
        });
        $('desktop').fireEvent("dmxDevicesLoaded");
        
        
        
        //TODO: other config etc bla bla
        
        //Info:
        new MUI.Window({
            loadMethod: 'html',
            type: 'notification',
            addClass: 'notification',
            content: 'Configuration loaded',
            closeAfter: '1400',
            width: 220,
            height: 40,
            y: 25,
            padding:  { top: 10, right: 12, bottom: 10, left: 12 },
            shadowBlur: 5,
            bodyBgColor: [255, 255, 255]
        });
        
        $('desktop').fireEvent("configloaded");
        return this;
		
	},

});
