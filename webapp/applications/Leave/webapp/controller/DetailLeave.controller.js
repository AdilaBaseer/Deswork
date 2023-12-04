sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"vaspp/Leave/utils/formatter",
	"sap/m/library",
	"sap/m/MessageBox",
	"sap/m/TextArea"
], function (Controller, Dialog, Button, Label,formatter, mobileLibrary, MessageBox, TextArea) {
	"use strict";
	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
	return Controller.extend("vaspp.Leave.controller.DetailLeave", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			that.getUserDetails();
			var oExitButton = that.getView().byId("exitFullScreenBtn");
			var oEnterButton = that.getView().byId("enterFullScreenBtn");
			that.oRouter = that.getOwnerComponent().getRouter();
			that.oModel = that.getOwnerComponent().getModel();
			that.oRouter.getRoute("detailLeave").attachPatternMatched(that._onObjectMatched, that);
			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (that.bFocusFullScreenButton) {
							that.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(that)
				});
			}, that);		
		},

		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailLeave", { layout: sNextLayout, product: this.id });
		},
		//EXIT FULL SCREEN
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailLeave", { layout: sNextLayout, product: this.id });
		},
		//CLOSE THE DETAIL
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterLeave", { layout: sNextLayout });
		},
		_onObjectMatched: function (oEvent) {
			var that = this;
			that.id = oEvent.getParameter("arguments").product;
			var options = {};
			var mAdttachment = [];
			$.get('/deswork/api/p-leaves/' + that.id + '?populate=*', options, function (response) {
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getBalanceLeavesData(response.data.attributes.requestedById);
				that.getLeaveHistory(response.data.attributes.requestedById);
				that.getView().setModel(oModel, "mleave");
				mAdttachment = response.data.attributes.p_attachment.data;
				var kModel = new sap.ui.model.json.JSONModel(mAdttachment);
				that.getView().setModel(kModel, "mDocuments"); 				
			});
		},
		getLeaveHistory: function(id) {
			var that = this;			
			var url = 'deswork/api/p-leaves?filters[requestedById]eq=' + id;
			$.ajax({
				url: url,
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				success: function (response) {
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "leaveHistory");
				}
			});
		},
		// APPROVE BUTTON
		onInitialFocusOnAccept: function () {
			var that = this;
			that.onSubmitResponse("Approved");
		},
		onInitialFocusOnReject: function () {
			var that = this;
			that.onSubmitResponse("Rejected");
		},
		onDownloadSelectedButton: function () {
			var oUploadSet = this.byId("UploadSet");
			oUploadSet.getItems().forEach(function (oItem) {
				if (oItem.getListItem().getSelected()) {
					oItem.download(true);
				}
			});
		},
		onSubmitResponse: function (status) {
			var that = this;
			that.getDataToUpdate(status);
		},
		getDataToUpdate: function (status) {
			var that = this;
			var response = that.getView().getModel("mleave").getData();
			response.attributes.status = status;
			if (status === 'Approved') {
				if(response.attributes.halfDay) {
					response.attributes.leave_balance = that.balanceLeaves - 0.5;
				} else {
					response.attributes.leave_balance = that.balanceLeaves - response.attributes.NoOfDays;
				}
				that.balanceLeaves = response.attributes.leave_balance;
				response.attributes.approvedBy = that.approvedBy;
			}
			that.updateStatus(response.attributes, status, response.id);
		},
		updateStatus: function (data, status, id) {
			var that = this;
			var updateUrl = '/deswork/api/p-leaves/' + id;
			$.ajax({
				url: updateUrl,
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				}, data: JSON.stringify({
					"data": {
						"startDate": data.startDate,
						"endDate": data.endDate,
						"NoOfDays": data.NoOfDays,
						"type": data.type,
						"status": data.status,
						"reason": data.reason,
						"halfDay": data.halfDay,
						"leave_balance": data.leave_balance,
						"approvedBy": data.approvedBy,
						"requestedBy": data.requestedBy,
						"requestedById": data.requestedById,
					}
				}),
				success: function (response) {
					that.updateLeaveBalance(data, status);	
				}
			});
		},
		updateLeaveBalance: function (leave,status) {
			var that = this;
			var data = that.getView().getModel("balanceleave").getData().data[0];
			data.attributes.balanceLeaves = that.balanceLeaves;
			var temp = data.attributes;
			if(leave.type === "Sick Leave") {
				if(leave.halfDay) {
					temp.sickLeaves = temp.sickLeaves + 0.5;
				} else {
					temp.sickLeaves = temp.sickLeaves + leave.NoOfDays;
				}
			} else if(leave.type === "Unpaid Leave") {
				if(leave.halfDay) {
					temp.unPaidLeaves = temp.unPaidLeaves + 0.5;
				} else {
					temp.unPaidLeaves = temp.unPaidLeaves + leave.NoOfDays;
				}
			} else {
				if(leave.halfDay) {
					temp.paidLeaves = temp.paidLeaves + 0.5;
				} else {
					temp.paidLeaves = temp.paidLeaves + leave.NoOfDays;
				}
			}
			temp.balanceLeaves = that.balanceLeaves;
			var updateUrl = '/deswork/api/p-balance-leaves/' + that.balanceLeavesId ;
			$.ajax({
				url: updateUrl,
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				}, data: JSON.stringify({
					"data": {
					"year": temp.year,
					"defaultLeaves": temp.defaultLeaves,
					"carryForwardLeaves": temp.carryForwardLeaves,
					"balanceLeaves": that.balanceLeaves,
					"sickLeaves": temp.sickLeaves,
					"paidLeaves": temp.paidLeaves,               
					"unPaidLeaves": temp.unPaidLeaves,
					"userId": temp.userId,
					"userName": temp.userName
				}
				  }),
				success: function (response) {
					//sap.m.MessageToast.show(status);
					sap.m.MessageBox.success("Leave  " + status);
					that.handleClose();
				}
			});
		},
		getUserDetails: function() {
			var that = this;			
			var url = 'deswork/api/users/me?populate=*';
			$.ajax({
				url: url,
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				success: function (response) {
					response = JSON.parse(response);
					that.userId = response.id;
					var oModel = new sap.ui.model.json.JSONModel(response);
					that.getView().setModel(oModel, "userModel");
					that.approvedBy = response.username;
				}
			});
		},
		getBalanceLeavesData: function(id) {
			var that = this;
			var currentYear = new Date();
			currentYear = currentYear.getFullYear();
			var balanceLeaveUrl = '/deswork/api/p-balance-leaves?populate=*&filters[year][$eq]=';
			balanceLeaveUrl = balanceLeaveUrl + currentYear + '&filters[userId][$eq]=' + id;
			$.ajax({
				url: balanceLeaveUrl,
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				success: function (res) {
					res = JSON.parse(res);					
					that.balanceLeaves = res.data[0].attributes.balanceLeaves;
					that.balanceLeavesId = res.data[0].id;
					var oModel2 = new sap.ui.model.json.JSONModel(res);
					that.getView().setModel(oModel2, "balanceleave");
				}
			});
		}
	});
});