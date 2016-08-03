var ngDiary = angular.module('ngDiary', ['ngRoute', 'simpleStorage'])
ngDiary
    .config(function DiaryRouteConfig($routeProvider){
        $routeProvider
            .when('/', {
                controller: 'MainController',
                templateUrl: 'templates/add.tmpl.html'
            })
            .when('/view/:guid', {
                controller: 'DetailController',
                templateUrl: 'templates/view.tmpl.html'
            })
            .when('/edit/:guid',{
                controller: 'EditController',
                templateUrl: 'templates/new.tmpl.html'
            })
            .when('/new/', {
                controller: 'NewController',
                templateUrl: 'templates/new.tmpl.html'
            })
            .otherwise({
                redirectTo: '/'
            })
    })

    .controller('MainController', function($scope, $rootScope, $Storage$){

        var DiaryService = $Storage$.open('diaries')

        $rootScope.diaries = DiaryService.query()

        if(!$Storage$.simple('used')){
            var date = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()].join('/')
            var welcome = {
                title: 'Welcome!',
                date: date,
                content: 'Thank you for using ngDiary!'
            }

            welcome.guid = DiaryService.create(welcome)

            $rootScope.diaries.push(welcome)

            $Storage$.simple('used', 'used')

        }

        $rootScope.delete = function(guid){
            var key

            $rootScope.diaries.map(function(v, i, arr){
                if(v.guid === guid){
                    key =  i
                }
            })

            DiaryService.delete($rootScope.diaries[key])
            $rootScope.diaries.splice(key, 1)
        }

    })
    
    .controller('DetailController', function($scope, $rootScope, $routeParams){
        var key

        $rootScope.diaries.map(function(v, i, arr){
            if(v.guid === $routeParams.guid){
                key =  i
            }
        })

        $scope.diary = $rootScope.diaries[key]

    })

    .controller('NewController', function($scope, $rootScope, $routeParams, $Storage$, $location){

        var DiaryService = $Storage$.open('diaries')

        $scope.saveItem = function(){
            var date = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()].join('/')
            var item = {
                title: $scope.diary.title,
                date: date,
                content: $scope.diary.content
            }

            item.guid = DiaryService.create(item)

            $rootScope.diaries.push(item)

            $location.path('/view/' + item.guid)
        }

    })
    .controller('EditController', function($scope, $rootScope, $routeParams, $Storage$, $location){

        var key,
            DiaryService = $Storage$.open('diaries')

        $rootScope.diaries.map(function(v, i, arr){
            if(v.guid === $routeParams.guid){
                key =  i
            }
        })

        $scope.diary = $rootScope.diaries[key]

        $scope.saveItem = function(){

            $rootScope.diaries[key] = $scope.diary;

            DiaryService.update($scope.diary);

            $location.path('/view/' + $scope.diary.guid)
        }
    })











