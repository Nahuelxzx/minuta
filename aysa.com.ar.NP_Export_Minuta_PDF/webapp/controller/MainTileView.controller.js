/* global Trello:true */
/* global jsPDF:true */

sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	
	var oBoardsTable;
	var oModelBoards;
	var succ;
	var success;	
	var error;

	return Controller.extend("aysa.com.ar.controller.MainTileView", {
		
		
		onInit: function() {
			
		oBoardsTable = sap.ui.getCore().byId(this.createId("boardsTable"));
						
		var oRouter = this.getOwnerComponent().getRouter();

		oRouter.getRoute("mainTile").attachPatternMatched(this._onObjectMatched, this);

		success = function(successMsg) {
			succ = successMsg;
			oBoardsTable.setBusy(true);
			oModelBoards = new sap.ui.model.json.JSONModel(successMsg);
			oBoardsTable.setModel(oModelBoards);
			oBoardsTable.setBusy(false);
		};
	
		error = function(errorMsg){
		
		}; 

		var authenticationSuccess = function() {
				Trello.get('/member/me/boards', success, error);
		};

		var authenticationFailure = function() {
		};

		Trello.authorize({
				type: "redirect",
				name: "Nuevos Proyectos - Exportacion Minuta",
				key: "9abc83d148d0f7116b7d449b39c82b75",
				scope: {
					read: true,
					write: false
				},
				response_type: "token",
				expiration: "never",
				success: authenticationSuccess,
				error: authenticationFailure
			});	
		},
		
		_onObjectMatched: function(oEvent) {
			if(oBoardsTable !== null){
				Trello.get('/member/me/boards', success, error);
			}
		},
		
		onPressItem: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem");
			var oItemObject = oSelectedItem.getBindingContext().getObject();
			var oData = {
				id: oItemObject.id,
				name: oItemObject.name
			};
			var oModel = new sap.ui.model.json.JSONModel(oData);
			sap.ui.getCore().setModel(oModel, "modelBoard");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail");	
		},
		
		onDataExportPDF:function(oEvent){
			    var columns = ["Nombre de Tablero"];  
            	var doc = new jsPDF();  
                var data = [];  
            	for(var i=0;i<succ.length;i++)   
                    {  
                        data[i]=[succ[i].name];  
                    }  
            	doc.autoTable(columns, data);  
                doc.save("export_tableros.pdf"); 
        	}

	});
});