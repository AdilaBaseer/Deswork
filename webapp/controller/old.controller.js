sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Dialog",
	"sap/m/Text"

], function (Controller, MessageToast, MessageBox, Fragment, Component, ComponentContainer, Button, ButtonType, Dialog,
	Text) {
	"use strict";
	return Controller.extend("vaspp.userlogin.controller.App", {
		//formatter: formatter,

		onInit: function () {
			var that = this;
			var oViewModel = new sap.ui.model.json.JSONModel({
				busy: true,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				},
				launchpadRoot: this
			});
			that.attachments = [];
			that.getView().setModel(oViewModel, "appView");
			// var i18nModel = that.getOwnerComponent().getModel("i18n");
			// that.oResourceBundle = i18nModel.getResourceBundle();
			// this.getOwnerComponent().setModel(i18nModel, "i18nModel");
			window.location.hash = ""; // For preventing it from self re-rendering on browser refresh.
		},

		onAfterRendering: function () {
			var that = this;
			this.openLoginFragment();
		},

		onExit: function () {
			if (this.userDetailsFragment) {
				this.userDetailsFragment.destroy();
			}
			if (this.LoginFragment) {
				this.LoginFragment.destroy();
			}
		},

		openLoginFragment: function () {
			if (!this.LoginFragment) {
				this.LoginFragment = new sap.ui.xmlfragment("vaspp.userlogin.fragment.loginFragment", this);
				this.LoginFragment.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
				this.LoginFragment.setBusy(false);
				this.LoginFragment.open();
			} else {
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValue();
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValue();
				this.LoginFragment.setBusy(false);
				this.LoginFragment.open();
			}
			this.LoginFragment.getContent()[0].getItems()[0].setVisible(false);
		},

		OnUserSettingPress: function (evt) {
			var launchView = this;
			var userData = JSON.parse(window.localStorage.getItem("loggedOnUserData"));
			if (!launchView.userFragment) {
				launchView.userFragment = new sap.ui.xmlfragment("vaspp.userlogin.fragment.user", this);
				launchView.userFragment.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
			}

			launchView.userFragment.getContent()[0].getItems()[0].getItems()[1].setValue(userData.email);
			launchView.userFragment.getContent()[0].getItems()[0].getItems()[3].setValue(userData.password);

			launchView.userDetailsFragment.close();
			launchView.userFragment.open();
		},
		CancelPasswordChange: function (evt) {
			var that = this;
			that.attachments = [];
			that.userFragment.close();
		},
		ChangePassword: function (evt) {
			var that = this,
				email = this.userFragment.getContent()[0].getItems()[0].getItems()[1].getValue(),
				password = this.userFragment.getContent()[0].getItems()[0].getItems()[3].getValue(),
				password1 = this.userFragment.getContent()[0].getItems()[0].getItems()[5].getValue();
			// if (that.attachments.length > 0) {
			// 	var stamp = that.attachments[0].FileData;
			// } else {
			// 	var stamp = "";
			// }
			if (password1 && password) {
				this.userFragment.setBusy(true);
				var inputData = {
					"id": JSON.parse(window.localStorage.getItem("loggedOnUserData")).id,
					"user_email": email,
					"password": password,
					"password1": password1,
				};
				this.userFragment.setBusy(false);
			} else {
				var errorMsg,
					errorsCount = 0;
				if (!email) {
					errorMsg = this.oResourceBundle.getText("enterEmailPrompt");
					this.userFragment.getContent()[0].getItems()[0].getItems()[1].setValueStateText(errorMsg).setValueState("Error");
					++errorsCount;
				}
				if (!password) {
					errorMsg = this.oResourceBundle.getText("enterPasswordPrompt");
					this.userFragment.getContent()[0].getItems()[0].getItems()[3].setValueStateText(errorMsg).setValueState("Error");
					++errorsCount;
				}
				if (errorsCount > 0) {
					if (errorsCount === 1) {
						MessageToast.show(errorMsg);
					} else {
						MessageToast.show(this.oResourceBundle.getText("enterEmailAndPasswordPrompt"));
					}
				}
			}
		},

		performLogin: function () {

			var that = this,
				errMsg = this.LoginFragment.getContent()[0].getItems()[0],
				email = this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].getValue(),
				password = this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].getValue(),
				keepRemembered = this.LoginFragment.getContent()[0].getItems()[2].getItems()[4].getItems()[0].getSelected();

			if (email && password) {
				this.LoginFragment.setBusy(true);
				var inputData = {
					"user_email": email,
					"password": password
				};
				$.post("/deswork/api/auth/local", {
					"identifier": email,
					"password": password
				}, function (resp) {
					resp = JSON.parse(resp);
					if (resp.error) {
						that.LoginFragment.setBusy(false);
						that.getView().setBusy(false);
						MessageBox.error("Wrong Credentials!", {});
					} else {
						$.ajaxSetup({
							headers: {
								'Authorization': "Bearer " + resp.jwt
							}
						});
						$.get("/deswork/api/users/me?populate=*", function (userDet, respState) {
							userDet = JSON.parse(userDet);
							// if (userDet.mrole.roleName == "SuperAdmin" || userDet.mrole.roleName == "Admin") {
							// 	that.getView().byId("historyButtonId").setVisible(false);
							// 	that.getView().byId("bellButtonId").setVisible(false);
							// } else {
							// 	that.getView().byId("historyButtonId").setVisible(true);
							// 	that.getView().byId("bellButtonId").setVisible(true);
							// }
							if (userDet.designation == "Admin") {



							} else {
								that.getView().removeStyleClass("coverImage");
								that.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValue("");
								that.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValue("");
								that.LoginFragment.close();
								that.byId("app").setVisible(true);
								that.getView().setBusy(true);

								userDet.jwt = resp.jwt;

								var loggedOnUserModel = new sap.ui.model.json.JSONModel(userDet);
								that.getOwnerComponent().setModel(loggedOnUserModel, "loggedOnUserModel");
								if (keepRemembered) {
									window.localStorage.setItem("loggedOnUserData", JSON.stringify(userDet));
								} else {
									window.localStorage.setItem("loggedOnUserData", null);
								}
								that.loadLaunchpadMenu();
								if (that.userDetailsFragment) {
									that.userDetailsFragment.setModel(loggedOnUserModel);
								}
								var appComponentContainer;
								appComponentContainer = new ComponentContainer({
									height: "100%",
									name: "vaspp.ProjectStatisticalReport",
									propagateModel: true
								});
								var aMainContents = that.byId("app").getMainContents();
								if (aMainContents.length === 2)
									that.byId("app").removeMainContent(1);
								aMainContents[0].setVisible(false);
								that.byId("app").addMainContent(appComponentContainer);
								// if(userDet.mrole.roleName !== "Super Admin"){
								// that.filterModelsonOrgID(userDet.m_organisation.orgID);
								// }
								that.getView().setBusy(false);
							}
						})
					}
				});
				/*	var userData = this.getUserbyCred(email, password);
					if (userData.role == "SuperAdmin" || userData.role == "Admin") {
						this.getView().byId("historyButtonId").setVisible(false);
						this.getView().byId("bellButtonId").setVisible(false);
					} else {
						this.getView().byId("historyButtonId").setVisible(true);
						this.getView().byId("bellButtonId").setVisible(true);
					}
					if (userData !== null) {
						if (userData.role == "Admin") {

							// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
							// oRouter.navTo("Desclaim");
							that.LoginFragment.setBusy(false);
							this.LoginFragment.close();
							if (!this.oDefaultDialog) {
								this.oDefaultDialog = new Dialog({
									title: "Disclaimer",
									contentWidth: "40%",
									// resizable: true,
									draggable: true,
									class: "sapUiResponsivePadding",
									content: new Text({
										text: "Please go through the Terms and conditions and agree to use the tool.",
									}),
									beginButton: new Button({
										type: ButtonType.Emphasized,
										text: "Agree",
										press: function () {
											this.oDefaultDialog.close();
											this.performlogin2();
										}.bind(this)
									}),
									endButton: new Button({
										text: "DisAgree",
										press: function () {
											this.oDefaultDialog.close();
											this.LoginFragment.open();
											// this.getOwnerComponent().getRouter().navTo("TargetApp");
										}.bind(this)
									})
								});

								// to get access to the controller's model
								this.getView().addDependent(this.oDefaultDialog);
							}

							this.oDefaultDialog.open();

						} else {
							this.performlogin2();
						}
					} else {
						that.LoginFragment.setBusy(false);
						that.getView().setBusy(false);
						MessageBox.error("Wrong Credentials!", {});
					}*/

			} else {
				that.LoginFragment.setBusy(false);
				that.getView().setBusy(false);
				MessageBox.error("Wrong Credentials!", {});
			}

		},
		performlogin2: function () {
			var that = this,
				errMsg = this.LoginFragment.getContent()[0].getItems()[0],
				email = this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].getValue(),
				password = this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].getValue(),
				keepRemembered = this.LoginFragment.getContent()[0].getItems()[2].getItems()[4].getItems()[0].getSelected();
			var userData = this.getUserbyCred(email, password);
			if (userData !== null) {
				that.getView().removeStyleClass("coverImage");
				that.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValue("");
				that.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValue("");
				that.LoginFragment.close();
				that.byId("app").setVisible(true);
				that.getView().setBusy(true);

				var loggedOnUserModel = new sap.ui.model.json.JSONModel(userData);
				that.getOwnerComponent().setModel(loggedOnUserModel, "loggedOnUserModel");
				if (keepRemembered) {
					window.localStorage.setItem("loggedOnUserData", JSON.stringify(userData));
				} else {
					window.localStorage.setItem("loggedOnUserData", null);
				}
				that.loadLaunchpadMenu();
				if (this.userDetailsFragment) {
					that.userDetailsFragment.setModel(loggedOnUserModel);
				}
				this.filterModelsonOrgID(userData.orgid);
				that.getView().setBusy(false);
			} else {
				that.LoginFragment.setBusy(false);
				that.getView().setBusy(false);
				MessageBox.error("Wrong Credentials!", {});
			}
		},
		filterModelsonOrgID: function (orgid) {

			var users = this.getOwnerComponent().getModel("users").getData();
			var userdata = [],
				vendorsdata = [],
				customersdata = [];
			for (var i = 0; i < users.length; i++) {
				if (users[i].orgid === orgid)
					userdata.push(users[i]);
			}
			var usersModel = new sap.ui.model.json.JSONModel(userdata);
			this.getOwnerComponent().setModel(usersModel, "users");
			var vendors = this.getOwnerComponent().getModel("vendorInfo").getData();
			for (i = 0; i < vendors.length; i++) {
				if (vendors[i].orgid === orgid)
					vendorsdata.push(vendors[i]);
			}
			var vendorsModel = new sap.ui.model.json.JSONModel(vendorsdata);
			this.getOwnerComponent().setModel(vendorsModel, "vendorInfo");
			var customers = this.getOwnerComponent().getModel("customerInfo").getData();
			for (i = 0; i < customers.length; i++) {
				if (customers[i].orgid === orgid)
					customersdata.push(customers[i]);
			}
			var customersModel = new sap.ui.model.json.JSONModel(customersdata);
			this.getOwnerComponent().setModel(customersModel, "customerInfo");

		},
		getUserbyCred: function (email, pwd) {
			var usersModel = this.getOwnerComponent().getModel("users").getData();
			for (var i = 0; i < usersModel.length; i++) {
				if (usersModel[i].email == email && usersModel[i].password == pwd)
					return usersModel[i];
			}
			return null;
		},

		loadLaunchpadMenu: function () {
			var that = this;
			window.onload = function () {
				$(document).ready(function () {
					window.history.pushState(null, "", window.location.href);
					window.onpopstate = function () {
						window.history.pushState(null, "", window.location.href);
					};
				});
			};
			var navigationList = this.getOwnerComponent().getModel("navigationList").getData();
			var obj = {
				"navigation": navigationList
			};
			var sideBarMenuModel = new sap.ui.model.json.JSONModel(obj);
			that.byId("sideBarMenu").setModel(sideBarMenuModel);
			that.byId("sideBarMenu").setSelectedItem(that.byId("sideBarMenu").getItem().getItems()[0]);
			that.setPermissions();
		},

		setPermissions: function () {
			var sideBarMenuData = this.byId("sideBarMenu").getModel().getData().navigation,
				userData = this.getOwnerComponent().getModel("loggedOnUserModel").getData(),
				permissionData = userData.appPermission,
				userRole = userData.designation,
				permittedAppName;
			for (var appIndex = 0; appIndex < permissionData.length; appIndex++) {
				permittedAppName = permissionData[appIndex].appName;
				// Manipulating permissions for main menu items
				for (var itemIndex = 0; itemIndex < sideBarMenuData.length; itemIndex++) {

					if (sideBarMenuData[itemIndex].id === permissionData[appIndex].applicationid || sideBarMenuData[itemIndex].title ===
						permittedAppName) {
						sideBarMenuData[itemIndex].permissions.create = permissionData[appIndex].create === "true" || permissionData[appIndex].create ===
							true;
						sideBarMenuData[itemIndex].permissions.read = permissionData[appIndex].read === "true" || permissionData[appIndex].read ===
							true;
						sideBarMenuData[itemIndex].permissions.update = permissionData[appIndex].update === "true" || permissionData[appIndex].update ===
							true;
						sideBarMenuData[itemIndex].permissions.delete = permissionData[appIndex].delete === "true" || permissionData[appIndex].delete ===
							true;
					}

					// Manipulating permissions for sub menu items
					if (sideBarMenuData[itemIndex].items.length) {
						for (var subItemIndex = 0; subItemIndex < sideBarMenuData[itemIndex].items.length; subItemIndex++) {
							if (sideBarMenuData[itemIndex].items[subItemIndex].id === permissionData[appIndex].applicationid || sideBarMenuData[
								itemIndex]
								.items[
								subItemIndex].title === permittedAppName) {
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.create = permissionData[appIndex].create === "true" ||
									permissionData[appIndex].create === true;
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.read = permissionData[appIndex].read === "true" ||
									permissionData[
										appIndex].read === true;
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.update = permissionData[appIndex].update === "true" ||
									permissionData[appIndex].update === true;
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.delete = permissionData[appIndex].delete === "true" ||
									permissionData[appIndex].delete === true;
							}
						}
					}
				}
			}

			// If the super admin has logged on then giving all the permissions for the Users Management app
			if (userRole.toLowerCase() === "superadmin") {
				for (var itemIndex = 0; itemIndex < sideBarMenuData.length; itemIndex++) {
					if (sideBarMenuData[itemIndex].key === "UsersManagement") { // Specially setting permissions for the Users Management app
						sideBarMenuData[itemIndex].permissions.create = true;
						sideBarMenuData[itemIndex].permissions.read = true;
						sideBarMenuData[itemIndex].permissions.update = true;
						sideBarMenuData[itemIndex].permissions.delete = true;
						break;
					}
				}
			} else if (permissionData.length === 0) { // If no application is given access to the user yet (except super admin)
				//MessageBox.information(this.oResourceBundle.getText("notAppPermitted"));
			}

			this.byId("sideBarMenu").getModel().updateBindings(true);
		},

		performLogout: function () {
			var that = this;
			this.getView().setBusy(false);
			this.getView().addStyleClass("coverImage");
			this.byId("app").setVisible(false);
			this.goToHomePage();
			window.localStorage.setItem("loggedOnUserData", null);
			this.getOwnerComponent().setModel(null, "loggedOnUserModel");
			this.getOwnerComponent().setModel(null, "permissions");
			this.byId("sideBarMenu").setModel(null);
			this.getView().setBusy(false);
			setTimeout(function () {
				that.openLoginFragment();
			}, 100);
			// Prevent the user from going back
			$(document).ready(function () {
				window.history.pushState(null, "", window.location.href);
				window.onpopstate = function () {
					window.history.pushState(null, "", window.location.href);
				};
			});
		},

		hideErrMsgs: function (event) {
			this.LoginFragment.getContent()[0].getItems()[0].setVisible(false);
			if (event.getSource().getType() === "Email")
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValueState("None");
			else
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValueState("None");
		},
		hideErrMsgsShow: function (event) {
			var re =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var email = event.getSource().getValue();
			if (re.test(String(email).toLowerCase()))
				this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].setValueState("None");
			else
				this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].setValueState("Error");
		},
		launchApp: function (oEvent) {
			window.location.hash = "";
			var that = this,
				selectedItem = oEvent.getSource(),
				subItemsCount = selectedItem.getItems().length,
				selectedItemObj = selectedItem.getBindingContext().getObject(),
				componentName = selectedItemObj.componentName,
				selectedItemKey = selectedItemObj.key;
			var logOnAppInfo = {
				componentName: selectedItemObj.componentName,
				selectedItemKey: selectedItemObj.key,
				applicationid: selectedItemObj.id
			};
			var oModel = new sap.ui.model.json.JSONModel(logOnAppInfo);
			sap.ui.getCore().setModel(oModel, "logOnAppInfo");
			if (selectedItemObj.permissions.read) {
				if (selectedItemKey !== "Home") {
					if (!componentName && subItemsCount > 0) //If an expandable list item is selected which has no target app then toggle exapnd/collapse
						selectedItem.setExpanded(!selectedItem.getExpanded());
					else if (!componentName && subItemsCount === 0) {
						console.error("The menu item \"" + selectedItem.getText() + "\" has no target. Component name is missing.");
						if (!that.byId("app").getSideExpanded()) {
							that.byId("app").setSideExpanded(true);
							//	that.byId("sideNavigationToggleButton").setTooltip(that.oResourceBundle.getText("collapseMenu"));
						}
						return;
					} else {
						//that.glowControl("logo", true);
						var permissionsModel = new sap.ui.model.json.JSONModel(selectedItemObj.permissions);
						permissionsModel.setDefaultBindingMode("OneWay");
						that.getOwnerComponent().setModel(permissionsModel, "permissions"); //This model is accessed by the apps loaded in the launchpad

						if (that.byId("app").getSideExpanded()) {
							that.byId("app").setSideExpanded(false);
							//that.byId("sideNavigationToggleButton").setTooltip(that.oResourceBundle.getText("expandMenu"));
						}

						var appComponentContainer;
						if (selectedItemObj.appUrl) {
							// var appUrl = window.location.origin + "\/" + selectedItemObj.projectName;
							appComponentContainer = new ComponentContainer({
								url: selectedItemObj.appUrl,
								height: "100%",
								name: componentName,
								propagateModel: true
							});
						} else {
							appComponentContainer = new ComponentContainer({
								height: "100%",
								name: componentName,
								propagateModel: true
							});
						}
						var aMainContents = that.byId("app").getMainContents();
						if (aMainContents.length === 2)
							that.byId("app").removeMainContent(1);
						aMainContents[0].setVisible(false);
						that.byId("app").addMainContent(appComponentContainer);

						appComponentContainer.attachComponentCreated(function () {
							// MessageToast.show("Component Created!");
							//that.glowControl("logo", false);
						});
						appComponentContainer.attachComponentFailed(function () {
							//	that.glowControl("logo", false);
							// MessageToast.show("Failed to load the application");
							console.error("Failed to load the application from the component " + componentName);
						});
					}
				} else {
					this.goToHomePage();
				}
			} else {
				//MessageBox.information(this.oResourceBundle.getText("readingAppContentNotPermitted"));
				if (!that.byId("app").getSideExpanded()) {
					that.byId("app").setSideExpanded(true);
					//that.byId("sideNavigationToggleButton").setTooltip(that.oResourceBundle.getText("collapseMenu"));
				}
			}
		},

		goToHomePage: function () {
			if (!this.byId("app").getSideExpanded()) {
				this.byId("app").setSideExpanded(true);
			//	this.byId("sideNavigationToggleButton").setTooltip(this.oResourceBundle.getText("collapseMenu"));
			}
			if (this.byId("sideBarMenu").getItem().getItems().length) {
				this.byId("sideBarMenu").setSelectedItem(this.byId("sideBarMenu").getItem().getItems()[0]);
			}
			window.location.hash = "";
			var aMainContents = this.byId("app").getMainContents();
			if (aMainContents.length === 2)
				this.byId("app").removeMainContent(1);
			aMainContents[0].setVisible(true);
		},

		toggleSideMenuExpandCollapse: function () {
			var bSideExpanded = this.byId("app").getSideExpanded();
			//this._setToggleButtonTooltip(bSideExpanded);
			this.byId("app").setSideExpanded(!bSideExpanded);
			// bSideExpanded ? this.byId("sideNavigationToggleButton").setTooltip(this.oResourceBundle.getText("expandMenu")) : this.byId(
			// 	"sideNavigationToggleButton").setTooltip(this.oResourceBundle.getText("collapseMenu"));
		},

		showUserDetails: function (oEvent) {
			var userPhotoIcon = oEvent.getSource(),
				that = this;
			if (!this.userDetailsFragment) {
				this.userDetailsFragment = new sap.ui.xmlfragment("vaspp.userlogin.fragment.userDetailsFragment", this);
				//this.userDetailsFragment.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
				this.userDetailsFragment.setModel(this.getOwnerComponent().getModel("loggedOnUserModel"));
				that.userDetailsFragment.openBy(userPhotoIcon);
			} else {
				this.userDetailsFragment.openBy(userPhotoIcon);
			}
		},


		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter('item');
			var sKey = oItem.getKey();
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			if (sKey === "home") {
				this.sideNavClose();
				this.getRouter().navTo("Home");
			} else if (sKey === "users") {
				var oRouter2 = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter2.navTo("userMaster");
			} else if (sKey === "groups") {
				this.getRouter().navTo("groups");
			} else if (sKey === "roles") {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("roleMaster");
			} else if (sKey === "Super Admin") {
				this.getRouter().navTo("adminMaster");
			} else if (sKey === "Application") {
				this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter1.navTo("applicationlist");
			} else if (sKey === "Manage_Projects") {
				this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter1.navTo("Master");
			} else if (sKey === "Glossary") {
				this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter1.navTo("Targetmain");
			}
		},
		onItemClose: function (oEvent) {
			var oItem = oEvent.getSource(),
				oList = oItem.getParent();

			oList.removeItem(oItem);
			MessageToast.show("Notification Closed: " + oItem.getTitle());
		}
	});
});