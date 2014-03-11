/*! angular-facebook-api - v0.0.16 - 2014-03-11 */
/* global angular */
angular.module('jun.facebook', [])

.provider('$FB', function $FBProvider() {
	'use strict';

	/*
	 * Options
	 */

	var that = this,
		options = {
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

			// FB.login options
			// https://developers.facebook.com/docs/reference/javascript/FB.login
			scope: '',
			'enable_profile_selector': false,
			'profile_selector_ids': ''
		};

	function getSetOption(name, val) {
		if (val === void 0) {
			return options[name];
		}
		options[name] = val;
		return that;
	}

	angular.forEach([
		'appId',
		'cookie',
		'logging',
		'status',
		'xfbml',
		'authResponse',
		'frictionlessRequests',
		'hideFlashCallback',
		'scope',
		'enable_profile_selector',
		'profile_selector_ids'
	], function (name) {
		that[name] = angular.bind(that, getSetOption, name);
	});

	this.option = function (name, val) {
		if (typeof name === 'object') {
			angular.extend(options, name);
			return that;
		}
		return getSetOption(name, val);
	};

	var FB, FBPromise, $q;

	/*
	 * Initialization
	 */

	this.$get = [
		'$window', '$timeout', '$q',
		function ($window, $timeout, $$q) {
			$q = $$q;
			var deferred = $q.defer();

			if (options.appId) {
				// https://developers.facebook.com/docs/javascript/quickstart
				var window = $window,
					document = window.document;

				window.fbAsyncInit = function () {
					FB = that.FB = window.FB;
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
					js.src = '//connect.facebook.net/en_US/all.js';
					fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'facebook-jssdk'));
			}
			else {
				deferred.reject('$FB: appId is not set!');
			}

			FBPromise = deferred.promise;
			return that;
		}
	];

	/*
	 * Helpers
	 */

	/* jshint validthis: true */
	function handleResponse(response) {
		if (!response || response.error) {
			this.reject(response && response.error || false);
		}
		else {
			this.resolve(response);
		}
	}

	function addCallbackToPromise(deferred, callback) {
		var promise = deferred.promise;
		if (typeof callback === 'function') {
			promise.then(callback);
		}
		return promise;
	}

	/*
	 * Public APIs
	 */
	this.getLoginStatus = function (callback) {
		// https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
		return FBPromise.then(function (FB) {
			var deferred = $q.defer();

			FB.getLoginStatus(angular.bind(deferred, handleResponse));

			return addCallbackToPromise(deferred, callback);
		});
	};

	this.api = function () {
		var apiArgs = arguments;

		// https://developers.facebook.com/docs/javascript/reference/FB.api
		return FBPromise.then(function (FB) {
			var deferred = $q.defer(),
				args = Array.prototype.slice.call(apiArgs),
				callback;

			if (typeof args[args.length - 1] === 'function') {
				callback = args.pop();
			}

			args.push(angular.bind(deferred, handleResponse));

			FB.api.apply(FB, args);

			return addCallbackToPromise(deferred, callback);
		});
	};

	this.login = function (callback, opts) {
		// https://developers.facebook.com/docs/reference/javascript/FB.login
		return FBPromise.then(function (FB) {
			var deferred = $q.defer();

			if (typeof callback !== 'function') {
				callback = null;
				opts = callback;
			}

			function getOpt(name) {
				var val = opts && opts[name];
				return val === void 0 ? options[name] : val;
			}

			FB.login(angular.bind(deferred, handleResponse), {
				scope: getOpt('scope'),
				'enable_profile_selector': getOpt('enable_profile_selector'),
				'profile_selector_ids': getOpt('profile_selector_ids')
			});

			return addCallbackToPromise(deferred, callback);
		});
	};

	this.logout = function (callback) {
		// https://developers.facebook.com/docs/reference/javascript/FB.logout
		return that.getLoginStatus().then(function (response) {
			var deferred = $q.defer();

			if (response.authResponse) {
				FB.logout(angular.bind(deferred, handleResponse));
			}
			else {
				deferred.reject(response);
			}

			return addCallbackToPromise(deferred, callback);
		});

	};

	this.disconnect = function (callback) {
		// http://stackoverflow.com/questions/6634212/remove-the-application-from-a-user-using-graph-api/7741978#7741978
		return FBPromise.then(function (FB) {
			var deferred = $q.defer();

			FB.api('/me/permissions', 'DELETE', angular.bind(deferred, handleResponse));

			return addCallbackToPromise(deferred, callback);
		});
	};
});
