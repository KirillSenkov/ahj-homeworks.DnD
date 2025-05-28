import TrolloLord from './trollo/TrolloLord.js';
import log from './trollo/logger.js';

const module = 'app';
const placeholder = document.getElementById('board-placeholder');

log('START', module);
new TrolloLord(placeholder).init();
log('FINISH', module);
