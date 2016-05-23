
app.controller('NewProductCtrl', ['$rootScope','$scope','$stateParams','categories','cities','schoolService','$ionicPopup','$state','$cordovaCamera', '$cordovaFile', '$ionicModal',
    function ($rootScope,$scope,$stateParams,categories,cities,schoolService,$ionicPopup,$state,$cordovaCamera, $cordovaFile, $ionicModal) {
        var self = this;
        $scope.SelectedItems={};
        $scope.user=$rootScope.User;
        // console.log($scope.user);
        $scope.product={};
        $scope.categories={};
        $scope.cities={};
        if (categories) $scope.categories=categories;
        if (cities) $scope.cities=cities;
        $scope.addProduct=function(){
            if($scope.user && $scope.SelectedItems.category && $scope.SelectedItems.city){

                $scope.product.alumniId=$scope.user.id;
                $scope.product.categoryId=$scope.SelectedItems.category.Id;
                $scope.product.cityId=$scope.SelectedItems.city.id;

                schoolService.createProduct($scope.product).then(function(data){
                    if(data[0]>0)
                     $ionicPopup.alert({
                        title: "New Product",
                        template: "Product Added Successfully"
                    });
                 $state.go('market');
             });
            }
            else{
                $ionicPopup.alert({
                    title: "New Product",
                    template: "Some fields are missing"
                });
            }
        }

        $scope.images = [];

        $scope.addImage = function() {
            console.log("add image");
        // 2
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
        sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
        allowEdit : false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
    };
    
    // 3
    
    $cordovaCamera.getPicture(options).then(function(imageData) {

        function onImageSuccess(fileURI) {
            $scope.images.push(fileURI);
        }

        onImageSuccess(imageData);


    }, function(err) {
        console.log(err);
    });
}


$scope.showImages = function(index) {
        $scope.activeSlide = index;
        $scope.showModal('templates/image-popover.html');
    }
 
    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }
 
    // Close the modal
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };

}
])