/*

Script: terminal.js
	Terminal javascript stuff
	
Copyright:
	Copyright (c) 2010 Sascha Riedinger

License:
	MIT-style license.
	
Requires:
	Core.js, Window.js, NetIO.js

*/

var TerminalConsole = new Class({
    
    netio : $empty,
    liveUpdateModus : false,
    
    initialize: function(id) {
        console.log("Terminal for " +id);
        this.netio = NetIO.Devices.getById(id);
        
        console.log(Terminal);
        
        var term = new Terminal({
            'termDiv' : 'terminalContent',
            'handler' : this.termHandler,
            'greeting' : '%+r ECMD Terminal ready. %-r'
            });
        
        //attach netio device to the terminal
        term.device = this.netio;   
        console.log(term);
        term.open();
        
        this.netio.addEvent('ecmdSuccess', function(text) {
            console.log('ecmdSuccess: ' +text);
            
            term.write(id + "> "+text);
            term.prompt();
        });
        
        this.netio.addEvent('ecmdFailure', function(url) {
            console.warn('ecmdFailure!');
            
            term.write('ERROR with ' +id + ' (URL: ' +url+')');
            term.prompt();
        });
        
    },
    
    termHandler : function() {
        this.newLine();
        var line = this.lineBuffer;
        if (line != "") {
            //this.write("You typed: "+line);
            console.log("term handler");
            console.log(this);
            this.device.sendECMD(line);
        }
    }
    
});

//deprecated
//TODO: call this also when config is loaded
function terminalUpdateSelectBox() {
    if ($('terminalSelectNetio')) {
        var select =  $('terminalSelectNetio');
        
        if (NetIO.Devices.count==0) {
            MUI.notification("Bitte neues NetIO anlegen!");
            MUI.netioWindow();
        }
        
        NetIO.Devices.instances.each(
            function(instance){
                var id = instance.options.id;
                var title = instance.options.title;

                var opt = new Element('option', {
                    'id': instance.options.id,
                    'value' : instance.options.id,
                    'text' : instance.options.title
                }).injectInside(select);
            }
        );
    }
}

function getSelectedNetio() {
    index = $('terminalSelectNetio').selectedIndex;
    netioId = $('terminalSelectNetio').options[index].value;
    netio = NetIO.Devices.instances.get(netioId);
    return netio;
}
