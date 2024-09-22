import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import {
	getDatabase,
	ref,
	set,
	get,
	child,
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

//* Global Variables
const $ = (element) => document.querySelector(element);
const $$ = (element) => document.querySelectorAll(element);
const cookies = document.cookie;
const $error = $('.error');
const $email = $('#email');
const $password = $('#password');
const $submit = $('#submit');

//? Verify if the user is already loged
if (cookies.includes('loged')) {
	window.location.href = 'timer/timer.html';
}

function setCookie(cookieName, value) {
	document.cookie = `${cookieName}=${value}; path=/;`;
}

//? Login catch event click
$submit.addEventListener('click', (e) => {
	e.preventDefault();
	//? Getting data from firebase realtime database
	get(ref(db, 'users/'))
		.then(async (snapshot) => {
			if (snapshot.exists()) {
				let users = await snapshot.val();
				for (let user in users) {
					if (
						users[user].email == $email.value &&
						users[user].password == $password.value
					) {
						$error.innerHTML = 'Has iniciado sesión';
						$error.style.color = 'green';
						setCookie('loged', true);
						setCookie('uid', users[user].uid);

						console.log(cookies);

						setTimeout(() => {
							window.location.href = 'timer/timer.html';
						}, 2000);
						return;
					} else {
						$error.innerHTML = 'Email o contraseña incorrecta.';
						$error.style.color = 'red';
						$email.style.boxShadow = '0 0 10px red';
						$password.style.boxShadow = '0 0 10px red';
						$email.addEventListener('focus', () => {
							$email.style.boxShadow = '';
						});
						$password.addEventListener('focus', () => {
							$password.style.boxShadow = '';
						});
					}
				}
			} else {
				console.log('No data available');
			}
		})
		.catch((error) => {
			console.error(error);
		});
});
