let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoidmxhZGk3IiwiYSI6ImNqaXZqYWVqcjI3cWkzeHBlenVybHgwbmMifQ.-0dJPIYrR774vFAjofmG2A',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.light'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
      document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';
    }
  });
}  

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const isFavorite = restaurant.is_favorite ?
  JSON.parse(restaurant.is_favorite) :
  false

  const heartIcon = document.querySelector('#fav-ico');

  heartIcon.src = isFavorite ? // Set's innitial fav ico according to DB status
    './img/heart-solid.svg' :
    './img/heart-solid-grey.svg'

  // Listens for mouse event to fire a toggle function
  heartIcon.addEventListener('mousedown', () => toggleFavorite(restaurant));



  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const source = document.getElementById('source');
  source.srcset = `${DBHelper.imageUrlForRestaurant(restaurant)}.webp`;
  source.type = `image/webp`;

  const image = document.getElementById('restaurant-img');
  image.className = `restaurant-img`;
  image.alt = 'Image of ' + restaurant.name + " Restaurant";
  image.src = `${DBHelper.imageUrlForRestaurant(restaurant)}.jpg`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  // fillReviewsHTML();
  DBHelper.getRestReviews(restaurant.id, fillReviewsHTML);
  
  // create meta description 
  const link=document.createElement('meta');
  link.name="Description";
  link.content= restaurant.name;
  document.getElementsByTagName('head')[0].appendChild(link);

// TOGGLE FAV //
  toggleFavorite = restaurant => {

      const isFavorite = restaurant.is_favorite ?
        JSON.parse(restaurant.is_favorite) :
        false
    
      isFavorite // Picks a function depending on previous state
        ? removeFromFavs(restaurant.id)
        : addToFavs(restaurant.id);
    }
    
    addToFavs = restaurantId => { // 1. Changes image src; 2. Changes status of is_favourite in DB
      const heartIcon = document.querySelector('#fav-ico');
      heartIcon.src = './img/heart-solid.svg';
      restaurant.is_favorite = true;
      DBHelper.addToFavs(restaurantId);
      console.log('Added to Favs!');

    }
    
    removeFromFavs = restaurantId => { // As addToFavs()
      const heartIcon = document.querySelector('#fav-ico');
      heartIcon.src = './img/heart-solid-grey.svg';
      restaurant.is_favorite = false;
      DBHelper.removeFromFavs(restaurantId);
      console.log('Removed from Favs!');
    }
  
}
/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

// APPEND REVIEWS
appendReview = review => {
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
//fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  fillReviewsHTML = (error,reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  //if (!reviews) {
  if (reviews.length === 0) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  // reviews.forEach(review => {
  //   ul.appendChild(createReviewHTML(review));
  // });
  reviews.forEach(appendReview);

  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('h4');
  name.innerHTML = review.name;
  li.appendChild(name);

  // const date = document.createElement('time');
  // date.innerHTML = review.createdAt;
  // li.appendChild(date);

  const date = document.createElement('p');
  date.innerHTML = formatTime(review.updatedAt);
  date.classList.add('review-date');
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

// FORMATS THE DATE FROM THE REVIEW OBJ TO BE DISPLAYED CORRECTLY IN HTML
formatTime = time => { 
  const date = new Date(time);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`; // RETURNS DATE IN FORMAT "22/08/2018" TO BE INSERTED IN MARKUP
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// LISTENS FOR REVIEW FORM SUBMISSION AND DISPLAYS/SAVES/SYNCS REVIEW
addReviewFormListener = () => {
  const form = document.querySelector('#review-form');
  form.addEventListener('submit', event => {
    event.preventDefault()
    const name = form.querySelector('#name')
    const rating = form.querySelector('#rating')
    const comments = form.querySelector('#comments')
     const review = {
      restaurant_id: getParameterByName('id'),
      name: name.value,
      rating: parseInt(rating.value),
      comments: comments.value
    }
     appendReview({...review, updatedAt: new Date() });
    DBHelper.submitOrSyncReview(review);
    DBHelper.saveARestReview(review);
     name.value = ''
    rating.value = 1
    comments.value = ''
  })
}
 addReviewFormListener(); 
