/*global QUnit*/

sap.ui.define([
	"vaspp/publicholiday/controller/publicholiday.controller"
], function (Controller) {
	"use strict";

	QUnit.module("publicholiday Controller");

	QUnit.test("I should test the publicholiday controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
