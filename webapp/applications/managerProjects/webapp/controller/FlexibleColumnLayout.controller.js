sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("VASPP.managerProjects.controller.FlexibleColumnLayout", {
		onInit: function () {
			var that = this;
			that.oRouter = this.getOwnerComponent().getRouter();
			that.oRouter.attachRouteMatched(that.onRouteMatched, that);
			that.oRouter.attachBeforeRouteMatched(that.onBeforeRouteMatched, that);
		},

		onBeforeRouteMatched: function(oEvent) {
			var that = this;
			var oModel = that.getOwnerComponent().getModel();
			var sLayout = oEvent.getParameters().arguments.layout;
			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = that.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}
			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		},

		onRouteMatched: function (oEvent) {
			var that = this;
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

				that._updateUIElements();

			// Save the current route name
			that.currentRouteName = sRouteName;
			that.currentProduct = oArguments.product;
			that.currentSupplier = oArguments.supplier;
		},

		onStateChanged: function (oEvent) {
			var that = this;
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");

				that._updateUIElements();

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				that.oRouter.navTo(that.currentRouteName, {layout: sLayout, 
					product: that.currentProduct, supplier: that.currentSupplier}, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.getOwnerComponent().getModel();
			var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
			oModel.setData(oUIState);
		},

		onExit: function () {
			var that = this;
			that.oRouter.detachRouteMatched(that.onRouteMatched, that);
			that.oRouter.detachBeforeRouteMatched(that.onBeforeRouteMatched, that);
		}
	});
});

