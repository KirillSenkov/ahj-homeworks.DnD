import './trollo.css';
import { nanoid } from 'nanoid';
import log from './logger.js';
import { loadBoard, saveBoard, resetBoard } from './storage.js';

const module = 'TrolloLord';

export default class TrolloLord {
	constructor(container) {
		this.container = container;
		this.state = loadBoard() || this._getInitialState();
	}

	init() {
		this._renderBoard();
	}

	_getInitialState() {
		return {
			columns: [
				{ id: 'todo', title: 'TODO', cards: [] },
				{ id: 'in-progress', title: 'IN PROGRESS', cards: [] },
				{ id: 'done', title: 'DONE', cards: [] },
			],
		};
	}

	_renderBoard() {
		const boardEl = document.createElement('div');
		boardEl.className = 'board';

		this.state.columns.forEach((col) => {
			const colEl = document.createElement('div');
			colEl.className = 'column';
			colEl.dataset.columnId = col.id;

			const header = document.createElement('h2');
			header.textContent = col.title;
			colEl.append(header);

			const list = document.createElement('div');
			list.className = 'column__list';
			col.cards.forEach((card) => {
				const cardEl = this._createCardElement(card);
				list.append(cardEl);
			});
			colEl.append(list);

			const addBtn = document.createElement('button');
			addBtn.className = 'column__add';
			addBtn.textContent = '+ Add another card';
			addBtn.dataset.columnId = col.id;
			colEl.append(addBtn);

			boardEl.append(colEl);
		});

		this.container.replaceWith(boardEl);
		this.container = boardEl;
		this._bindEvents();
	}

	_createCardElement({ id, text }) {
		const card = document.createElement('div');
		card.className = 'card';
		card.draggable = true;
		card.dataset.cardId = id;
		card.textContent = text;

		const removeBtn = document.createElement('button');
		removeBtn.className = 'card__remove';
		removeBtn.textContent = '×';
		removeBtn.title = 'Удалить карточку';
		card.append(removeBtn);

		card.addEventListener('mouseenter', () => {
			removeBtn.classList.add('visible');
		});
		card.addEventListener('mouseleave', () => {
			removeBtn.classList.remove('visible');
		});

		return card;
	}

	_bindEvents() {
		this.container.addEventListener('click', (e) => {
			log(`click: e.target=${e.target.tagName}`, module);
			const addBtn = e.target.closest('.column__add');
			if (addBtn) {
				const colId = addBtn.dataset.columnId;
				const text = prompt('Текст новой карточки:');
				if (text) this.addCard(colId, text);
				return;
			}

			const removeBtn = e.target.closest('.card__remove');
			if (removeBtn) {
				log(`remove: cardId=${removeBtn.closest('.card').dataset.cardId}`, module);
				this.removeCard(removeBtn.closest('.card').dataset.cardId);
			}
		});

		this._bindDragAndDrop();
	}

	_bindDragAndDrop() {
		let draggedId = null;
		let draggedCard;
		let placeholder;

		this.container.addEventListener('dragstart', (e) => {
			if (!(e.target instanceof HTMLElement)) return;

			const card = e.target.closest('.card');

			if (!card) return;

			draggedId = card.dataset.cardId;
			draggedCard = card;

			card.classList.add('dragging');
			document.body.style.cursor = 'grabbing';

			setTimeout(() => { card.style.visibility = 'hidden'; }, 0);
		});

		this.container.addEventListener('dragend', (e) => {
			if (!(e.target instanceof HTMLElement)) return;

			if (draggedCard) {
				draggedCard.classList.remove('dragging');
				draggedCard.style.visibility = '';
			}
			if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
			document.body.style.cursor = '';

			draggedId = null;
		});

		this.container.addEventListener('dragover', (e) => {
			e.preventDefault();
			if (!(e.target instanceof HTMLElement)) return;

			const list = e.target.closest('.column__list');
			if (!list) return;

			// this._clearListsHighlight();

			if (!placeholder) {
				placeholder = document.createElement('div');
				placeholder.className = 'placeholder';
				const { width, height } = draggedCard.getBoundingClientRect();
				placeholder.style.width = `${width}px`;
				placeholder.style.height = `${height}px`;
				placeholder.style.visibility = 'hidden';
			}

			list.querySelectorAll('.placeholder').forEach((el) => el.remove());

			const cards = Array.from(list.querySelectorAll('.card:not(.dragging)'));

			if (cards.length === 0) {
				list.appendChild(placeholder);
			} else {
				let nearest = null;
				let closest = Infinity;
				cards.forEach((card) => {
					const { top, height } = card.getBoundingClientRect();
					const centerY = top + height / 2;
					const dist = Math.abs(e.clientY - centerY);
					if (dist < closest) {
						closest = dist;
						nearest = card;
					}
				});
				const { top, height } = nearest.getBoundingClientRect();

				if (e.clientY < top + height / 2) {
					list.insertBefore(placeholder, nearest);
				} else {
					list.insertBefore(placeholder, nearest.nextSibling);
				}
			}
			document.body.style.cursor = 'grabbing';
		});

		this.container.addEventListener('drop', (e) => {
			e.preventDefault();
			if (!placeholder || !draggedId) return;

			const movedCard = this._extractCardById(draggedId);
			placeholder.parentNode.insertBefore(movedCard, placeholder);
			placeholder.remove();

			this._rebuildStateFromDOM();
			saveBoard(this.state);
			this._renderBoard();
			document.body.style.cursor = '';
			draggedId = null;
		});
	}

	_extractCardById(cardId) {
		const cardEl = this.container.querySelector(`.card[data-card-id="${cardId}"]`);
		return cardEl && cardEl.parentNode.removeChild(cardEl);
	}

	_rebuildStateFromDOM() {
		this.state.columns = Array.from(
			this.container.querySelectorAll('.column'),
		).map((colEl) => ({
			id: colEl.dataset.columnId,
			title: colEl.querySelector('h2').textContent,
			cards: Array.from(colEl.querySelectorAll('.card')).map((cardEl) => ({
				id: cardEl.dataset.cardId,
				text: cardEl.textContent.replace('×', '').trim(),
			})),
		}));
	}

	addCard(columnId, text) {
		const col = this.state.columns.find((c) => c.id === columnId);
		col.cards.push({ id: nanoid(), text });
		saveBoard(this.state);
		this._renderBoard();
	}

	removeCard(cardId) {
		this.state.columns.forEach((col) => {
			const idx = col.cards.findIndex((c) => c.id === cardId);
			if (idx !== -1) {
				col.cards.splice(idx, 1);
			}
		});
		saveBoard(this.state);
		this._renderBoard();
	}
}
