"use strict";

let $ = require('jquery'),
	nav_behavior= require('./nav_behavior'),
	user = require('./user'),
	db = require('./db-interaction'),
	dom = require('./dom_builder'),
	content = require('./content'),
	forms = require('./forms'),
	response = require('./response'),
	firebase = require('./fb-config'),
	authUser = require('./authentication');

let bikesNav = document.getElementById('bikes'),
	partsNav = document.getElementById("parts"),
	serviceNav = document.getElementById("service"),
	rescueNav= document.getElementById("rescue"),
	armyNav = document.getElementById("army"),
	fileUpload = document.getElementById('customFile');

//////////Basic Nav//////////
bikesNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.contentToDom(content.bikesForSale);
});

partsNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.contentToDom(content.partsForSale);
});

serviceNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	if (firebase.auth().currentUser === null) {
		dom.contentToDom(content.showServiceSignIn);
	}else {
		db.checkFB(firebase.auth().currentUser);
	}
});

rescueNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.contentToDom(content.showRescue);
});

armyNav.addEventListener("click", (e) => {
	nav_behavior.navSelected(e);
	dom.contentToDom(content.showArmy);
});

//////////Sign In Options//////////
$(document).on('click', '#googLogin', (event) => {
  //Provide means of signing in with Google
  authUser.logInGoogle()
  .then((result) => {
	  let authedUser = result.user;
    //Check uid of current authenticated user against db to see if they exist
		db.checkFB(authedUser);
  });
});

$(document).on('click', '#guestLogin', (event) => {
	console.log("clicked on Guest Signin");
	dom.contentToDom(forms.guestForm);
});

$(document).on('click', '#googLogout', (event) => {
	//Provide means of signing out
	authUser.logOut()
	.then((result) => {
		dom.contentToDom(content.showServiceSignIn);		
	});
  });

//////////Button Behavior//////////
$(document).on("click", "#show_bikes", () => {
	let currentUser = firebase.auth().currentUser;
	db.getBikes(currentUser);
});

$(document).on("click", "#add_bike", () => {
	dom.contentToDom(forms.addBikeForm);
});

$(document).on("click", "#save_bike", () => {
	db.addBike(db.createBike());
});

$(document).on("click", ".delete_bike", (event) => {
	let bikeID = db.getBikeID(event);
	db.deleteBike(bikeID);
	dom.contentToDom(response.bikeRemoved);
});

$(document).on("click", ".edit_bike", (event) => {
	dom.contentToDom(forms.editBikeForm);
	bid = db.getBikeID(event);
});

$(document).on("click", "#save_changes", () => {
	let editBike = db.createEdits();
	db.editBike(bid, editBike)
	.then((result) => {
		return result;
	});
	dom.contentToDom(response.bikeUpdated);
});

$(document).on("click", "#cancel_changes", () => {
	let currentUser = firebase.auth().currentUser;
	db.getBikes(currentUser.uid);
});

$(document).on("click", ".cancel", () => {
	let currentUser = firebase.auth().currentUser;
	db.getBikes(currentUser);
});

var bid;

$(document).on("click", ".service_bike", (event) => {
	bid = db.getBikeID(event);
	db.requestBike(bid)
	.then((result) => {
		dom.showRequestBike(result);
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
		dom.contentToDom(response.requestReceived);
	});
});

$(document).on("click", ".guest_submit_repair", (event) => {
	dom.contentToDom(response.requestReceivedGuest);
});

$(document).on("change", "#customFile", (e) => {
	let file = e.target.files[0];
	var storageRef = firebase.storage().ref('pics/' + file.name);
	storageRef.put(file)
		.then((snap) => {
			console.log("This is the result", snap);
		});
});
