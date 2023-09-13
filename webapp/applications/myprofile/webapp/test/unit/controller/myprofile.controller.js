/*global QUnit*/

sap.ui.define([
	"vaspp/myprofile/controller/myprofile.controller"
], function (Controller) {
	"use strict";

	QUnit.module("myprofile Controller");

	QUnit.test("I should test the myprofile controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
