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

NetioForm = new Class({
    Implements: [Events, Options],
    
    options: {
		id: null,
		title: 'NetIO',
		ip: ''
	},
	initialize: function(){
        console.log("---initialize---");
		this.setOptions(options);
        console.log("---initialize done---");
        return this;
	},
    
    set: function(options) {
        //this.setOptions(options);
        this.options = options;
        console.log("### set ###");
        console.log(options);
        console.log(this.options);
        
        this.fillFormular(options);
        this.activate($('netioAddEditLink'));
        
        return this;
    },
    
    fillFormular: function (options) {
        console.log("---fill formular data---");
        $('netioId').value = options.id;
        $('netioTitle').value = options.title;
        $('netioIP').value = options.ip;
        return this;
    },
    
    activateTab: function (tab) {
        //activate Add
        console.log("---activate tab---");
        MUI.selected(tab, $('netioTabs'));
        return this;
    },
    
    initList: function() {
        console.log("---init List---");
        var currentFormular = this;
        $('netioListEdit').addEvent('click', function(e){
            new Event(e).stop();
            //edit modus:
            console.log("edit modus");
            MUI.updateContent({
                'element':  $('netio'),
                'url':      'plugins/netioform/add.html',
                'onContentLoaded' : function() {
                    currentFormular.initSubmitButton();
                    console.log("initSubmitButton ended for edit modus");
                    var id = NetIO.table.options.getSelected();
                    var netio = NetIO.Devices.getById(id);

                    currentFormular.set(netio.options);
                }
            });
        }).set('disabled', true);
        
        $('netioListDelete').addEvent('click', function(e){
            new Event(e).stop();
            console.log("delete");
            var id = NetIO.table.options.getSelected();
            var netio = NetIO.Devices.getById(id);
            
            //TODO: show nice Window with detailed information which DMX devices will be affected
            if (confirm("Netio '"+id+"' wirklich entfernen?")){
                NetIO.Devices.eraseNetio(id);
                currentFormular.showList();
            }

        }).set('disabled', true);
        
        console.log("NetIO table");
        //TODO: auslagern, gehört hier net hin
        NetIO.table = new HtmlTable({
              headers: ['ID', 'Name', 'IP/URL'],
              zebra: true,
              selectable: true,
              allowMultiSelect: false,
              getSelected: function() {
                    return NetIO.table.selectedRows[0].id;
              },
              onRowFocus: function(e) {
                  $('netioListEdit').set('disabled', false);
                  $('netioListDelete').set('disabled', false);
              },
              onRowUnFocus: function() {
                  //nothing
              }
        });
        console.log("---init List ENDE---");
    },
    
    initSubmitButton: function () {
        console.log("---netioFormInitSubmitButton---");
        this.activateTab($('netioAddEditLink'));
        var currentFormular = this;     //Todo: Maybe use "super.this" instead of currentFormular variable???
        
        $('netioFormSubmit').addEvent('click', function(e){
            new Event(e).stop();
            console.log("Add Netio " + NetIO.Devices.count);
            currentFormular.submitFormular();
            
            currentFormular.showList();
        });
        console.log("---netioFormInitSubmitButton ENDE---");
    },
    
    showList: function() {
        console.log("---showList---");
        var currentFormular = this;
        MUI.updateContent({
                'element':  $('netio'),
                'url':      'plugins/netioform/list.html',
                'onContentLoaded' : function() {
                    currentFormular.initList();
                    console.log(NetIO.Devices.instances);
                    
                    currentFormular.activateTab($('netioListLink'));
                    
                    if ($('netioList')) {
                        console.log("list NetIOs " + NetIO.Devices.count);
                        
                        //create List: TODO: auslagern in NetIO.table
                        NetIO.Devices.instances.each(
                            function(instance){
                                console.log("Add Device to List: " + instance.options.id);
                                //console.log(JSON.encode(instance.options));
                                
                                values = new Array();
                                //console.log("for key in instance.options");
                                //console.log(instance.options);
                                for (var key in instance.options) {
                                    values.push(instance.options[key]);
                                }
                                console.log("Values:");
                                console.log(values);
                                NetIO.table.push(values, {'id': instance.options.id, 'class': 'table-tr'});
                            }
                        );
                        
                        $('netioList').addEvent('configloaded', function(e) {
                            //console.warn("Logging event 'configloaded' in netioFormular");
                            currentFormular.showList();
                        });
                    }
                    
                    if (NetIO.table.body.childElementCount) {   //table has data
                        $('netioList').empty();
                        NetIO.table.inject($('netioList'));
                    }
                    
                    console.log('---showList ENDE---');
                }
        });
    },
    
    showFormular: function() {
        var currentFormular = this;
        MUI.updateContent({
            'element':  $('netio'),
            'url':      'plugins/netioform/add.html',
            'onContentLoaded' : function() {
                currentFormular.initSubmitButton();
            }
        });
        return this;
    },
    
    //Todo check if 'options' is right, what is with this.options?
    // if using "this.options" instead of "options" a strange (different) behaviour occurs
    // when filling the empty formular and when editing or having some loaded NetIOs in the table...
    submitFormular: function() {
        console.log("### submit Formular ###");
        console.log("netioId value:");
        var options = {};
        console.log($('netioId').value);
        if ($('netioId').value) {
            options.id = $('netioId').value;
        }
        else {
            console.warn("counting Devices.count up");
            options.id = 'netio' + (++NetIO.Devices.count);
        }
		options.title = $('netioTitle').value;
		options.ip = encodeURI($('netioIP').value);
        console.log("New Netio.Device");
        console.log(this.options);
        console.log(options);
        
        return new NetIO.Device(options);
    },
    
    onConfigloaded: function(e) {
        console.warn('YEAH: config Loaded event fired!');
    }
});
NetioForm.implement(new Options);
