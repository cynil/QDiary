var QDiary = angular.module('QDiary', ['ngRoute', 'myFilters', 'myServices', 'simpleStorage'])

QDiary
    .config(function DiaryRouteConfig($routeProvider){
        $routeProvider
            .when('/', {
                controller: 'MainController',
                templateUrl: 'templates/default.tmpl.html'
            })
            .when('/view/:guid', {
                controller: 'DetailController',
                templateUrl: 'templates/detail.tmpl.html'
            })
            .when('/edit/:guid',{
                controller: 'EditController',
                templateUrl: 'templates/edit.tmpl.html'
            })
            .when('/new/', {
                controller: 'NewController',
                templateUrl: 'templates/edit.tmpl.html'
            })
            .otherwise({
                redirectTo: '/'
            })
    })

    .run(function($rootScope, $location, DiaryService, $getItemByGuid){

        $rootScope.diaries = DiaryService.query()

        $rootScope.$on('$routeChangeSuccess', function(evt){
            var bread = $location.url().split('/').filter(function(v){
                return v !== ''
            })

            if(bread[1]){
                bread[1] = $rootScope.diaries[$getItemByGuid(bread[1], $rootScope.diaries)]['title']
            }

            $rootScope.breadcrumb = ['Home'].concat(bread)
        })

    })

    .controller('MainController', function($rootScope, $myStorage, DiaryService, $location){

        if(!$myStorage.simple('used')){
            var date = new Date().toLocaleString();
            var welcome = {
                title: 'Welcome!',
                date: date,
                contents: [
                    'Thank you for using QDiary!',
                    'QDiary is a lightweight diary web application build with AngularJS and Bootstrap.',
                    'It is very safe and convenient, As it is backend-less -- all of its data are stored in your own computer\'s localStorage, and it is available event when youare offline',
                    'Enjoy your time with writing diaries!'
                    ]
            }

            welcome.guid = DiaryService.save(welcome)

            $rootScope.diaries.push(welcome)

            $myStorage.simple('used', 'used')

            $location.path('/view/' + welcome.guid)

        }

    })

    .controller('DetailController', function($scope, $rootScope, $routeParams, $location, $getItemByGuid, DiaryService){

        var key = $getItemByGuid($routeParams.guid, $rootScope.diaries)
        $scope.diary = $rootScope.diaries[key]

        $scope['delete'] = function(){
            $rootScope.diaries.splice(key, 1)
            DiaryService['delete']($scope.diary)

            var next = $rootScope.diaries[key] ? $rootScope.diaries[key] : 0

            if(next){
                $location.path('/view/' + next.guid)
            }else{
                $location.path('/')
            }
        }
        
    })

    .controller('EditController', function($scope, $rootScope, $routeParams, $location, $getItemByGuid, DiaryService){

        $scope.diary = $rootScope.diaries[$getItemByGuid($routeParams.guid, $rootScope.diaries)]
        $scope.rawContents = $scope.diary.contents.join('\n')

        $scope.saveItem = function(){
            var item = {
                title: $scope.diary.title,
                date: $scope.diary.date,
                contents: $scope.rawContents.split('\n'),
                guid: $scope.diary.guid
            }

            DiaryService.save(item)
            
            $rootScope.diaries[$getItemByGuid($routeParams.guid, $rootScope.diaries)] = item

            $location.path('/view/' + item.guid)
        }
    })

    .controller('NewController', function($scope, $rootScope, $location, DiaryService){
        $scope.rawContents = ''
        $scope.saveItem = function(){
            var date = new Date().toLocaleDateString()
            var item = {
                title: $scope.diary.title,
                date: date,
                contents: $scope.rawContents.split('\n')
            }

            item.guid = DiaryService.save(item)

            $rootScope.diaries.push(item)

            $location.path('/view/' + item.guid)
        }
    })


/*
 *
 * Filters
 * 
 */
angular.module('myFilters', [])
    .filter('hideExtra', function(){
        return function(value, limit){
            return value.length>limit ? value.substr(0, limit) + '...' : value
        }
    })

/*
 *
 * Services
 * 
 */
angular.module('myServices', ['simpleStorage'])

    .factory('$getItemByGuid', function(){
        return function(key, list){
            for(var i = 0; i < list.length; i++){
                if(list[i]['guid'] === key){
                    return i
                }
            }
        }
    })

    .factory('DiaryService', function($myStorage){

        var db = $myStorage.open('diaries')

        return {
            query: function(){
                return db.query()
            },

            save: function(item){
                if(!item.guid || item.guid.indexOf('diaries') < 0){
                    return db.create(item)
                }else{
                    return db.update(item)
                }
            },

            'delete': function(item){
                return db['delete'](item)
            }
        }
    })
