(function(M) {

  M.prototype.metadataPlugin = function(){
    var mirador = this;

    mirador.eventEmitter.subscribe('WINDOW_ELEMENT_UPDATED', function(event, data){
      var windowId = data.windowId;

      // get the metadata
      var manifestUri = mirador.viewer.data[0].manifestUri;
      var metadatas = [];
      $.getJSON(manifestUri, function(data) {
        metadatas = data.sequences[0].canvases.reduce(function(dict, canvas){
          dict[canvas['@id']] = {};
          dict[canvas['@id']].datas = canvas.metadata || [];
          dict[canvas['@id']].label = canvas.label;
          return dict;
        }, {});
      });

      mirador.eventEmitter.subscribe('currentCanvasIDUpdated.' + windowId, function(event, data){
        var imageId = data;

        var $sidePanel = $('.sidePanel .tabContentArea');
        var html = '';
        if(metadatas[imageId]){
          html = '<b>' + metadatas[imageId].label + '</b><br/>';
          html += metadatas[imageId].datas.map(function(md){
            var value = md.value || "No Value";
            var label = md.label || "";
            return label + ': ' + value;
          }).join('<br/>');
          $sidePanel.html(html);
        }

      });
    });


  };

})(Mirador);
