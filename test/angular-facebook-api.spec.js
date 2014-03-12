/* jshint node: true, camelcase: false, maxstatements: 50 */
/* global inject, describe, it, beforeEach, expect, spyOn */
describe('Module: jun.facebook', function () {
	'use strict';

	beforeEach(module('jun.facebook'));

	var $timeout, $window, $document, $FB,
		FBMock = {};

	beforeEach(inject(function (_$timeout_, _$window_, _$document_, _$FB_) {
		$timeout = _$timeout_;
		$window = _$window_;
		$document = _$document_;
		$FB = _$FB_;
	}));

	describe('$FB', function () {
		it('should not be loaded yet', function () {
			expect($FB.FB).toBeNull();
			expect($FB.loaded).toBe(false);
			expect($FB.loading).toBe(false);
			expect($FB.initialized).toBe(false);
			expect($document[0].getElementById('facebook-jssdk')).toBeNull();
		});
	});

	describe('$FB.load()', function () {
		it('should load a Facebook SDK script', function () {
			var FBReturned = null;

			var promise = $FB.load();
			promise.then(function (FB) {
				FBReturned = FB;
			});

			expect($FB.FB).toBeNull();
			expect(FBReturned).toBeNull();
			expect($FB.loaded).toBe(false);
			expect($FB.loading).toBe(true);
			expect($FB.initialized).toBe(false);

			var script = $document[0].getElementById('facebook-jssdk');
			expect(script).toBeTruthy();
			expect(script.nodeName).toBe('SCRIPT');
			expect(script.src).toContain('facebook');

			$timeout(function () {
				$window.FB = FBMock;
				$window.fbAsyncInit();
			});
			$timeout.flush();

			expect($FB.FB).toBe(FBMock);
			expect(FBReturned).toBe(FBMock);
			expect($FB.loaded).toBe(true);
			expect($FB.loading).toBe(false);
			expect($FB.initialized).toBe(false);

			// do it again
			FBReturned = null;

			var newPromise = $FB.load();
			expect(newPromise).toBe(promise);

			newPromise.then(function (FB) {
				FBReturned = FB;
			});

			// should stay the same
			expect($FB.loaded).toBe(true);
			expect($FB.loading).toBe(false);

			// should be always async
			expect(FBReturned).toBeNull();

			$timeout.flush();

			expect(FBReturned).toBe(FBMock);
		});
	});

	describe('$FB.init()', function () {
		it('should implicitly call load()', function () {
			expect($FB.initialized).toBe(false);

			var loadSpy = spyOn($FB, 'load').andCallThrough();

			var promise = $FB.init();

			expect(loadSpy).toHaveBeenCalled();
			expect(loadSpy.mostRecentCall.args.length).toBe(0);

			expect($FB.initialized).toBe(false);
		});
	});

});
