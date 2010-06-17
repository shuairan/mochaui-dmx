/*

Script: netioform.js
	Create a NetIO form
	
Copyright:
	Copyright (c) 2010 Sascha Riedinger, <http://problemloeser.org/>.	

License:
	MIT-style license.
	
Requires:
	Core.js, Window.js, NetIO.js
*/

function htmlToElements(str){  
    return ;  
};


NetioForm = new Class({
    Implements: [Events, Options],
    
    options: {
        id: null,
        title: 'NetIO',
        ip: ''
    },
    initialize: function(){
        //console.log("---initialize---");
        this.setOptions(options);
        this.initList();
        this.showList();
        //console.log("---initialize done---");
        return this;
    },
    
    initList: function() {
        //console.log("---init List---");
        
        //console.log("NetIO Form initList");
        //TODO: auslagern, gehört hier net hin
        NetIO.table = new EditTable({
              headers: ['ID', 'Name', 'IP/URL'],
              useKeyboard: false,
              zebra: true,
              selectable: true,
              allowMultiSelect: false,
              editable: true,
              editFields : [false, true, true],
              addButtonID : 'netioAdd',
              getSelected: function() {
                    return NetIO.table.selectedRows[0].id;
              },
              onRowFocus: function(row) {
                  if (!this.editModus && row.id != 'editor') {
                    //console.log("onRowFocus:");
                    //console.log(row);
                    this.makeEditable(row);
                  }
              },
              onRowUnFocus: function() {
                  //nothing
                  //console.log("UNFOCUS");
              }
              
        });
        NetIO.table.initEditTable();
        
        $('desktop').addEvent('netioConfigLoaded', function(e){
            
            console.log("netio config loaded");
            this.fillTable();
            console.log("netio config loaded event ende");
        }.bind(this));
        console.log("ADD EVENT DONE");
        
        //'Add' Button:
        $('netioAdd').addEvent('click', function(e){
            newNetioId = NetIO.Devices.newID();
            
            row = NetIO.table.push([
                    {
                        content: newNetioId,
                        properties: { 'id' : newNetioId+"_id" }
                    },
                    {
                        content: new String(""),
                        properties: { 'id' : newNetioId+"_title" }
                    },
                    {
                        content: new String(""),
                        properties: { 'id' : newNetioId+"_ip" }
                    },
                ],
                    {'id': newNetioId, 'class': 'table-tr'}
            );

            NetIO.table.makeEditable(row['tr']);
        });

        NetIO.table.addEvents({
                'editModusStartet' : function(e){
                        $('netioAdd').set('disabled', true);
                },
                'editModusStopped' : function(e){
                        $('netioAdd').set('disabled', false);
                }
        });

        //console.log("---init List ENDE---");
    },
    
    showList: function() {
        //console.log("---showList---");
        
        if ($('netioList')) {
            console.log("list NetIOs " + NetIO.Devices.count);
            this.fillTable();
            /*
            $('netioList').addEvent('configloaded', function(e) {
                //console.warn("Logging event 'configloaded' in netioFormular");
                //console.debug("SHOWLOST(netioList->CONFIGLOADED)");
                currentFormular.showList();
            });
            */
        }
        
        //inject table:
        //console.warn("inject");
        //console.log(NetIO.table);
        NetIO.table.inject($('netioList').empty());
        console.warn("done");
        //console.log('---showList ENDE---');
    },
    
    fillTable: function() {
        NetIO.table.reset();
        
         //create List: TODO: auslagern in NetIO.table
        NetIO.Devices.instances.each(
            function(instance){
                //console.log("Add Device to List: " + instance.options.id);
                //console.log(JSON.encode(instance.options));
                
                values = new Array();
                //console.log("for key in instance.options");
                //console.log(instance.options);
                for (var key in instance.options) {
                    values.push({
                            content: instance.options[key],
                            properties: {
                                    id : instance.options.id+"_"+key,
                                }
                            });
                }
                                               
                //console.log("Values:");
                console.log(values);
                //console.log(NetIO.table);
                NetIO.table.push(values, {'id': instance.options.id, 'class': 'table-tr'});
            }
        );
    },
});
NetioForm.implement(new Options);
