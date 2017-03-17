(function(M, Handlebars) {

  // Defines the width of the sidepanel
  var SIDEPANEL_WIDTH = 400;

  // Overriding this Mirador method in order to change the hard-coded width
  // of the side panel (hard coded to 280px). Requires the Mirador library
  // to already be loaded.
  //
  // See mirador source here:
  // https://github.com/ProjectMirador/mirador/blob/2.3.0/js/src/workspaces/window.js#L567
  var sidePanelVisibility = M.Window.prototype.sidePanelVisibility;
  M.Window.prototype.sidePanelVisibility = function(visible) {
    sidePanelVisibility.apply(this, arguments);
    console.log("sidepanel mods", visible);
    var sidePanelElement = this.element.find('.sidePanel');
    var viewContainerElement = this.element.find('.view-container');
    if(visible) {
      sidePanelElement.width(SIDEPANEL_WIDTH);
      viewContainerElement.css("margin-left", (SIDEPANEL_WIDTH + 20) + "px");
    }
  };

  // Adds the plugin to the Mirador global object
  // Usage:
  //    var mirador = Mirador(miradorSettings)
  //    mirador.metadataPlugin();
  M.prototype.metadataPlugin = function(){
    var mirador = this;

    mirador.eventEmitter.subscribe('WINDOW_ELEMENT_UPDATED', function(event, data){
      var windowId = data.windowId;

      // get the metadata
      var manifestUri = mirador.viewer.data[0].manifestUri;
      var metadatas = [];
      $.getJSON(manifestUri, function(data) {
        metadatas = data.sequences[0].canvases.reduce(function(dict, canvas){
          dict[canvas['@id']] = {
            "datas": canvas.metadata || [],
            "label": canvas.label
          };
          return dict;
        }, {});
      });


      mirador.eventEmitter.subscribe('currentCanvasIDUpdated.' + windowId, function(event, data){
        var imageId = data;
        var html = '';
        var $sidePanel = $('.sidePanel');
        var $tabContent = $sidePanel.find(".tabContentArea").css("width", "calc(100% - 10px)");

        if(metadatas[imageId]){
          template_context = {
            "name": metadatas[imageId].label,
            "metadata": metadatas[imageId].datas.map(function(md){
              var value = md.value || "No Value";
              var label = md.label || "";
              return {"value": value, "label":label};
            })
          };
          html = metadata_template(template_context);
          $tabContent.html(html);
        }
      });
    });
  };

  // Template used to render the metadata in the panel
  var metadata_template = Handlebars.compile([
    '<table class="metadata">',
      '<tr><td class="label">Image name</td><td class="information">{{name}}</td></tr>',
      '{{#each metadata}}',
        '<tr><td class="label">{{label}}</td><td class="information">{{value}}</td></tr>',
      '{{/each}}',
    '</table>'
  ].join(''));

})(Mirador, Handlebars);
