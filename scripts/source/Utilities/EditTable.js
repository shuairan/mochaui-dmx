EditTable = new Class({
    Extends: HtmlTable,
    Implements: [Events, Options],
    
    options: {
        editable :         true,
        editFields :       [],
        addButtonID :      '',
    },
    
    initialize: function(options) {
        this.parent(options);   //Call HtmlTable constructor
        this.setOptions(options);
        
    },
    
    editable: true,
    //is: options.editable and options.editFields
    //editFields : [],
    
    //todo: this should be 'initialize'
    initEditTable: function(){
        //console.log("Init EditTable");
        this.editor = new Element('div', {html: '<table><tbody> <tr></tr> </tbody></table>'}).getElement('tr')
        this.editor.grab(
            new Element('td', {colspan: 3}).grab($('editorDIV'))
        );
        
    },   

    setAddButton: function(value) {
        $(this.options.addButtonID).set('disabled', value);
    },

    enableEdit: function() {
        this.editable = true;
        this.enableSelect();
        this.fireEvent('editModusStopped');
    },
    
    disableEdit: function() {
        this.editable = false;
        this.disableSelect();
        this.fireEvent('editModusStartet');
    },
    
    injectEditor: function(row) {
        this.editor.inject(row, 'after');
        netioID = row.id;
        
        //Editor Buttons
        $('netioDelete').addEvent('click', function(e){
            new Event(e).stop();
            
            //TODO: show nice Window with detailed information which DMX devices will be affected
            if (confirm("Netio '"+netioID+"' wirklich entfernen?")){
                NetIO.Devices.eraseNetio(netioID);
                this.removeRow(row);
                this.removeEditable();
            }
        }.bind(this));
        
        $('netioCancel').addEvent('click', function(e){
            new Event(e).stop();
            this.removeEditable(row);
            //this is an new 'add' line, without saved NetIO -> delete it!
            if (row.id == NetIO.Devices.newID()) {
                this.removeRow(row);
            }
        }.bind(this));
        
        $('netioSave').addEvent('click', function(e){
            new Event(e).stop();
            var options = {};

            options.id = netioID;
            options.title = $(netioID+'_title_input').value;
            options.ip = $(netioID+'_ip_input').value;
            
            if (options.title == "" || options.ip == "") {  //Todo: better: use form validator
                MUI.notification("Name und IP für NetIO '"+netioID+"' eingeben"); 
            }
            else {
                if (row.id == NetIO.Devices.newID()) {  //new NetIO
                    new NetIO.Device(options);
                }
                else {                                  //update existing NetIO
                    NetIO.Devices.update(netioID, options);
                }
                this.removeEditable(row);
            }
                        
        }.bind(this));
    },
    
    disposeEditor: function() {
        //Remove Events
        $('netioDelete').removeEvents('click');
        $('netioCancel').removeEvents('click');
        $('netioSave').removeEvents('click');
        //remove Editor from DOM:
        this.editor = this.editor.dispose();
    },
    
    removeRow: function (row) {
        row.destroy();
        //zebra update doesn't work? why?
        if (this.options.zebra) this.updateZebras();
    },
    
    removeEditable: function(row) {
        //Reset Values:
        if (row) {
            netioID = row.id;
            netio = NetIO.Devices.getById(row.id);
            
            if (netio) {
                var editFields = this.options.editFields;
                
                var cols = row.getChildren('td');
                cols.each(function (td, index) {
                    if (editFields[index]) {
                        type = td.id.substring(td.id.lastIndexOf('_')+1);
                        value = netio.options[type];
                        td.empty();
                        td.appendText(value);
                        td.id = netioID +"_"+type;
                    }
                });  
            }
        }
        //remove Editor:
        this.disposeEditor();
        
        //set table editable again
        this.enableEdit();
    },
    
    makeEditable: function(row) {
        //disable editable for table as long as editModus is active (editor is visible for 'row') 
        this.disableEdit();
        netioID = row.id;
        var editFields = this.options.editFields;
        
        //foreach td: inject a input field with actual text of td element
        var cols = row.getChildren('td');
        cols.each(function (td, index) {
           value = td.get('text');
                      
           if (editFields[index]) {
               td.empty();
               td.adopt(new Element('input', {
                                        type: 'text',
                                        class: 'input',
                                        maxlength: '250',
                                        id: td.id+'_input',
                                        value: value
                                    }));
           }
        });

        //add editor:
        this.injectEditor(row);
    },
    
    reset: function() {
        if (!this.editable) {   //edit modus is on, remove editor etc:
            this.removeEditable();
        }
        this.empty();
    }
});
