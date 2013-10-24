(function(sl, undefined) {
    "use strict";
    
    sl.createWidget = function(dom, defaultDomain) {
        var nonce = 'slobj' + Math.floor((Math.random() * 100000000) + 1);
        var Tools = de.cismet.Tools;
        var DOM = dom;
        var defDomain = defaultDomain;
        var listeners = [];

        var domain;
        var backend;
        var worldstates;
        var selectedWS;
        
        var createDOM = function() {
            if(!worldstates){
                throw {
                    name: 'IllegalStateException',
                    message: 'worldstates have not been initialised yet'
                }
            }
            
            var root = document.createElement("div");
            root.setAttribute("id", nonce);
            
            var p1 = document.createElement("p");
            p1.textContent = "Scenarios:";
            var p2 = document.createElement("p");
            
            var select = document.createElement("select");
            select.setAttribute("name", nonce);
            select.setAttribute("size", 5);
            select.setAttribute("onchange", "de.cismet.crisma.Scenario_list_widget." + nonce 
                    + ".setSelectedWorldstateById(this.value)");
            
            for(var i = 0; i < worldstates.length; ++i){
                var option = document.createElement("option");
                option.setAttribute("value", worldstates[i].id);
                if(worldstates[i] === selectedWS){
                    option.setAttribute("selected", "true");
                }
                option.textContent = worldstates[i].name;
                select.appendChild(option);
            }
            p2.appendChild(select);
            root.appendChild(p1);
            root.appendChild(p2);

            return root;
        };
        
        var getDefaultDomain = function() {
            return defDomain;
        };
        var setDomain = function(d) {
            domain = d;
        };
        var getDomain = function() {
            return domain;
        };
        
        var setBackend = function(b) {
            if (Tools.canExecute(b, 'getAllObjectsOfClass')) {
                backend = b;
            } else {
                throw {
                    name: 'IllegalArgumentException',
                    message: 'provided backend does not support getObject'
                }
            }

        };
        var getBackend = function() {
            return backend;
        };

        var getSelectedWorldstate = function() {
            if (selectedWS) {
                return selectedWS;
            } else {
                return null;
            }
        };
        var setSelectedWorldstateById = function(wsId){
            if(!worldstates){
                throw {
                    name: 'IllegalStateException',
                    message: 'worldstates have not been initialised yet'
                }
            }
            
            var id = wsId;
            if(Tools.canExecute(wsId, "substring")){
                // assume string
                id = parseInt(wsId);
            }
            
            for(var i = 0; i < worldstates.length; ++i){
                if(worldstates[i].id === id){
                    setSelectedWorldstate(worldstates[i]);
                    
                    return;
                }
            }
            
            setSelectedWorldstate(null);
        };
        var setSelectedWorldstate = function(worldstate) {
            if(!worldstates){
                throw {
                    name: 'IllegalStateException',
                    message: 'worldstates have not been initialised yet'
                }
            }
            
            if(worldstate !== selectedWS) {
                selectedWS = worldstate;
                
                var select = document.getElementById(nonce).getElementsByTagName("select")[0];
                
                var index = -1;
                
                for(var i = 0; i < select.options.length; ++i){
                    if(selectedWS !== null && parseInt(select.options[i].value) === selectedWS.id){
                        index = i;
                        
                        break;
                    }
                }
                
                select.selectedIndex = index;
                
                fireWorldstateSelectionChanged(worldstate);
            }
        };
        
        var addWorldstateSelectionChangedListener = function(callback){
            if(typeof callback === 'function'){
                for(var i = 0; i < listeners.length; ++i){
                    if(!listeners[i]){
                        listeners[i] = callback;
                        
                        // everything done, bail out
                        return;
                    }
                }
                
                // no free spaces in the array, add to end
                listeners.push(callback);
            }
        };
        var removeWorldstateSelectionChangedListener = function(callback){
            for(var i = 0; i < listeners.length; ++i){
                if(listeners[i] === callback){
                    listeners[i] = undefined;
                }
            }
        };
        var fireWorldstateSelectionChanged = function(ws) {
            for(var i = 0; i < listeners.length; ++i){
                if(listeners[i]){
                    listeners[i](ws);
                }
            }
        };
        
        var updateWorldstates = function() {
            var dom = domain ? domain : defDomain;
            
            if (!dom) {
                throw {
                    name: 'IllegalStateException',
                    message: 'neither domain nor default domain is set'
                }
            }
            
            backend.getAllObjectsOfClass(dom, 'worldstates', {
                "fields":"id,name",
                "filter":"childworldstates:\\[\\]"
            }).done(function(allWs) {
                worldstates = allWs.$collection;
                if(document.getElementById(nonce)){
                    var nuu = createDOM();
                    var old = document.getElementById(nonce);
                    old.parentNode.replaceChild(nuu, old);                    
                } else {
                    DOM.appendChild(createDOM());
                }
            });
        };
        
        var self = {
            getDomain: getDomain,
            setDomain: setDomain,
            getBackend: getBackend,
            setBackend: setBackend,
            getSelectedWorldstate: getSelectedWorldstate,
            setSelectedWorldstate: setSelectedWorldstate,
            setSelectedWorldstateById: setSelectedWorldstateById,
            updateWorldstates: updateWorldstates,
            getDefaultDomain: getDefaultDomain,
            addWorldstateSelectionChangedListener: addWorldstateSelectionChangedListener,
            removeWorldstateSelectionChangedListener: removeWorldstateSelectionChangedListener,
            dispose: dispose
        };
        
        var dispose = function(){
            var selfDom = document.getElementById(nonce);
            selfDom.parentNode.removeChild(selfDom);
            listeners = undefined;
            sl[nonce] = undefined;
        };
        
        sl[nonce] = self;
        
        return self;
    };
})(de.cismet.Namespace.create("de.cismet.crisma.Scenario_list_widget"));