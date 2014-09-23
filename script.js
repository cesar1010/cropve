/*
 * CROPVE
 * Dependancy: jQuery, AngularJs
 * Author: Rafael Jose Garcia Suarez
 */
angular.module('cropApp', [])

.factory("MyService", function() {
  return {
    data: {}
  };
})

.controller('Controller', ['$scope', 'MyService',
  function($scope, MyService) {

    $scope.profile = {
      photo: {
        path: 'https://lh4.googleusercontent.com/-e88EGq4jpuw/UrblvOZgfyI/AAAAAAAAB8M/nXS8eAiR5Fg/w949-h712-no/G0035304.JPG',
        width: 946,
        height: 712,
		left : 0,
		top : 0
      },
    }
	
    //FUNCIONES
    $scope.Init = function() {
	$scope.profile.photo.left = MyService.data.img_left
	$scope.profile.photo.top = MyService.data.img_top
	
	console.log("En left: " + $scope.profile.photo.left)
	console.log("En top: " + $scope.profile.photo.top)
	
	console.log("---------------------------------------------------------")
	
	$scope.profile.photo.width = MyService.data.img_width
	$scope.profile.photo.height = MyService.data.img_height
	
	console.log("En Width: " + $scope.profile.photo.width)
	console.log("En Height: " + $scope.profile.photo.height)
	
    }
	
	$scope.Save = function(){
	console.log("Resultados: ")
	console.log($scope.profile.photo)
	}


  }
])
  .directive('myCrop', function(MyService, $document) {
    var img;
    var range;
    //INICIALIZACIÓN DE TODOS LOS METODOS DE LA DIRECTIVA     
    fill = function(value, target, container) {
      if (value + target < container)
        value = container - target;
      return value > 0 ? 0 : value;
    }

    zoom = function(percent,call) {
      var old_percent = percent;
      MyService.data.percent = Math.max(MyService.data.minPercent, Math.min(MyService.data.maxZoom, percent));  
      MyService.data.img_width = Math.ceil(MyService.data.img_back_width * MyService.data.percent);
      MyService.data.img_height = Math.ceil(MyService.data.img_back_height * MyService.data.percent);
      if (old_percent) {
        var zoomFactor = percent / old_percent;
        MyService.data.img_left = fill((1 - zoomFactor) * MyService.data.crop_width / 2 + zoomFactor * MyService.data.img_left, MyService.data.img_width, MyService.data.crop_width);
        MyService.data.img_top = fill((1 - zoomFactor) * MyService.data.crop_height / 2 + zoomFactor * MyService.data.img_top, MyService.data.img_height, MyService.data.crop_height);
      } else {
        MyService.data.img_left = fill((MyService.data.crop_width - MyService.data.img_width) / 2, MyService.data.img_width, MyService.data.crop_width);
        MyService.data.img_top = fill((MyService.data.crop_height - MyService.data.img_height) / 2, MyService.data.img_height, MyService.data.crop_height);
      }
	 
	 img.css({
        'width': MyService.data.img_width + 'px',
        'height': MyService.data.img_height + 'px',
        'left': MyService.data.img_left + 'px',
        'top': MyService.data.img_top + 'px'
      })
	call(); // Actualizamos
    }

    drag = function(data,call) {
      MyService.data.img_left = fill(data.startX + data.dx, MyService.data.img_width, MyService.data.crop_width);
      MyService.data.img_top = fill(data.startY + data.dy, MyService.data.img_height, MyService.data.crop_height);
      img.css({
        'left': MyService.data.img_left + 'px',
        'top': MyService.data.img_top + 'px'
      })
	  call(); //Actualizamos
    }


    return {
      restrict: 'E',
	  transclude : true,
      scope: {
        width: '@',
        height: '@',
        path: '@',
        init: '&onInit',
        save: '&onSave'
      },
	  controller : function($scope){
	  
	  $scope.crop = function(){
	  $scope.save();
	  }
	  
	  },
      link: function(scope, element) {


        //PREPARAMOS EL ELEMENTO.
        $('.crop-container').css({
          width: scope.width + 'px',
          height: scope.height + 'px'
        }).find('img.crop-img').attr('src', scope.path)

        img = $('.crop-container').find('img.crop-img')
       		
		range = $('range.zoom')

        //INICIALIZACIÓN DE TODAS LAS PROPIEDADES DE LA DIRECTIVA
        MyService.data = {
          img_width: img.width(),
          img_height: img.height(),
		  img_back_width: img.width(),
          img_back_height: img.height(),
          img_left: img.offset().left,
          img_top: img.offset().top,
          path: scope.path,
          minPercent: 1,
          maxZoom : 10,
          percent: 1,
          crop_width: scope.width,
          crop_height: scope.height
        }
        scope.init();

        //INICIALIZAMOS LOS EVENTOS DE LA DIRECTIVA
        img.bind('mousedown', function(e1) {
          e1.preventDefault();
          var dragData = {
            startX: MyService.data.img_left,
            startY: MyService.data.img_top
          };
          $document.bind('mousemove', function(e2) {
            dragData.dx = e2.pageX - e1.pageX;
            dragData.dy = e2.pageY - e1.pageY;
            //LLAMOS EL ARRASTRE
            drag(dragData,scope.init);
          }).bind('mouseup', function() {
            $document.unbind('mouseup');
            $document.unbind('mousemove');
          })
        })


        $('#rangeZoom').on("change mousemove", function(){
		  zoom($(this).val(),scope.init);
        });
      },
      templateUrl: 'mycrop.html'
    };
  });
