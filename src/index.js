import ImageApiService from './js/ImageApiService';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const FAILURE_MESSAGE =
  'Sorry, there are no images matching your search query. Please try again.';

const imageApiService = new ImageApiService();

refs.searchForm.addEventListener('submit', onSearchBtnClick);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

new SimpleLightbox('.gallery a');

function onSearchBtnClick(e) {
  e.preventDefault();
  imageApiService.query = e.target.elements.searchQuery.value.trim();
  imageApiService.resetPageCounter();
  if (imageApiService.query === '') {
    Notify.info('Search input is empty');
    return;
  } else {
    clearGallery();
    searchImages();
  }
}

function onLoadMoreBtnClick() {
  imageApiService.fetchImages().then(r => onLoadMore(r));
}

function searchImages() {
  imageApiService.fetchImages().then(r => onSearch(r));
}

function onSearch(r) {
  refs.loadMoreBtn.classList.add('visually-hidden');
  Notify.info(`Hooray! We found ${r.data.totalHits} images.`);
  imageApiService.resetHits();
  const images = r.data.hits;
  console.log(r.data.totalHits === images.length);
  imageApiService.addHits(images);
  if (images.length === 0) {
    Notify.failure(FAILURE_MESSAGE);
  } else {
    const markup = images.map(img => createImageMarkup(img)).join('');
    updateGallery(markup);
    if (images.length !== r.data.totalHits) {
      refs.loadMoreBtn.classList.remove('visually-hidden');
    }
  }
}

function onLoadMore(r) {
  const images = r.data.hits;
  const totalHits = imageApiService.totalHits;
  imageApiService.addHits(images);
  const filteredHits = imageApiService.filterHits(totalHits);
  const markup = images.map(img => createImageMarkup(img)).join('');
  updateGallery(markup);

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });

  if (filteredHits.length === r.data.totalHits) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMoreBtn.classList.add('visually-hidden');
  }
}

function createImageMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card">
  <a href="${largeImageURL}" class="gallery__link"><img class ="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`;
}

function updateGallery(markup) {
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}
