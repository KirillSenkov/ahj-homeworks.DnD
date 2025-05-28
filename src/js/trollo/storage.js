import log from './logger.js';

const module = 'storage';
const STORAGE_KEY = 'trollo-board';

export function loadBoard() {
	const raw = localStorage.getItem(STORAGE_KEY);
	log(`loadBoard(): ${raw}`, module);
	return raw ? JSON.parse(raw) : null;
}

export function saveBoard(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	log(`saveBoard(${state})`, module);
}

export function resetBoard() {
	localStorage.setItem(STORAGE_KEY, null);
	log('resetBoard()', module);
}
