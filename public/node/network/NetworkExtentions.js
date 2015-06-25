/*jshint browser:true, nonew:false*/
/*global WebInspector:true, InspectorFrontendHost:true, InspectorFrontendHostAPI:true*/
WebInspector.NetworkExtensions = function() {
  this._extendNetworkDispatcher();
};

WebInspector.NetworkExtensions.prototype = {
  _extendNetworkDispatcher: function() {
    // InspectorBackend._dispatcherPrototypes.Network.registerNetworkDispatcher = function() {
    // 	debugger;
    // };

    // new WebInspector.NetworkManager(InspectorBackend._dispatcherPrototypes.Network);
  }
};

new WebInspector.NetworkExtensions();
