/*global QUnit*/

sap.ui.define([
	"vaspp/employeetimetracking/controller/employeetimetracking.controller"
], function (Controller) {
	"use strict";

	QUnit.module("employeetimetracking Controller");

	QUnit.test("I should test the employeetimetracking controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
