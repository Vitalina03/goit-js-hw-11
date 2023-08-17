import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchPhoto } from './pixaby-api';
import { lightbox } from './lightbox';



const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more'),
};

const { searchForm, gallery, btnLoadMore } = refs;


const paramsNotify = {
    position: 'center-bottom',
    timeout: 4000,
    width: '300px',
    fontSize: '20px',
   
};
const perPage = 40;
let page = 1;
let keyOfSearchPhoto = '';

btnLoadMore.classList.add('is-hidden');

searchForm.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
    event.preventDefault();

    gallery.innerHTML = '';
    page = 1;
    const { searchQuery } = event.currentTarget.elements;
    keyOfSearchPhoto = searchQuery.value
        .trim()
        .toLowerCase()
        .split(' ')
        .join('+');
 

    if (keyOfSearchPhoto === '') {
        Notify.info('Enter your request, please!', paramsNotify);
        return;
    }
    fetchPhoto(keyOfSearchPhoto, page, perPage)
    .then(data => {
        const searchResults = data.hits;
        if (data.totalHits === 0) {
            Notify.failure('Sorry, there are no images matching your search query. Please try again.', paramsForNotify);
        } else {
            Notify.info(`Hooray! We found ${data.totalHits} images.`, paramsNotify);
          
            createMarkup(searchResults);
            lightbox.refresh();

        };
        if (data.totalHits > perPage) {
            btnLoadMore.classList.remove('is-hidden');
            // window.addEventListener('scroll', showLoadMorePage);
        };
        //  scrollPage();
    })
    .catch(onFetchError);

btnLoadMore.addEventListener('click', onClickLoadMore);

event.currentTarget.reset();
};


function createMarkup(searchResults) {
    const markup = searchResults.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `<div class="photo-card">
        <div class="img_wrap">
            <a class="gallery_link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" width="300" loading="lazy" />
            </a>
        </div>
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
        </div>`
    });
    gallery.insertAdjacentHTML("beforeend", markup.join(''));
};

function onClickLoadMore() {
    page += 1;
    fetchPhoto(keyOfSearchPhoto, page, perPage)
        .then(data => {
            const searchResults = data.hits;
            const numberOfPage = Math.ceil(data.totalHits / perPage);
            
            createMarkup(searchResults);
            if (page === numberOfPage) {
                btnLoadMore.classList.add('is-hidden');
                Notify.info("We're sorry, but you've reached the end of search results.", paramsForNotify);
                btnLoadMore.removeEventListener('click', onClickLoadMore);
                // window.removeEventListener('scroll', showLoadMorePage);
            };
            lightbox.refresh();
            //  scrollPage();
         
        })
        .catch(onFetchError);
};

function onFetchError() {
    Notify.failure('Oops! Something went wrong! Try reloading the page or make another choice!', paramsNotify);
};

// function scrollPage() {
//     const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();

//     window.scrollBy({
//         top: cardHeight * 2,
//         behavior: "smooth",
//     });
// };


// function showLoadMorePage() {
//     if (checkIfEndOfPage()) {
//         onClickLoadMore();
//     };
// };

function checkIfEndOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
  );
}