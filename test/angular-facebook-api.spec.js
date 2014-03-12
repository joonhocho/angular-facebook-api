/* jshint node: true, camelcase: false */
/* global inject, describe, it, beforeEach, expect */
describe('Module: jun.facebook', function () {
	'use strict';

	beforeEach(module('jun.facebook'));

	var $timeout, $window, $document, $FB;

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

		it('should load script on calling load()', function () {
			var FBMock = {},
				FBReturned = null;

			$FB.load().then(function (FB) {
				FBReturned = FB;
			});

			expect($FB.FB).toBeNull();
			expect(FBReturned).toBeNull();
			expect($FB.loaded).toBe(false);
			expect($FB.loading).toBe(true);
			expect($FB.initialized).toBe(false);

			var script = $document[0].getElementById('facebook-jssdk');
			expect(script).not.toBeNull();
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
			$FB.load().then(function (FB) {
				FBReturned = FB;
			});

			// should be always async
			expect(FBReturned).toBeNull();

			$timeout.flush();

			expect(FBReturned).toBe(FBMock);
		});

	});

});
