/**
 * Common database helper functions.
 */
class DBHelper {

  static get DATABASE_URL() {
     // return `http://localhost:1337`; // Local developer server
    return `https://mws-stage-3.glitch.me/`; // Online developer server
    }
  
  static get RESTAURANTS_PATH() {
    return `${DBHelper.DATABASE_URL}/restaurants`; // Path to a JSON response for Restaurants on Dev server
  }

  static get REVIEWS_PATH() {
    return `${DBHelper.DATABASE_URL}/reviews`; // Path to a JSON response for Reviews on Dev server
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    return DBHelper.getRestaurantsOffline().then(response => {
      if (response) {
        DBHelper.getRestaurantsOnline()
        return callback(null, response)
      }
      return DBHelper.getRestaurantsOnline(callback)
    })
  }
  // Get restaurants info from indexedDb
  static getRestaurantsOffline() {
    return localforage.getItem('restaurants')
  }
  // Save restaurants info locally in indexedDB
  static saveRestaurants(restaurants) {
    return localforage.setItem('restaurants', restaurants)
  }
  // Fetch restaurants info online and save in indexedDb
  static getRestaurantsOnline(callback = () => null) {
    return fetch(DBHelper.RESTAURANTS_PATH).then(response => response.json()).then(json => {
        DBHelper.saveRestaurants(json)
        return callback(null, json)
      })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 

  // GET REVIEWS
  static getRestReviews(restaurantId, callback) {
    this.getRestReviewsOffline(restaurantId)
    .then(response => {
      if (response) {
        DBHelper.getRestReviewsOnline(restaurantId)
        return callback(null, response)
      }
      return DBHelper.getRestReviewsOnline(
        restaurantId,
        callback
      )
    })

  }

  // CACHE REVIEWS
  static saveRestReviews(restaurantId, reviews) {
    return localforage.setItem(
      `restaurantReviews${restaurantId}`,
      reviews
    )
  }

  static saveARestReview(review) {
    const key =
    this.getRestReviewsOffline(review.restaurant_id)
    .then(reviews => {
      localforage.setItem(
        `restaurantReviews${review.restaurant_id}`,
        [...reviews, { ...review, updatedAt: new Date() }]
      )
    })
  }
  
  // GET REVIEWS FROM IDB
  static getRestReviewsOffline(restaurantId) {
    return localforage.getItem(`restaurantReviews${restaurantId}`)
  }
  // GET REVIEWS FROM ONLINE SERVER
  static getRestReviewsOnline(restaurantId, callback = () => null) {
    return fetch(`${this.REVIEWS_PATH}/?restaurant_id=${restaurantId}`)
      .then(data => data.json())
      .then(reviews => {
        this.saveRestReviews(restaurantId, reviews)
        callback(null, reviews)
      })
      .catch(error => callback(error, null))
  }

  // ADD A REST TO FAVS
  static addToFavs(restaurantId) {
    const url = `${DBHelper.RESTAURANTS_PATH}/${restaurantId}/?is_favorite=true`;
    fetch(url, { method: 'PUT' })
  }
  // REMOVE A REST FROM FAVS
  static removeFromFavs(restaurantId) {
    const url = `${DBHelper.RESTAURANTS_PATH}/${restaurantId}/?is_favorite=false`;
    fetch(url, { method: 'PUT' })
  }

  // SUBMIT OR SYNC REVIEW
  static submitOrSyncReview(review) {
    this.submitRestReview(review)
    .catch(() => this.sendReviewSyncRequest(review))
  }

  static submitRestReview(review) {
    const options = {
      method: 'POST',
      body: JSON.stringify(review)
    }
    return fetch(this.REVIEWS_PATH, options)
  }

  static sendReviewSyncRequest(review) {
    if (navigator.serviceWorker) {
      console.log('Requesting review sync...')
      this.storeReview(review)
      navigator.serviceWorker.ready
      .then(reg => reg.sync.register('sync-reviews'))
    }
  }

  static storeReview(review) {
    console.log('Storing review...')
    localforage.getItem('pendingReviews')
    .then(response => {
      const reviews = response || []
      localforage.setItem('pendingReviews', [...reviews, review])
    })
  }

  static sendStoredReviews() {
    console.log('Sending reviews...')
    localforage.getItem('pendingReviews')
    .then(response => {
      const reviews = response || []
      console.log('Reviews: ', reviews)
      for (const review of reviews) {
        this.submitRestReview(review)
      }
      localforage.setItem('pendingReviews', [])
    })

  }
}