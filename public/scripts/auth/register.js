import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import {
	getDatabase,
	ref,
	set,
	get,
	child,
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';

//* Global Variables
const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);
const cookies = document.cookie;
let $error = $('.error');
let $email = $('#email');
let $username = $('#username');
let $password = $('#password');
let $password2 = $('#password2');
let $submit = $('#submit');

//? Verify if the user is already loged
if (cookies.includes('Loged')) {
	window.location.href = 'timer/main.html';
}

//* Create uid function and exists variable
let uid = function () {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
let id = uid();
let exists = false;

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

//? Create Account
$submit.addEventListener('click', (e) => {
	e.preventDefault();
	console.log('CLick!');

	//? Validate passwords confirmation
	if ($password.value !== $password2.value) {
		$error.innerHTML = 'Las contraseñas no coinciden';
		$password.style.boxShadow = '0 0 10px red';
		$password2.style.boxShadow = '0 0 10px red';

		$password.addEventListener('focus', () => {
			$password.style.boxShadow = '';
		});
		$password2.addEventListener('focus', () => {
			$password2.style.boxShadow = '';
		});

		return;
	}

	//? Validate fields aren't empty
	if (
		$email.value.length == 0 &&
		$username.value.length == 0 &&
		$password.value.length == 0 &&
		$password2.value.length == 0
	) {
		$error.innerHTML = 'Debes rellenar todos los campos';
		return;
	} else if ($email.value.length == 0) {
		$error.innerHTML = 'Debes introducir un correo';
		$email.style.boxShadow = '0 0 10px red';

		$email.addEventListener('focus', () => {
			$email.style.boxShadow = '';
		});
		return;
	} else if ($username.value.length == 0) {
		$error.innerHTML = 'Debes introducir un nombre de usuario';
		$username.style.boxShadow = '0 0 10px red';

		$username.addEventListener('focus', () => {
			$username.style.boxShadow = '';
		});
		return;
	} else if ($password.value.length == 0) {
		$error.innerHTML = 'Debes introducir una contraseña';
		$password.style.boxShadow = '0 0 10px red';

		$password.addEventListener('focus', () => {
			$password.style.boxShadow = '';
		});
		return;
	} else if ($password2.value.length == 0) {
		$error.innerHTML = 'Debes repetir la contraseña';
		$password2.style.boxShadow = '0 0 10px red';

		$password2.addEventListener('focus', () => {
			$password2.style.boxShadow = '';
		});
		return;
	}
	if ($password.value.length < 6) {
		$error.innerHTML = 'La contraseña debe tener al menos 6 caracteres';
		$password.style.boxShadow = '0 0 10px red';
		$password.addEventListener('focus', () => {
			$password.style.boxShadow = '';
		});
		return;
	}

	//? Check if email already exists
	get(ref(db, 'users/')).then((snapshot) => {
		if (snapshot.exists()) {
			let usersMail = [];
			let users = snapshot.val();
			for (let user in users) {
				usersMail.push(users[user].email);
			}
			if (usersMail.includes($email.value)) {
				$error.innerHTML = 'El correo ya se encuentra registrado';
				$email.style.boxShadow = '0 0 10px red';
				$email.addEventListener('focus', () => {
					$email.style.boxShadow = '';
				});
			} else {
				//? Create account if email doesn't exist
				set(ref(db, 'users/' + id), {
					uid: id,
					email: $email.value,
					username: $username.value,
					password: $password.value,
				})
					.then(() => {
						$error.style.color = 'green';
						$error.innerHTML = 'Te has registrado correctamente';
						console.log(
							'Se ha registrado correctamente',
							'https://timetocube-956f3-default-rtdb.firebaseio.com/\n id: ' +
								id,
						);
						setTimeout(() => {
							window.location.href = 'login.html';
						}, 5000);
					})
					.catch($error, () => {
						$error.style.color = 'red';
						$error.innerHTML = 'Error al registrar usuario';
					});
			}
		} else {
			console.log('No data available');
			//? If doesn't exists any data, create.
			set(ref(db, 'users/' + id), {
				uid: id,
				email: $email.value,
				username: $username.value,
				password: $password.value,
			})
				.then(() => {
					$error.style.color = 'green';
					$error.innerHTML = 'Te has registrado correctamente';
					console.log(
						'Se ha registrado correctamente',
						'https://timetocube-956f3-default-rtdb.firebaseio.com/\n id: ' + id,
					);
					setTimeout(() => {
						window.location.href = 'login.html';
					}, 5000);
				})
				.catch($error, () => {
					$error.style.color = 'red';
					$error.innerHTML = 'Error al registrar usuario';
				});
		}
	});
});
