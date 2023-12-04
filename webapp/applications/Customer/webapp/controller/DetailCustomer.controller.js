sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"vaspp/Customer/utils/formatter",
	"sap/m/UploadCollectionParameter"
], function (Controller, MessageBox, MessageToast, formatter, UploadCollectionParameter) {
	"use strict";
	return Controller.extend("vaspp.Customer.controller.DetailCustomer", {
		formatter: formatter,
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();
			this.oRouter.getRoute("detailCustomer").attachPatternMatched(this._onObjectMatched, this);
			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this);
		},

		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailCustomer", { layout: sNextLayout, product: this.id });
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailCustomer", { layout: sNextLayout, product: this.id });
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterCustomer", { layout: sNextLayout });
		},

		_onObjectMatched: function (oEvent) {
			var that = this;
			that.delete = false;
			var options = {};
			if (typeof oEvent == "number") {
				this.id = oEvent;
			} else {
				this.id = oEvent.getParameter("arguments").product;
			}
			that.getCustomer(this.id);
		},

		getCustomer: function () {
			var that = this;
			if (this.delete) {
				var options = {};
				$.get('/deswork/api/p-customers/?populate=*', options, function (response) {
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getOwnerComponent().setModel(oModel, "mcustomer");
					that.getOwnerComponent().getModel("mcustomer").updateBindings("true");
					MessageBox.success("Employee has been deleted");
					that.handleClose();
				});
			} else {
				var options = {};
				$.get('/deswork/api/p-customers/' + this.id + '?populate[0]=p_projects', options, function (response) {
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mcustomer");
					that.getOwnerComponent().getModel("mcustomer").updateBindings("true");
				});
			}
		},

		//EDIT THE CUSTOMER DETAILS
		onEdit: function () {
			var that = this;
			var sendVendordetails = new sap.ui.model.json.JSONModel(this.getView().getModel("mcustomer").getData());
			this.getOwnerComponent().setModel(sendVendordetails, "custUpdateDetails");
			this.getView().getModel().setProperty("/layout", "OneColumn");
			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if (sNextLayout == null)
				sNextLayout = "OneColumn"
			this.getOwnerComponent().getRouter().navTo("AddNewCustomer", { "AddCust": "Edit", "layout": sNextLayout, "listindex": this.id });

		},
		//DELETE THE CUSTOMER DETAILS
		onDetailPageDelete: function (evt) {
			var that = this;
			MessageBox.confirm("Are you sure you want to Delete  ?", {
				actions: ["Yes", "No"],
				emphasizedAction: "Yes",
				onClose: function (evt) {
					if (evt == "Yes") {
						$.ajax({
							type: "DELETE",
							url: "/deswork/api/p-customers/" + that.id,
							success: function (response) {
								var resv = JSON.parse(response);
								if (resv.error) {
									MessageBox.error(resv.error.message)
								}
								else {
									that.delete = true;
									that.getCustomer();
								}
							}

						})
					}
				}
			}
			);
		},

		//UPLOAD DOCUMENTS
		onChange: function (oEvent) {
			var that = this;
			var oUploadCollection = oEvent.getSource();
			var file = oEvent.getParameter("item").getFileObject();
			that.fileName = oEvent.getParameter("item").getFileName();
			var reader = new FileReader();
			reader.onload = function (e) {
				that.getView().mElementBindingContexts.mcustomer.getObject().documents.push({
					"FileName": that.fileName,
					"FileContent": e.currentTarget.result
				});
			};
			reader.readAsDataURL(file);
		},

		onStartUpload: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			var oTextArea = this.byId("TextArea");
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)";
			if (cFiles > 0) {
				oUploadCollection.upload();
				if (oTextArea.getValue().length === 0) {
					uploadInfo = uploadInfo + " without notes";
				} else {
					uploadInfo = uploadInfo + " with notes";
				}
				MessageToast.show("Method Upload is called (" + uploadInfo + ")");
				MessageBox.information("Uploaded " + uploadInfo);
				oTextArea.setValue("");
			}
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function () {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},

		onUploadComplete: function (oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			setTimeout(function () {
				var oUploadCollection = this.byId("UploadCollection");
				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}
				MessageToast.show("Event uploadComplete triggered");
			}.bind(this), 8000);
		},

		onSelectChange: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},
	});
});