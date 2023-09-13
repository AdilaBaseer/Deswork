sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "vaspp/mypublicholidays/utils/formatter",
    "sap/ui/model/json/JSONModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,formatter,JSONModel) {
        "use strict";
          
        return Controller.extend("vaspp.mypublicholidays.controller.View1", {
            formatter:formatter,
            onInit: function () {
                var that =this;
                var date= new Date();
                var year= date.getFullYear();
                $.get("/deswork/api/p-holidays?filters[year][$eq]="+ year,function(response){
                    response = JSON.parse(response);
                    var oModel = new sap.ui.model.json.JSONModel(response.data);
                    that.getView().setModel(oModel, "publicholiday");
                }) 
            }
        });
    });
