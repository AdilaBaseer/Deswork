/*global QUnit*/

sap.ui.define([
	"vaspp/dayleavetracking/controller/dayLeave.controller"
], function (Controller) {
	"use strict";

	QUnit.module("dayLeave Controller");

	QUnit.test("I should test the dayLeave controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
