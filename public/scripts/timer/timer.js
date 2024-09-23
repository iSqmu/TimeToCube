import {
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
} from './main.js';
import sweetalert2 from 'https://cdn.jsdelivr.net/npm/sweetalert2/+esm';
import { randomScrambleForEvent } from 'https://cdn.cubing.net/js/cubing/scramble';
import { TwistyAlgViewer } from 'https://cdn.cubing.net/js/cubing/twisty';

const $time = $('#time');
const $masDos = $('#masDos');
const $dnf = $('#dnf');
const $delete = $('#delete');
const $history = $('.history-times');
const $logout = $('#sidebar #signout');
const $scramble = $('.scramble');
const tiempoT = Date.now();
const hoy = new Date(tiempoT);
let timeId = () => {
	return `${Math.floor(Math.random() * i) + Date.now().toString(36)}`;
};
let i = 1;
let uid, control, recordRef, id, t;
let time = null;
let started = false;
let centesimas = 0;
let segundos = 0;
let minutos = 0;
let times = [];
let ns = [];
let best, worst;
let dnf = false;
let masDos = false;
let scramble;
let twistyPlayer = document.querySelector('twisty-player');

$scramble.innerHTML = await randomScrambleForEvent('333');
scramble = $scramble.innerHTML;
twistyPlayer.alg = scramble;

function getCookie(cname) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${cname}=`);
	if (parts.length == 2) return parts.pop().split(';').shift();
}

uid = getCookie('uid');

if (!document.cookie.includes('loged')) {
	window.location.href = '/views/login.html';
}

let deleteTime = (tid) => {
	recordRef = ref(db, `times/${getCookie('uid')}`);
	update(recordRef, {
		[`${tid}`]: null,
	});
};

let tiempos = [];
get(ref(db, 'times/' + uid)).then((snapshot) => {
	if (snapshot.exists()) {
		let registros = snapshot.val();
		for (let registro in registros) {
			tiempos.push({
				time: registros[registro].time,
				id: registros[registro].id,
				dnf: registros[registro].dnf,
				masDos: registros[registro].plusTwo,
			});
			times.push(registros[registro].time);
		}

		times.sort((a, b) => {
			return a - b;
		});

		if (times.length > 4) {
			let suma = 0;
			times.forEach((x) => (suma += parseFloat(x)));
			$('.avg .data').innerHTML = ((suma - best) / times.length).toFixed(2);
		}
		best = times[0];
		worst = times[times.length - 1];

		$('.pb .data').innerHTML = best;
		$('.worst .data').innerHTML = worst;

		for (let x = 0; x < tiempos.length; x++) {
			let dnf = '';
			let masDos = '';
			let n;
			if (tiempos[x].dnf) {
				dnf = 'dnf';
				n = 'DNF';
				times.splice(times.indexOf(tiempos[x].time), 1);
				best = times[0];
				worst = times[times.length - 1];
				$('.pb .data').innerHTML = best;
				$('.worst .data').innerHTML = worst;
			} else {
				n = tiempos[x].time;
			}
			if (tiempos[x].masDos) {
				masDos = 'masDos';
			}

			$history.innerHTML += `
			<div class="time ${dnf} ${masDos}" id="t${tiempos[x].id}" data-time="${
				tiempos[x].time
			}">
			<span class="index">${i++}.</span>
				<span class="number">${n}</span>
				<div id="options">
					<button class="options" id="masDos"><span id="masDos">+2</span></button>
					<button class="options" id="dnf">
					<i class="fa-solid fa-ban" id="dnf"></i>
					</button>
					<button class="options" id="delete" >
					<i class="fa-solid fa-x" id="delete"></i>
					</button>
					</div>
					</div>
					`;
		}
	} else {
		$history.innerHTML = `
		<center>
				<div>
				<h2>No hay registros</h2>
				</div>
				</center>
				`;
	}
});

//* Functions
function inicio() {
	$time.querySelector('#segundos').innerHTML = '0';
	$time.querySelector('#milisegundos').innerHTML = '00';
	control = setInterval(cronometro, 10);
	started = true;
}

async function parar() {
	clearInterval(control);
	started = false;
	time = `${segundos}.${centesimas}`;
	id = timeId();
	times.push(time);

	times.sort((a, b) => {
		return a - b;
	});
	if (i == 1) {
		$history.innerHTML = ``;
	}

	$history.innerHTML += `
			<div class="time " id="t${id}" data-time="${time}">
				<span class="index">${i++}.</span>
				<span class="number">${time}</span>
				<div id="options">
					<button class="options" id="masDos"><span id="masDos">+2</span></button>
					<button class="options" id="dnf">
						<i class="fa-solid fa-ban" id="dnf"></i>
					</button>
					<button class="options delete" id="delete">
					<i class="fa-solid fa-x" id="delete"></i>
					</button>
				</div>
			</div>
		`;

	if (times.length == 1) {
		best = time;
		worst = time;
	}

	if (times.length > 4) {
		let suma = 0;
		times.forEach((x) => (suma += parseFloat(x)));
		$('.avg .data').innerHTML = ((suma - best) / times.length).toFixed(2);
	}

	if (time <= best) {
		$('.pb .data').innerHTML = time;
	}

	if (time >= worst) {
		$('.worst .data').innerHTML = time;
	}

	$('.actual .data').innerHTML = time;
	

	await get(ref(db, 'users/'))
		.then((snapshot) => {
			if (snapshot.exists()) {
				let users = snapshot.val();
				let uids = [];
				for (let user in users) {
					uids.push(users[user].uid);
				}

				if (uids.includes(getCookie('uid'))) {
					recordRef = ref(db, `times/${getCookie('uid')}/t${id}`);
					set(recordRef, {
						id: id,
						time: time,
						date: hoy.toUTCString(),
						dnf: dnf,
						plusTwo: masDos,
						scramble: scramble,
					});
				}
			}
		})
		.catch((error) => {
			console.log(error);
		});
	$scramble.innerHTML = await randomScrambleForEvent('333');
	scramble = $scramble.innerHTML;
	twistyPlayer.alg = scramble;
}

function reiniciar() {
	$time.querySelector('#segundos').innerHTML = '0';
	$time.querySelector('#milisegundos').innerHTML = '00';
	centesimas = 0;
	segundos = 0;
}

function cronometro() {
	if (centesimas < 99) {
		centesimas++;
		if (centesimas < 10) {
			centesimas = '0' + centesimas;
		}
		$time.querySelector('#milisegundos').innerHTML = centesimas;
	}
	if (centesimas == 99) {
		centesimas = 0;
	}
	if (centesimas == 0) {
		segundos++;
		if (segundos < 10) {
			segundos = segundos;
		}
		$time.querySelector('#segundos').innerHTML = segundos;
	}
}

$time.addEventListener('click', (e) => {
	if (!started) {
		reiniciar();
		inicio();
	} else {
		parar();
	}
});

document.addEventListener('keydown', (e) => {
	if (e.key === ' ') {
		if (!started) {
			reiniciar();
			inicio();
		} else {
			parar();
		}
	}
});

$logout.addEventListener('click', (e) => {
	e.preventDefault();
	sweetalert2
		.fire({
			title: 'Estás seguro de cerrar sesión?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'No, volver',
			confirmButtonText: 'Si, cerrar sesión',
		})
		.then((result) => {
			if (result.isConfirmed) {
				document.cookie =
					'loged= ; expires= Thu, 01 Jan 1970 00:00:01 UTC; path=/;';
				window.location.href = '/index.html';
			}
		});
});

$history.addEventListener('click', (e) => {
	switch (e.target.id) {
		case 'delete':
			sweetalert2
				.fire({
					title: 'Estás seguro de eliminar este tiempo?',
					text: 'No podrás recuperarlo!',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					cancelButtonText: 'No, cancelar',
					confirmButtonText: 'Si, borrar',
				})
				.then((result) => {
					if (result.isConfirmed) {
						let tid = e.target.closest('.time').id;
						times.splice(
							times.indexOf(
								e.target.closest('.time').querySelector('.number').innerText,
							),
							1,
						);

						times.sort((a, b) => {
							return a - b;
						});

						if (
							e.target.closest('.time').querySelector('.number').innerText ==
							best
						) {
							best = times[0];
						}

						if (
							e.target.closest('.time').querySelector('.number').innerText ==
							worst
						) {
							worst = times[times.length - 1];
						}

						if ($history.children.length == 1) {
							$('.worst .data').innerHTML = '-';
						}

						$('.pb .data').innerHTML = times[0];
						$('.worst .data').innerHTML = times[times.length - 1];

						deleteTime(tid);

						e.target.closest('.time').remove();

						if ($history.children.length == 0) {
							i = 1;

							$('.pb .data').innerHTML = '-';
							$('.worst .data').innerHTML = '-';

							$history.innerHTML = `
				<center>
						<div>
						<h2>No hay registros</h2>
						</div>
						</center>
						`;
						}

						if ($history.children.length < 5) {
							$('.avg .data').innerHTML = '-';
						} else {
							let suma = 0;
							times.forEach((x) => (suma += parseFloat(x)));
							$('.avg .data').innerHTML = (
								(suma - best) /
								times.length
							).toFixed(2);
						}
					}
				});

			break;
		case 'masDos':
			let id = e.target.closest('.time').id;
			recordRef = ref(db, `times/${getCookie('uid')}/${id}`);
			let newTime;

			let tFloat = parseFloat(
				e.target.closest('.time').querySelector('.number').innerHTML,
			);

			if (!e.target.closest('.time').classList.contains('masDos')) {
				masDos = true;
				e.target.closest('.time').classList.add('masDos');
				if (e.target.closest('.time').classList.contains('dnf')) {
					return;
				}

				newTime = (tFloat + 2).toFixed(2);
				times.splice(
					times.indexOf(
						e.target.closest('.time').querySelector('.number').innerHTML,
					),
					1,
					newTime,
				);

				times.sort((a, b) => {
					return a - b;
				});

				update(recordRef, {
					time: newTime,
					plusTwo: masDos,
				});

				$('.pb .data').innerHTML = times[0];
				$('.worst .data').innerHTML = times[times.length - 1];

				e.target.closest('.time').dataset.time = newTime;
				e.target.closest('.time').querySelector('.number').style.color =
					'#fc7200';
				e.target.closest('.time').querySelector('.number').style.textShadow =
					'0 0 3px #fc7200';
				e.target.style.color = '#fc7200';
				e.target.style.textShadow = '0 0 3px #fc7200';

				if (
					$('.actual .data').innerText ==
					e.target.closest('.time').querySelector('.number').innerHTML
				) {
					$('.actual .data').innerText = (tFloat + 2).toFixed(2);
				}

				e.target.closest('.time').classList.add('masDos');
				e.target.closest('.time').querySelector('.number').innerHTML = (
					tFloat + 2
				).toFixed(2);

				if (e.target.closest('.time').classList.contains('dnf')) {
					e.target.closest('.time').querySelector('.number').innerHTML = 'DNF';

					$('.pb .data').innerHTML = times[0];
					$('.worst .data').innerHTML = times[times.length - 1];
					return;
				}
			} else {
				masDos = false;
				newTime = (tFloat - 2).toFixed(2);
				times.splice(
					times.indexOf(
						e.target.closest('.time').querySelector('.number').innerHTML,
					),
					1,
					newTime,
				);
				times.sort((a, b) => {
					return a - b;
				});

				e.target.closest('.time').classList.remove('masDos');

				update(recordRef, {
					time: newTime,
					plusTwo: masDos,
				});

				$('.pb .data').innerHTML = times[0];
				$('.worst .data').innerHTML = times[times.length - 1];
				e.target.closest('.time').dataset.time = newTime;

				if (
					$('.actual .data').innerText ==
					e.target.closest('.time').querySelector('.number').innerHTML
				) {
					$('.actual .data').innerText = (tFloat - 2).toFixed(2);
				}

				e.target.closest('.time').classList.remove('masDos');
				e.target.closest('.time').querySelector('.number').innerHTML = (
					tFloat - 2
				).toFixed(2);

				e.target.closest('.time').querySelector('.number').style.color = '#eee';
				e.target.closest('.time').querySelector('.number').style.textShadow =
					'none';
				e.target.style.color = '#eee';
				e.target.style.textShadow = 'none';
			}
			break;
		case 'dnf':
			if (!e.target.closest('.time').classList.contains('dnf')) {
				dnf = true;
				if (e.target.closest('.time').classList.contains('masDos')) {
					return;
				}
				e.target.closest('.time').classList.add('dnf');

				times.splice(
					times.indexOf(
						e.target.closest('.time').querySelector('.number').innerHTML,
					),
					1,
				);

				update(
					ref(db, `times/${getCookie('uid')}/${e.target.closest('.time').id}`),
					{
						dnf: dnf,
					},
				);

				$('.pb .data').innerHTML = times[0];
				$('.worst .data').innerHTML = times[times.length - 1];

				e.target.closest('.time').querySelector('.number').innerHTML = 'DNF';
				e.target.closest('.time').querySelector('.number').style.color =
					'#fc1700';
				e.target.closest('.time').querySelector('.number').style.textShadow =
					'0 0 3px #fc1700';
				e.target.style.color = '#fc1700';
				e.target.style.textShadow = '0 0 3px #fc1700';

				if ($history.children.length == 1) {
					$('.pb .data').innerHTML = '-';
					$('.worst .data').innerHTML = '-';
				}
			} else {
				dnf = false;
				times.push(e.target.closest('.time').dataset.time);
				times.sort((a, b) => {
					return a - b;
				});

				update(
					ref(db, `times/${getCookie('uid')}/${e.target.closest('.time').id}`),
					{
						dnf: dnf,
					},
				);

				$('.pb .data').innerHTML = times[0];
				$('.worst .data').innerHTML = times[times.length - 1];

				e.target.closest('.time').classList.remove('dnf');
				e.target.closest('.time').querySelector('.number').innerHTML =
					e.target.closest('.time').dataset.time;

				e.target.closest('.time').querySelector('.number').style.color = '#eee';
				e.target.closest('.time').querySelector('.number').style.textShadow =
					'none';
				e.target.style.color = '#eee';
				e.target.style.textShadow = 'none';
			}
			break;
	}
});
