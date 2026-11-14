'use strict';

const APOD_START_DATE = '1995-06-16';
const dateForm = document.querySelector('#date-form');
const dateInput = document.querySelector('#apod-date');
const todayButton = document.querySelector('#today-button');
const statusMessage = document.querySelector('#status');
const apodContent = document.querySelector('#apod-content');
const apodMedia = document.querySelector('#apod-media');
const apodTitle = document.querySelector('#apod-title');
const apodDate = document.querySelector('#apod-date-label');
const apodCopyright = document.querySelector('#apod-copyright');
const apodExplanation = document.querySelector('#apod-explanation');
const gallerySection = document.querySelector('#gallery-section');
const apodGallery = document.querySelector('#apod-gallery');

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function showStatus(message, state = 'loading') {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
  statusMessage.setAttribute('role', state === 'error' ? 'alert' : 'status');
  statusMessage.hidden = !message;
}

function setFormDisabled(disabled) {
  dateForm.querySelectorAll('button').forEach((button) => {
    button.disabled = disabled;
  });
}

function createMedia(apod) {
  apodMedia.replaceChildren();

  if (apod.media_type === 'image') {
    const image = document.createElement('img');
    image.className = 'apod-image';
    image.alt = apod.title;
    image.src = apod.url;
    image.addEventListener('error', () => {
      showStatus('Não foi possível carregar a imagem. Tente novamente mais tarde.', 'error');
    });
    apodMedia.append(image);
    return;
  }

  const video = document.createElement('iframe');
  video.className = 'apod-video';
  video.src = apod.url;
  video.title = `Vídeo: ${apod.title}`;
  video.loading = 'lazy';
  video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  video.referrerPolicy = 'strict-origin-when-cross-origin';
  video.allowFullscreen = true;
  apodMedia.append(video);
}

function renderApod(apod) {
  dateInput.value = apod.date;
  apodTitle.textContent = apod.title;
  apodDate.dateTime = apod.date;
  apodDate.textContent = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(new Date(`${apod.date}T00:00:00.000Z`));
  apodExplanation.textContent = apod.explanation;
  apodCopyright.textContent = apod.copyright ? `Créditos: ${apod.copyright}` : '';
  apodCopyright.hidden = !apod.copyright;
  createMedia(apod);
  apodContent.hidden = false;
  updateSelectedGalleryCard(apod.date);
}

function updateSelectedGalleryCard(date) {
  apodGallery.querySelectorAll('.gallery-card').forEach((card) => {
    const isSelected = card.dataset.date === date;
    card.classList.toggle('is-selected', isSelected);
    card.setAttribute('aria-pressed', String(isSelected));
  });
}

function createGalleryCard(apod) {
  const card = document.createElement('button');
  card.className = 'gallery-card';
  card.type = 'button';
  card.dataset.date = apod.date;
  card.setAttribute('aria-pressed', 'false');
  card.setAttribute('aria-label', `Ver APOD de ${apod.date}: ${apod.title}`);

  const thumbnail = document.createElement('span');
  thumbnail.className = 'gallery-thumbnail';
  const imageUrl = apod.media_type === 'image' ? apod.url : apod.thumbnail_url;

  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.remove();
      thumbnail.classList.add('media-placeholder');
      thumbnail.textContent = apod.media_type === 'video' ? 'Vídeo APOD' : 'Prévia indisponível';
    });
    thumbnail.append(image);
  } else {
    thumbnail.classList.add('media-placeholder');
    thumbnail.textContent = 'Vídeo APOD';
  }

  if (apod.media_type === 'video') {
    const badge = document.createElement('span');
    badge.className = 'video-badge';
    badge.textContent = 'VÍDEO';
    thumbnail.append(badge);
  }

  const details = document.createElement('span');
  details.className = 'gallery-card-details';
  const date = document.createElement('time');
  date.dateTime = apod.date;
  date.textContent = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  }).format(new Date(`${apod.date}T00:00:00.000Z`));
  const title = document.createElement('strong');
  title.textContent = apod.title;
  details.append(date, title);
  card.append(thumbnail, details);
  card.addEventListener('click', () => renderApod(apod));

  return card;
}

function renderGallery(apods) {
  apodGallery.replaceChildren(...apods.map(createGalleryCard));
  gallerySection.hidden = false;
  updateSelectedGalleryCard(apods[0].date);
}

async function loadApod(date) {
  setFormDisabled(true);
  showStatus('Buscando a imagem do cosmos...', 'loading');

  try {
    const url = date ? `/api/apod?date=${encodeURIComponent(date)}` : '/api/apod';
    const response = await fetch(url);
    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error('O servidor retornou uma resposta inválida.');
    }

    if (!response.ok) {
      throw new Error(result.error || 'Não foi possível carregar a imagem astronômica.');
    }

    renderApod(result);
    showStatus('');
  } catch (error) {
    showStatus(error.message || 'Não foi possível carregar os dados. Tente novamente.', 'error');
  } finally {
    setFormDisabled(false);
  }
}

async function loadRecentApods() {
  setFormDisabled(true);
  showStatus('Buscando as fotos mais recentes...', 'loading');

  try {
    const response = await fetch('/api/apod/recent');
    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error('O servidor retornou uma resposta inválida.');
    }

    if (!response.ok) {
      throw new Error(result.error || 'Não foi possível carregar as fotos do APOD.');
    }

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('A NASA não retornou fotos para os últimos dias.');
    }

    renderGallery(result);
    renderApod(result[0]);
    showStatus('');
  } catch (error) {
    showStatus(error.message || 'Não foi possível carregar os dados. Tente novamente.', 'error');
  } finally {
    setFormDisabled(false);
  }
}

dateInput.min = APOD_START_DATE;
dateInput.max = getToday();
dateInput.value = getToday();

dateForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (dateInput.reportValidity()) {
    loadApod(dateInput.value);
  }
});

todayButton.addEventListener('click', () => {
  dateInput.value = getToday();
  loadApod();
});

loadRecentApods();
