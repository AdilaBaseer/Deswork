sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter"
], function (Controller, MessageBox, MessageToast, UploadCollectionParameter) {
	"use strict";
	return Controller.extend("vaspp.Customer.controller.Detail", {
		onInit: function () {
			
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			

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
			this.oRouter.navTo("detail", { layout: sNextLayout, product: this._product });
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", { layout: sNextLayout, product: this._product });
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", { layout: sNextLayout });
		},
		

		_onProductMatched: function (oEvent) {
			
			
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this.getView().bindElement({
				path: "/CustomerCollection/" + this._product,
				model: "mcustomer"
			});
			//attachment
			var attachmentModel = new sap.ui.model.json.JSONModel(this.getView().mElementBindingContexts.mcustomer.getObject().documents);
			this.getView().setModel(attachmentModel,"attachmentModel");
			this.getView().getModel("attachmentModel").updateBindings(true);
		},
//EDIT THE CUSTOMER DETAILS
		onEdit: function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");

			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if(sNextLayout == null)
			sNextLayout = "OneColumn"
			this.getOwnerComponent().getRouter().navTo("AddNewCustomer", { "AddCust": "Edit", "layout": sNextLayout,"listindex":this._product });
		},
//DELETE THE CUSTOMER DETAILS
		onDetailPageDelete: function (evt) {
			var that = this;
			
			var oItems = evt.getSource().getBindingContext("mcustomer").getObject().customerName;
			var oData = that.getView().getModel("mcustomer").getData().CustomerCollection;
			MessageBox.confirm("Are you sure you want to Delete  ?", {
				actions: ["Yes", "No"],
				emphasizedAction: "Yes",
				onClose: function (oEvent) {
					if (oEvent == "Yes") {
                   for (var i = 0; i < oData.length; i++) {
							var products = oData[i];
											
							if (products.customerName === oItems) {
								that.getView().getModel("mcustomer").getData().CustomerCollection.splice(i, 1)
								
							}
						}
						that.getView().getModel("mcustomer").updateBindings(true);
						MessageBox.success("Customer details has been deleted");
						//NAVIGATE TO MASTER			
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("master");

					}
				}
			}
			);


		},
		



		//UPLOAD DOCUMENTS
		onChange: function (oEvent) {
			var that=this;
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
		}



		// working
	});
});