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
import { randomScrambleForEvent } from 'https://cdn.cubing.net/js/cubing/scramble';
import { TwistyAlgViewer } from 'https://cdn.cubing.net/js/cubing/twisty';

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
let $content = $('.content');
let $prevTime = $('.prev-time');
let $prevTitle = $('.prev-time h1');
let $prevScramble = $('.prev-time .prev-scramble');
let $prevDate = $('.prev-time .prev-date');
let $prevPenal = $('.prev-time .prev-penal');
let $prev3D = $('.prev-time .prev-3D');

function getCookie(cname) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${cname}=`);
	if (parts.length == 2) return parts.pop().split(';').shift();
}

let times = [];
get(ref(db, `times/${getCookie('uid')}`)).then((snapshot) => {
	if (snapshot.exists()) {
		let regs = snapshot.val();
		let regList = [];
		for (let reg in regs) {
			regList.push(reg);

			let dnf,
				masDos = '';

			if (!regs[reg].dnf) {
				dnf = 'penalization-disabled';
			}

			if (!regs[reg].plusTwo) {
				masDos = 'penalization-disabled';
			}

			times.push(regs[reg].id, [
				regs[reg].time,
				regs[reg].scramble,
				'masDos',
				'DNF',
				regs[reg].id,
				regs[reg].date,
			]);

			let div = `
				<div class="time" id="t${regs[reg].id}" data-date="">
			<h2 class="tTitle">${regs[reg].time}</h2>
			<p class="scramble">
				${regs[reg].scramble}
			</p>
			<twisty-player
				visualization="2D"
				background="none"
				control-panel="none"
				alg="${regs[reg].scramble}"
			></twisty-player>
			<div class="penalizations">
				<p class="${dnf} dnf " >DNF</p>
				<p class="${masDos} masDos ">+2</p>
			</div>
		</div>
			`;
			$content.innerHTML += div;
		}

		$content.addEventListener('click', (e) => {
			let timeId = e.target.closest('.time').id;
			let formatedDate = regs[timeId].date.split('-').reverse().join('/');
			let penal;
			let penalStyle;

			if (regs[timeId].dnf) {
				penal = 'DNF';
				penalStyle = 'dnf';
			} else if (regs[timeId].plusTwo) {
				penal = '+2';
				penalStyle = 'masDos';
			} else {
				penal = 'None';
			}

			$prevTime.innerHTML = `
				<h1>${regs[timeId].time}</h1>
			<p>
				<b>scramble:</b>
				<span class="previ prev-scramble"
					>${regs[timeId].scramble}</span
				>
			</p>
			<p>
				<b>date:</b>
				<span class="previ prev-date">${formatedDate}</span>
			</p>
			<p>
				<b>penalization: </b>
				<span class="previ prev-penal ${penalStyle}">${penal}</span>
			</p>
			<twisty-player
				visualization="3D"
				background="none"
				control-panel="none"
				class="prev-3D"
				alg="${regs[timeId].scramble}"
			></twisty-player>
			<button class="close" onClick="closePrev()">Cerrar</button>
			`;
			$prevTime.classList.add('shown');
		});
	} else {
		$content.innerHTML = `<h1 style="font-size: 30px; translate: 120% -30px">No hay registros</h1>`;
	}
});

document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		$prevTime.classList.remove('shown');
	}
});
