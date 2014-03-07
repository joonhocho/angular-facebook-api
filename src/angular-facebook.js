angular.module('jun.facebook', [])

.provider('$FB', function () {
	'use strict';

	var that = this,
		options = angular.extend({}, {
			// Default option values

			// FB.init params
			// https://developers.facebook.com/docs/javascript/reference/FB.init/
			appId: null,
			cookie: false,
			logging: true,
			status: true,
			xfbml: false,
			authResponse: void 0,
			frictionlessRequests: false,
			hideFlashCallback: null,

			// more options
			permissions: ''
		});

	function getSetOption(name, val) {
		if (val === void 0) {
			return options[name];
		}
		options[name] = val;
		return this;
	}

	angular.forEach(['appId', 'cookie', 'logging', 'status', 'xfbml', 'authResponse', 'frictionlessRequests', 'hideFlashCallback', 'permissions'], function (name) {
		this[name] = angular.bind(getSetOption, this, name);
	}, this);

	this.option = function (name, val) {
		if (typeof name === 'object') {
			angular.extend(options, name);
			return this;
		}
		return getSetOption.call(this, name, val);
	};

	this.$get = [
		'$q', '$timeout',
		function ($q, $timeout) {
			var deferred = $q.defer();

			if (options.appId) {
				// https://developers.facebook.com/docs/javascript/quickstart
				window.fbAsyncInit = function () {
					FB.init({
						appId: options.appId,
						cookie: options.cookie,
						logging: options.logging,
						status: options.status,
						xfbml: options.xfbml,
						authResponse: options.authResponse,
						frictionlessRequests: options.frictionlessRequests,
						hideFlashCallback: options.hideFlashCallback
					});
					$timeout(function () {
						deferred.resolve(FB);
					});
				};

				(function (d, s, id) {
					var js, fjs = d.getElementsByTagName(s)[0];
					if (d.getElementById(id)) {
						return;
					}
					js = d.createElement(s);
					js.id = id;
					js.src = "//connect.facebook.net/en_US/all.js";
					fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'facebook-jssdk'));
			}
			else {
				deferred.reject('$FB: appId is not set!');
			}

			return deferred.promise;
		}
	];
});
/*
    angular.module("facebookUtils").service("facebookUser", [ "$window", "$rootScope", "$q", "facebookConfigDefaults", "facebookConfigSettings", "facebookSDK", function($window, $rootScope, $q, facebookConfigDefaults, facebookConfigSettings, facebookSDK) {
        var FacebookUser = function() {};
        var checkStatus = function() {
            var deferred = $q.defer();
            FB.getLoginStatus(function(response) {
                $rootScope.$apply(function() {
                    if (response.status === "connected") {
                        user.loggedIn = true;
                        $rootScope.$broadcast("fbLoginSuccess", response);
                        deferred.resolve(response);
                    } else {
                        user.loggedIn = false;
                        deferred.reject(response);
                    }
                });
            }, true);
            return deferred.promise;
        };
        FacebookUser.prototype.loggedIn = false;
        FacebookUser.prototype.api = function() {
            var deferred = $q.defer();
            var args = [].splice.call(arguments, 0);
            args.push(function(response) {
                $rootScope.$apply(function() {
                    deferred.resolve(response);
                });
            });
            FB.api.apply(FB, args);
            return deferred.promise;
        };
        FacebookUser.prototype.login = function() {
            var _self = this;
            FB.login(function(response) {
                if (response.authResponse) {
                    response.userNotAuthorized = true;
                    _self.loggedIn = true;
                    $rootScope.$broadcast("fbLoginSuccess", response);
                } else {
                    _self.loggedIn = false;
                    $rootScope.$broadcast("fbLoginFailure");
                }
            }, {
                scope: facebookConfigSettings.permissions || facebookConfigDefaults.permissions
            });
        };
        FacebookUser.prototype.logout = function() {
            var _self = this;
            FB.logout(function(response) {
                if (response) {
                    _self.loggedIn = false;
                    $rootScope.$broadcast("fbLogoutSuccess");
                } else {
                    $rootScope.$broadcast("fbLogoutFailure");
                }
            });
        };
        var user = new FacebookUser();
        var deferred = $q.defer();
        facebookSDK.then(function() {
            checkStatus()["finally"](function() {
                deferred.resolve(user);
            });
        }, function() {
            deferred.reject("SDK failed to load because your app ID wasn't set");
        });
        return deferred.promise;
    } ]);
})({}, function() {
    return this;
}());
*/
