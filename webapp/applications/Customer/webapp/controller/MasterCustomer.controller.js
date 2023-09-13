sap.ui.define([

	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',


], function (Controller, MessageToast, Filter, FilterOperator, Sorter) {
	"use strict";

	return Controller.extend("vaspp.Customer.controller.MasterCustomer", {
		onInit: function () {
			var that = this;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("masterCustomer").attachPatternMatched(function (oEvent) {
				this.getView().byId("productsTable").removeSelections(true);
			}, this);
			this._bDescendingSort = false;
			$.get("/deswork/api/p-customers?populate=*", function (response) {
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getOwnerComponent().setModel(oModel, "mcustomer");
				that.getOwnerComponent().getModel("mcustomer").updateBindings(true);
			})
		},

		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1).layout;
			var	customerID = oEvent.getSource().getSelectedItem().getBindingContext("mcustomer").getObject().id;
			this.oRouter.navTo("detailCustomer", { product: customerID, layout: oNextUIState });
		//	this.oRouter.navTo("detail", { product: customerID, layout: "TwoColumnsMidExpanded" });
			this.getView().getModel("mcustomer").updateBindings(true);
			

		},


		//SEARCH THE CUSTOMER DETAILS USING ID
		onSearch: function (oEvent) {

			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("attributes/name", FilterOperator.Contains, sQuery)];
			}
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
		//TO ADD NEW CUSTOMER 
		onAddNewCustomer: function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");

			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if (sNextLayout == null)
				sNextLayout = "OneColumn"
			//NAVIGATE TO THE ADD NEW CUSTOMER
			this.getOwnerComponent().getRouter().navTo("AddNewCustomer", { "AddCust": "Add", "layout": sNextLayout, "listindex": "add" });
		},


		//SORT THE CUSTOMER DETAILS USING NAME
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("id", this._bDescendingSort);

			oBinding.sort(oSorter);
		},

	});
});