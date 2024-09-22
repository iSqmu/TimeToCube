import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import {
	getDatabase,
	ref,
	set,
	get,
	child,
	update,
	remove,
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';

//* Firebase Config
const firebaseConfig = {
	apiKey: 'AIzaSyD_f3a7epjbkpcpuOVLas3ZcCbfswOW4XM',
	authDomain: 'timetocube-956f3.firebaseapp.com',
	databaseURL: 'https://timetocube-956f3-default-rtdb.firebaseio.com/',
	projectId: 'timetocube-956f3',
	storageBucket: 'timetocube-956f3.appspot.com',
	messagingSenderId: '843283813459',
	appId: '1:843283813459:web:3eb0ffa9a3d63d2e8ae2a6',
};

//* Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

const $ = (element) => document.querySelector(element);
const $$ = (element) => document.querySelectorAll(element);
const $time = $('#time');
const $masDos = $('#masDos');
const $dnf = $('#dnf');
const $delete = $('#delete');
const $history = $('.history-times');
const $logout = $('#sidebar #signout');
const cookie = document.cookie;

function deleteTime(tid) {
	recordRef = ref(db, `times/${getCookie('uid')}/t${tid}`);
	update(recordRef, null);
}

export {
	initializeApp,
	getDatabase,
	ref,
	set,
	get,
	child,
	update,
	app,
	db,
	$,
	$$,
	cookie,
};
