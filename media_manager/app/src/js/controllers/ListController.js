angular.module('media_manager').controller('ListController', [function(){
  var fakeimg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
  var data = [
    {
      id: 1,
      src: fakeimg,
      title: "Collection 1",
      description: "Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit."
    },
    {
      id: 2,
      src: fakeimg,
      title: "Collection 2",
      description: "Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit."
    },
    {
      id: 3,
      src: fakeimg,
      title: "Collection 3",
      description: "Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit."
    },
    {
      id: 4,
      src: fakeimg,
      title: "Collection 4",
      description: "Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit."
    },
  ];

  var lc = this;
  lc.data = data;


}]);
