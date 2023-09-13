/*global QUnit*/

sap.ui.define([
	"vaspp/timetracking/controller/timetracking.controller"
], function (Controller) {
	"use strict";

	QUnit.module("timetracking Controller");

	QUnit.test("I should test the timetracking controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
