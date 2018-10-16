"use strict";

// console.log("Hello main.js");

let $ = require("jquery"),
	nav_behavior= require("./nav_behavior"),
	user = require("./user"),
	db = require("./db-interaction"),
	sb = require("./show_bikes"),
	dom = require("./dom_builder"),
	forms = require("./bike_forms"),
	response = require("./response"),
	firebase = require("./fb-config");

let main_area = document.getElementById("main_content"),
	nav = document.getElementById("nav__list"),
	bikesNav = document.getElementById("bikes"),
	partsNav = document.getElementById("parts"),
	serviceNav = document.getElementById("service"),
	rescueNav= document.getElementById("rescue"),
	armyNav = document.getElementById("army"),
	fileUpload = document.getElementById('customFile');


// navItems.addEventListener("click", (e) => {
//   nav_behavior.navSelected(e);
// });

bikesNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.content.showBikes();
});

partsNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.content.showParts();
});

serviceNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.content.showService();
});

rescueNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.content.showRescue();
});

armyNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.content.showArmy();
});

var bid;

$(document).on("click", "#show_bikes", () => {
	let currentUser = firebase.auth().currentUser.uid;
	db.getBikes(currentUser);
});

$(document).on("click", "#add_bike", () => {
	forms.showBikeForm();
});

$(document).on("click", "#save_bike", () => {
	db.addBike(db.createBike());
});

$(document).on("click", "#save_changes", () => {
	let editBike = db.createEdits();
	db.editBike(bid, editBike)
	.then((result) => {
		return result;
	});
	response.bikeUpdated();
});

$(document).on("click", "#cancel_changes", () => {
	let currentUser = user.getCompleteUser().uid;
	db.getBikes(currentUser)
	.then((data) => {
		sb.showMyBikes(data);
	});
});

$(document).on("click", ".cancel", () => {
	let currentUser = user.getCompleteUser().uid;
	db.getBikes(currentUser)
	.then((data) => {
		sb.showMyBikes(data);
	});
});

$(document).on("click", ".delete_bike", (event) => {
	let bikeID = db.getBikeID(event);
	db.deleteBike(bikeID);
	response.bikeRemoved();
});

$(document).on("click", ".edit_bike", (event) => {
	forms.showEditBikeForm();
	bid = db.getBikeID(event);
});

$(document).on("click", ".service_bike", (event) => {
	bid = db.getBikeID(event);
	db.requestBike(bid)
	.then((result) => {
		sb.showRequestBike(result);
		forms.requestServiceForm();
	});
});

$(document).on("click", ".submit_repair", (event) => {
	let updatedUser = db.createUpdatedUser();
	db.updateUser(user.getCompleteUser().fbID, updatedUser)
	.then((result) => {
		return result;
	});
	db.addRepair(db.createRepair(bid))
	.then((result) => {
		db.addRepairId(result);
		response.requestReceived();
	});
});

$(document).on("click", ".guest_submit_repair", (event) => {
	response.requestReceivedGuest();
});
