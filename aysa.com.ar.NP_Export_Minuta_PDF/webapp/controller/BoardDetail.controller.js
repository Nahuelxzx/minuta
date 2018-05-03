/* global Trello:true */
/* global jsPDF:true */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";
	var oCardsTable;
	var boardId;
	var succ;
	var oModelCards;
	var lists;
	var boardName;
	return Controller.extend("aysa.com.ar.controller.BoardDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf aysa.com.ar.view.BoardDetail
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detail").attachMatched(function(oEvent) {
				var oData = sap.ui.getCore().getModel("modelBoard").getData();
				oCardsTable = this.getView().byId(this.createId("cardsTable"));
				oCardsTable.setBusy(true);
				boardId = oData.id;
				boardName = oData.name;
				this.getView().byId(this.createId("detailPage")).setTitle(oData.name);
				this._selectItemWithId(boardId);
			}, this);
		},
		_selectItemWithId: function(id) {
			var successGetLists = function(successLists) {
				
				var successGetCards = function(successCards) {
					
					successCards.forEach(function(currentVal) {
						
						var str = currentVal.desc.split("---");
						currentVal.desc = str[0];
						if (currentVal.labels.length > 0) {
							currentVal.shortLink = currentVal.labels[0].name;
						} else {
							currentVal.shortLink = "";
						}
						lists.forEach(function(valList) {
							if (valList.id === currentVal.idList) {
								currentVal.idList = valList.name;
							}
						});
					});
					succ = successCards;
					oModelCards = new sap.ui.model.json.JSONModel(successCards);
					oCardsTable.setModel(oModelCards);
					oCardsTable.setBusy(false);
				};
				var errorGetCards = function(errorCards) {};
				lists = successLists;
				Trello.get("/boards/" + id + "/cards", successGetCards, errorGetCards);
				//https://api.trello.com/1/boards/{boardId}/cards
			};
			var errorGetLists = function(errorLists) {};
			Trello.get("/boards/" + id + "/lists", successGetLists, errorGetLists);
			/*
			var errorGetComments = function(){};
			Trello.get("/");*/
			console.log(lists);
		},

		navButtonPress: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", true);
			}
		},
		onDataExportPDF: function(oEvent) {
				var doc = new jsPDF();
				var y = 20;
				var pageHeight = doc.internal.pageSize.height;
				var data = [];
				var columns = [boardName];

				//for (var i = 0; i < succ.length; i++) {
				for (var i = (succ.length-1); i >= 0; i--) {
					var lines = doc.splitTextToSize(succ[i].name, 260);
					var stringA = "";
					for (var e = 0; e < lines.length; e++) {
						stringA = stringA + lines[e] + "\n";
					}
					data.push([stringA]);
					data.push(["Estado: " + succ[i].idList]);
					data.push(["Etiqueta: " + succ[i].shortLink]);
					var linesDesc = doc.splitTextToSize(succ[i].desc, 260);
					var stringDesc = "";
					for (var h = 0; h < linesDesc.length; h++) {
						stringDesc = stringDesc + linesDesc[h] + "\n";
					}
					data.push([stringDesc]);
					data.push([
						"--------------------------------------------------------------------------------------------------------------------------------------------------------"
					]);

					if (y >= pageHeight) {
						doc.addPage();
						y = 20;
					}
				}
				doc.autoTable(columns, data);

				doc.save("export_tareas.pdf");
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf aysa.com.ar.view.BoardDetail
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf aysa.com.ar.view.BoardDetail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf aysa.com.ar.view.BoardDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});