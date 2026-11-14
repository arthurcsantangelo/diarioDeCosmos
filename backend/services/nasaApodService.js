const APOD_ENDPOINT = 'https://api.nasa.gov/planetary/apod';
const APOD_PAGE_ENDPOINT = 'https://science.nasa.gov/apod/';
const VIDEO_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com'
]);
const RECENT_DAYS = 7;

class NasaApiError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = 'NasaApiError';
    this.statusCode = statusCode;
  }
}

function validateMediaUrl(value, mediaType) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new NasaApiError('A NASA retornou um endereço de mídia inválido.');
  }

  if (url.protocol !== 'https:') {
    throw new NasaApiError('A NASA retornou um endereço de mídia não seguro.');
  }

  if (mediaType === 'video' && !VIDEO_HOSTS.has(url.hostname)) {
    throw new NasaApiError('O provedor deste vídeo não é compatível.');
  }

  return url.href;
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function getMetaContent(html, property) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of tags) {
    const propertyMatch = tag.match(/\bproperty\s*=\s*(["'])(.*?)\1/i);

    if (propertyMatch && propertyMatch[2] === property) {
      const contentMatch = tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i);
      return contentMatch ? decodeHtmlEntities(contentMatch[2]) : null;
    }
  }

  return null;
}

async function getOfficialApodMetadata(date) {
  const pageUrl = new URL(APOD_PAGE_ENDPOINT);
  pageUrl.searchParams.set('date', date);

  let response;

  try {
    response = await fetch(pageUrl, { signal: AbortSignal.timeout(15000) });
  } catch {
    throw new NasaApiError('Não foi possível carregar a página oficial da foto da NASA.', 502);
  }

  if (!response.ok) {
    throw new NasaApiError('A página oficial da foto da NASA não está disponível.', 502);
  }

  let html;

  try {
    html = await response.text();
  } catch {
    throw new NasaApiError('A página oficial da NASA retornou um conteúdo inválido.');
  }

  const imageUrl = getMetaContent(html, 'og:image');
  const pageTitle = getMetaContent(html, 'og:title');

  if (!imageUrl) {
    throw new NasaApiError('A página oficial da NASA não informou a foto do dia.');
  }

  const validatedImageUrl = validateMediaUrl(imageUrl, 'image');
  const imageHost = new URL(validatedImageUrl).hostname;

  if (imageHost !== 'nasa.gov' && !imageHost.endsWith('.nasa.gov')) {
    throw new NasaApiError('A página oficial da NASA retornou uma origem de imagem inválida.');
  }

  const title = pageTitle
    ? pageTitle
      .replace(/^APOD:\s*\d{4}\s+[A-Za-z]+\s+\d{1,2}\s*[\u2013\u2014-]\s*/i, '')
      .replace(/\s*-\s*NASA Science\s*$/i, '')
      .trim()
    : null;

  return { imageUrl: validatedImageUrl, title };
}

async function requestApod(parameters = {}) {
  const apiKey = process.env.NASA_API_KEY;

  if (!apiKey || apiKey === 'sua_chave_da_nasa') {
    throw new NasaApiError('Configure NASA_API_KEY no arquivo .env do backend.', 503);
  }

  const url = new URL(APOD_ENDPOINT);
  url.searchParams.set('api_key', apiKey);

  for (const [name, value] of Object.entries(parameters)) {
    url.searchParams.set(name, value);
  }

  let response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new NasaApiError('A consulta à NASA demorou demais. Tente novamente.', 504);
    }

    throw new NasaApiError('Não foi possível conectar à API da NASA.', 502);
  }

  let apod;

  try {
    apod = await response.json();
  } catch {
    throw new NasaApiError('A API da NASA retornou uma resposta inválida.');
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new NasaApiError('Limite de consultas à NASA atingido. Tente novamente mais tarde.', 429);
    }

    if (response.status === 403) {
      throw new NasaApiError('A NASA recusou a chave configurada. Confira NASA_API_KEY.', 502);
    }

    throw new NasaApiError('Não foi possível obter a imagem astronômica para essa data.', 502);
  }

  return apod;
}

async function normalizeApod(apod) {
  if (!apod || !apod.title || !apod.date || !apod.explanation || !['image', 'video'].includes(apod.media_type)) {
    throw new NasaApiError('A API da NASA retornou dados incompletos.');
  }

  const mediaUrl = validateMediaUrl(apod.url, apod.media_type);
  const metadata = apod.media_type === 'image'
    ? await getOfficialApodMetadata(apod.date)
    : null;

  return {
    title: metadata && metadata.title ? metadata.title : apod.title,
    date: apod.date,
    explanation: apod.explanation,
    media_type: apod.media_type,
    url: metadata ? metadata.imageUrl : mediaUrl,
    thumbnail_url: apod.thumbnail_url ? validateMediaUrl(apod.thumbnail_url, 'image') : null,
    copyright: apod.copyright || null
  };
}

function offsetDate(date, days) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

async function getApod(date) {
  const parameters = { thumbs: 'true' };

  if (date) {
    parameters.date = date;
  }

  return normalizeApod(await requestApod(parameters));
}

async function getRecentApods() {
  const latest = await requestApod({ thumbs: 'true' });

  if (!latest || !latest.date) {
    throw new NasaApiError('A API da NASA não informou a data da foto mais recente.');
  }

  const startDate = offsetDate(latest.date, -(RECENT_DAYS - 1));
  const apods = await requestApod({
    start_date: startDate,
    end_date: latest.date,
    thumbs: 'true'
  });

  if (!Array.isArray(apods)) {
    throw new NasaApiError('A API da NASA retornou uma lista inválida.');
  }

  const normalizedApods = await Promise.all(apods.map(normalizeApod));

  return normalizedApods
    .sort((first, second) => second.date.localeCompare(first.date));
}

module.exports = { getApod, getRecentApods };
