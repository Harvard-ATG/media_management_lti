window.appConfig = { 'access_token': "something" };

var imagesMock = [
    {
        "url": "http://localhost:8000/api/images/1",
        "id": 1,
        "course_id": 1,
        "title": "One Image",
        "description": "",
        "metadata": [],
        "sort_order": 1,
        "upload_file_name": null,
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "type": "images",
        "is_upload": false,
        "thumb_height": null,
        "image_height": null,
        "image_url": "http://dummyimage.com/600x400/000/fff.jpg&text=A",
        "thumb_width": null,
        "image_type": null,
        "thumb_url": null,
        "image_width": null,
        "iiif_base_url": null
    },
    {
        "url": "http://localhost:8000/api/images/2",
        "id": 2,
        "course_id": 1,
        "title": "Two Image",
        "description": "",
        "metadata": [],
        "sort_order": 2,
        "upload_file_name": null,
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "type": "images",
        "is_upload": false,
        "thumb_height": null,
        "image_height": null,
        "image_url": "http://dummyimage.com/600x400/000/0f0.jpg&text=B",
        "thumb_width": null,
        "image_type": null,
        "thumb_url": null,
        "image_width": null,
        "iiif_base_url": null
    },
    {
        "url": "http://localhost:8000/api/images/3",
        "id": 3,
        "course_id": 1,
        "title": "Three Image",
        "description": "",
        "metadata": [],
        "sort_order": 3,
        "upload_file_name": null,
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "type": "images",
        "is_upload": false,
        "thumb_height": null,
        "image_height": null,
        "image_url": "http://dummyimage.com/600x400/000/00f.jpg&text=C",
        "thumb_width": null,
        "image_type": null,
        "thumb_url": null,
        "image_width": null,
        "iiif_base_url": null
    },
    {
        "url": "http://localhost:8000/api/images/4",
        "id": 4,
        "course_id": 1,
        "title": "Four Image",
        "description": "",
        "metadata": [],
        "sort_order": 4,
        "upload_file_name": null,
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "type": "images",
        "is_upload": false,
        "thumb_height": null,
        "image_height": null,
        "image_url": "http://dummyimage.com/600x400/000/ff0.jpg&text=D",
        "thumb_width": null,
        "image_type": null,
        "thumb_url": null,
        "image_width": null,
        "iiif_base_url": null
    },
    {
        "url": "http://localhost:8000/api/images/5",
        "id": 5,
        "course_id": 1,
        "title": "Uploaded Image",
        "description": "",
        "metadata": [],
        "sort_order": 5,
        "upload_file_name": null,
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "type": "images",
        "is_upload": true,
        "thumb_height": 144,
        "image_height": 1440,
        "image_url": "http://dummyimage.com/2560x1440/000/fff.jpg&text=Example+Image+Upload",
        "thumb_width": 256,
        "image_type": "jpg",
        "thumb_url": "http://dummyimage.com/256x144/000/fff.jpg&text=Example+Image+Upload",
        "image_width": 2560,
        "iiif_base_url": null
    }
];
var collectionsMock = [
    {
        "url": "http://localhost:8000/api/collections/1",
        "id": 1,
        "title": "Scrambled Eggs Super!",
        "description": "",
        "sort_order": 1,
        "course_id": 1,
        "course_image_ids": [
            1,
            4
        ],
        "images_url": "http://localhost:8000/api/collections/1/images",
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "images": [
            {
                "id": 1,
                "collection_url": "http://localhost:8000/api/collections/1",
                "collection_id": 1,
                "course_image_id": 1,
                "sort_order": 0,
                "created": "2015-12-15T15:42:33.443434Z",
                "updated": "2015-12-15T15:42:33.443434Z",
                "description": "",
                "upload_file_name": null,
                "title": "One Image",
                "url": "http://localhost:8000/api/collection-images/1",
                "type": "collectionimages",
                "is_upload": false,
                "thumb_height": null,
                "image_height": null,
                "image_url": "http://dummyimage.com/600x400/000/fff.jpg&text=A",
                "thumb_width": null,
                "image_type": null,
                "thumb_url": null,
                "image_width": null,
                "iiif_base_url": null
            },
            {
                "id": 2,
                "collection_url": "http://localhost:8000/api/collections/2",
                "collection_id": 1,
                "course_image_id": 4,
                "sort_order": 0,
                "created": "2015-12-15T15:42:33.443434Z",
                "updated": "2015-12-15T15:42:33.443434Z",
                "description": "",
                "upload_file_name": null,
                "title": "Four Image",
                "url": "http://localhost:8000/api/collection-images/2",
                "type": "collectionimages",
                "is_upload": false,
                "thumb_height": null,
                "image_height": null,
                "image_url": "http://dummyimage.com/600x400/000/ff0.jpg&text=D",
                "thumb_width": null,
                "image_type": null,
                "thumb_url": null,
                "image_width": null,
                "iiif_base_url": null
            }
        ],
        "type": "collections"
    },
    {
        "url": "http://localhost:8000/api/collections/2",
        "id": 2,
        "title": "If I Ran the Circus",
        "description": "",
        "sort_order": 2,
        "course_id": 1,
        "course_image_ids": [
            2,
            3
        ],
        "images_url": "http://localhost:8000/api/collections/2/images",
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "images": [
            {
                "id": 3,
                "collection_url": "http://localhost:8000/api/collections/3",
                "collection_id": 2,
                "course_image_id": 2,
                "sort_order": 0,
                "created": "2015-12-15T15:42:33.443434Z",
                "updated": "2015-12-15T15:42:33.443434Z",
                "description": "",
                "upload_file_name": null,
                "title": "Two Image",
                "url": "http://localhost:8000/api/collection-images/3",
                "type": "collectionimages",
                "is_upload": false,
                "thumb_height": null,
                "image_height": null,
                "image_url": "http://dummyimage.com/600x400/000/0f0.jpg&text=B",
                "thumb_width": null,
                "image_type": null,
                "thumb_url": null,
                "image_width": null,
                "iiif_base_url": null
            },
            {
                "id": 4,
                "collection_url": "http://localhost:8000/api/collections/4",
                "collection_id": 2,
                "course_image_id": 3,
                "sort_order": 0,
                "created": "2015-12-15T15:42:33.443434Z",
                "updated": "2015-12-15T15:42:33.443434Z",
                "description": "",
                "upload_file_name": null,
                "title": "Three Image",
                "url": "http://localhost:8000/api/collection-images/4",
                "type": "collectionimages",
                "is_upload": false,
                "thumb_height": null,
                "image_height": null,
                "image_url": "http://dummyimage.com/600x400/000/00f.jpg&text=C",
                "thumb_width": null,
                "image_type": null,
                "thumb_url": null,
                "image_width": null,
                "iiif_base_url": null
            }
        ],
        "type": "collections"
    },
    {
        "url": "http://localhost:8000/api/collections/3",
        "id": 3,
        "title": "How the Grinch Stole Christmas!",
        "description": "",
        "sort_order": 3,
        "course_id": 1,
        "course_image_ids": [
            4
        ],
        "images_url": "http://localhost:8000/api/collections/3/images",
        "created": "2015-12-15T15:42:33.443434Z",
        "updated": "2015-12-15T15:42:33.443434Z",
        "images": [
            {
                "id": 5,
                "collection_url": "http://localhost:8000/api/collections/5",
                "collection_id": 3,
                "course_image_id": 4,
                "sort_order": 0,
                "created": "2015-12-15T15:42:33.443434Z",
                "updated": "2015-12-15T15:42:33.443434Z",
                "description": "",
                "upload_file_name": null,
                "title": "Four Image",
                "url": "http://localhost:8000/api/collection-images/5",
                "type": "collectionimages",
                "is_upload": false,
                "thumb_height": null,
                "image_height": null,
                "image_url": "http://dummyimage.com/600x400/000/ff0.jpg&text=D",
                "thumb_width": null,
                "image_type": null,
                "thumb_url": null,
                "image_width": null,
                "iiif_base_url": null
            }
        ],
        "type": "collections"
    },
    {
        "url": "http://localhost:8000/api/collections/11",
        "id": 11,
        "title": "What, did this work?",
        "description": "",
        "sort_order": 8,
        "course_id": 1,
        "course_image_ids": [],
        "images_url": "http://localhost:8000/api/collections/11/images",
        "created": "2016-01-19T04:24:23.291723Z",
        "updated": "2016-01-19T04:24:23.291747Z",
        "images": [],
        "type": "collections"
    },
    {
        "url": "http://localhost:8000/api/collections/12",
        "id": 12,
        "title": "Untitled Collection",
        "description": "",
        "sort_order": 9,
        "course_id": 1,
        "course_image_ids": [],
        "images_url": "http://localhost:8000/api/collections/12/images",
        "created": "2016-01-19T17:07:43.141711Z",
        "updated": "2016-01-19T17:07:43.141734Z",
        "images": [],
        "type": "collections"
    },
    {
        "url": "http://localhost:8000/api/collections/13",
        "id": 13,
        "title": "New Collection",
        "description": "",
        "sort_order": 10,
        "course_id": 1,
        "course_image_ids": [],
        "images_url": "http://localhost:8000/api/collections/13/images",
        "created": "2016-01-25T19:23:36.242139Z",
        "updated": "2016-01-25T19:23:36.242170Z",
        "images": [],
        "type": "collections"
    },
    {
        "url": "http://localhost:8000/api/collections/15",
        "id": 15,
        "title": "Untitled Collection",
        "description": "",
        "sort_order": 11,
        "course_id": 1,
        "course_image_ids": [],
        "images_url": "http://localhost:8000/api/collections/15/images",
        "created": "2016-01-26T21:33:58.039333Z",
        "updated": "2016-01-26T21:33:58.039354Z",
        "images": [],
        "type": "collections"
    }
];


describe('CourseCache service', function(){
  var courseCache;

  beforeEach(function(){

    module('media_manager');

    module(function($provide){
      $provide.service('AppConfig', function(){
        this.config = window.appConfig || {};
        this.perms = "";
        this.course_id = "1";
        this.access_token = "something";
        this.authorization_header = "Token " + "something";
        this.media_management_api_url = "something";
      });
      $provide.service('Course', function(){
        this.getCollections = function(){
          return collectionsMock;
        };
        this.getImages = function(callback){
          return imagesMock;
        };
      });
      $provide.service('Image', function(){
        this.get = function(im){
          imagesMock.forEach(function(item){
            if(item.id == im.id){
              return item;
            }
          });
        };
      });
    });

    inject(function($injector){
      courseCache = $injector.get('CourseCache');
      courseCache.images = imagesMock;
    });
  });

  describe('removeImage', function(){

    describe('removing the first image', function(){
      it('should replace the current_image with the next item', function(){
        courseCache.current_image = imagesMock[0];
        next_image = courseCache.images[1];
        courseCache.removeImage(courseCache.current_image.id);
        expect(courseCache.current_image.id).toBe(next_image.id);
      });
    });
  });

});
