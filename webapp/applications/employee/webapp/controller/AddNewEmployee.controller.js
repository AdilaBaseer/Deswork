sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
	"use strict";
	return Controller.extend("VASPP.employee.controller.AddNewEmployee", {
		onInit: function () {
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getOwnerComponent().getRouter().getRoute("AddNewEmployee").attachPatternMatched(this.onObjectMatched, this);
			this.mrolesuser();
		},
		onObjectMatched: function (oEvent) {
			var that = this;
			that.isAdd = oEvent.getParameter("arguments").AddCust;
			that.getView().byId("idProjectId5").getSelectedKey("");
			that.empid = oEvent.getParameter("arguments").listindex;
			if (that.isAdd !== "Edit") {
				that.getView().setModel(new JSONModel({}));
				that.getView().setBusy(false);
			} else {
				var usersModel = this.getOwnerComponent().getModel("custUpdateDetails").getData();
				var multiComboBox = this.getView().byId("idProjectIdmultirole");
				var selectedKeys = [];

				usersModel.p_team_role_users.forEach(function (selectedItem) {
					var itemKey = selectedItem.id;
					selectedKeys.push(itemKey);
				});
				// for (var m = 0; m < aSelectedItems.length; m++) {
				// 	aSelectedItems[m].setSelected(true);
				// }
	

				multiComboBox.setSelectedKeys(selectedKeys);
				var data = {

					"firstName": usersModel.firstName,
					"lastName": usersModel.lastName,
					"gender": this.getView().byId("idProjectId3").getSelectedIndex(),
					"department": usersModel.department,
					"designation": usersModel.designation,
					"password": this.getView().byId("idProjectId").getValue(),
					"phone": usersModel.phone,
					"email": usersModel.email,
					"emergencyContName": usersModel.emergencyContName,
					"emergencyContPhone": usersModel.emergencyContPhone,
					"bankName": usersModel.bankName,
					"IFCScode": usersModel.IFCScode,
					"bankAccNo": usersModel.bankAccNo,
					"uan": usersModel.uan,
					"country": usersModel.country,
					"city": usersModel.city,
					"address": usersModel.address,
					"zipCode": usersModel.zipCode,
					"p_team_role_users": this.getView().byId("idProjectIdmultirole").getSelectedItems(),
					"rate_card": usersModel.rate_card
				};
				this.getView().setModel(new JSONModel(data));
			}
		},
		mrolesuser: function () {
			var that = this;
			$.ajax({
				type: "GET",
				url: '/deswork/api/p-team-role-users?populate=*',
				success: function (response) {
					that.getView().setBusy(false);
					var resv = JSON.parse(response);
					if (resv.error) {
						MessageBox.error(resv.error.message)
					}
					else {
						var oModel = new sap.ui.model.json.JSONModel(resv.data);
						that.getOwnerComponent().setModel(oModel, "mrolesuser");
						that.getOwnerComponent().getModel("mrolesuser").updateBindings(true);
					}
				}

			})
		},
		//Get service for user list
		handleGetUser: function () {
			var that = this;
			$.ajax({
				type: "GET",
				url: '/deswork/api/users?populate=*',
				success: function (response) {
					that.getView().setBusy(false);
					var resv = JSON.parse(response);
					if (resv.error) {
						MessageBox.error(resv.error.message)
					}
					else {
						var oModel = new sap.ui.model.json.JSONModel(resv);
						that.getOwnerComponent().setModel(oModel, "memployee");
						that.getOwnerComponent().getModel("memployee").updateBindings(true);
						MessageBox.success("Employee has been created successfully!");
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("masterEmployee", { "AddCust": "Add" });
					}
				}

			})
		},

		//ADDING AND UPDATING EMPLOYEE DETAILS
		handleAddUserOkPress: function (customerId) {
			var that = this;
			var genderVal = that.getView().byId("idProjectId3").getSelectedButton() ? that.getView().byId("idProjectId3").getSelectedButton().getText() : "";
			var Name = that.getView().byId("idProjectId1").getValue();
			var department = that.getView().byId("idProjectId5");
			if (genderVal == "Male") {
				genderVal = "Male";
			} else if (genderVal == "Female") {
				genderVal = "Female";
			} else if (genderVal == "Others") {
				genderVal = "Others";
			} else {
				genderVal = "";
			}
			that.rolesusers = that.getView().byId("idProjectIdmultirole").getSelectedKeys();
			var obj = {
				"username": Name,
				"email": that.getView().byId("idProjectId8").getValue(),
				"provider": "local",
				"confirmed": true,
				"blocked": false,
				"firstName": that.getView().byId("idProjectId1").getValue(),
				"lastName": that.getView().byId("idProjectIdln").getValue(),
				"gender": genderVal,
				"doj":that.getView().byId("datepickr").getValue(),
				"designation": that.getView().byId("idProjectId51").getSelectedKey(),
				"department": department.getSelectedKey() ? department.getSelectedKey() : "",
				"emergencyContName": that.getView().byId("idProjectId11").getValue()? that.getView().byId("idProjectId11").getValue() : null,
				"emergencyContPhone": that.getView().byId("idProjectId12").getValue()? that.getView().byId("idProjectId12").getValue() : null,
				"phone": that.getView().byId("idProjectId7").getValue(),
				"address": that.getView().byId("idProjectId18").getValue(),
				"city": that.getView().byId("idProjectId23").getValue(),
				"country": that.getView().byId("idProjectId22").getValue(),
				"zipcode": that.getView().byId("idProjectId25").getValue() ? that.getView().byId("idProjectId25").getValue() : null,
				//"password": "Vaspp@123",
				"password": that.getView().byId("idProjectId").getValue(),
				"appPermission": {},
				"p_team_role_users": that.rolesusers,
				"rate_card": that.getView().byId("idProjectIdrc").getValue() ? that.getView().byId("idProjectIdrc").getValue(): null,
				"bankName": that.getView().byId("idProjectId13").getValue() ,
				"IFCScode": that.getView().byId("idProjectId14").getValue(),
				"bankAccNo": that.getView().byId("idProjectId15").getValue(),
				"uan": that.getView().byId("idProjectId16").getValue() ? that.getView().byId("idProjectId16").getValue() : null,
			}
			if (that.isAdd == "Add") {
				var baseUrl = "/deswork/api/auth/local/register";
				var callMethod = "POST";

			} else {
				baseUrl = "/deswork/api/users/" + that.empid;
				callMethod = "PUT";
			}
			var Err = this.ValidateCreateCust();
			if (Err == 0) {
				$.ajax({
					url: baseUrl,
					type: callMethod,
					"headers": {
						"content-type": "application/json"
					},
					data: JSON.stringify(obj),
					dataType: "json",
					success: function (res) {
						if (res.error) {
							MessageBox.error(res.error.message);
						} else {
							that.handleGetUser();
						}
					},
					error: function (err) {
						MessageBox.error(err.responseJSON.error.message);
					}
				});
			} else {
				this.getView().setBusy(false);
				var text = "Please fill the mandatory fields";
				MessageBox.error(text);
			}
		},
		//CHECK DATA VALIDATION
		ValidateCreateCust: function () {
            var Err = 0;
            var thisView = this.getView();
            if (thisView.byId("idProjectId1").getValue() === "") {
                thisView.byId("idProjectId1").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId5").getSelectedKey() === "") {
                thisView.byId("idProjectId5").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId3").getSelectedButton() === "") {
                thisView.byId("idProjectId3").setValueState("None");
                Err++;
            }
			 if (thisView.byId("idProjectId").getValue() === "") {
                thisView.byId("idProjectId").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectIdln").getValue() === "") {
                thisView.byId("idProjectIdln").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId51").getSelectedKey() === "") {
                thisView.byId("idProjectId51").setValueState("None");
                Err++;
            }
			if (thisView.byId("idProjectIdmultirole").getSelectedKeys()['length'] === 0) {
                thisView.byId("idProjectIdmultirole").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId13").getValue() === "") {
                thisView.byId("idProjectId13").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId14").getValue() === "") {
                thisView.byId("idProjectId14").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId15").getValue() === "") {
                thisView.byId("idProjectId15").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId18").getValue() === "") {
                thisView.byId("idProjectId18").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId7").getValue() === "") {
                thisView.byId("idProjectId7").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId8").getValue() === "") {
                thisView.byId("idProjectId8").setValueState("None");
                Err++;
            }
			if (thisView.byId("datepickr").getValue() === "") {
                thisView.byId("datepickr").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId22").getValue() === "") {
                thisView.byId("idProjectId22").setValueState("None");
                Err++;
            }
            if (thisView.byId("idProjectId23").getValue() === "") {
                thisView.byId("idProjectId23").setValueState("None");
                Err++;
            }
            return Err;
        },
		

		//CANCELING THE DATA GETTING ADDED OR UPDATED 
		handleWizardCancel: function () {
			var that = this;

			MessageBox.confirm("Do you want to Cancel",
				{
					actions: ["Yes", "No"],
					emphasizedAction: "Yes",
					onClose: function (oEvent) {
						if (oEvent == "Yes") {
							var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter.navTo("masterEmployee");
						}
					}
				});

		},

	});

});
