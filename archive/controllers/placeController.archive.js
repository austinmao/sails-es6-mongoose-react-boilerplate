/**
 * PlaceController
 *
 * @description :: Server-side logic for managing pois
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

import _ from 'lodash'
import moment from 'moment'
import Promise from 'bluebird'
import is from 'is_js'
import numeral from 'numeral'
import {GooglePlaces} from '../services/GoogleApi'
import {Retrieve} from '../services/Utils'
import {Algorithm} from '../services/Score'
const request = require('superagent-promise')(require('superagent'), Promise);

// color consoles
import chalk from 'chalk'
const success = chalk.bgGreen.black
const failure = chalk.bgRed.black


/**
 * 1. search in db for place. if it exists, skip to step 5
 * 2. if place is not in db, find nearbyPlaces with Google Places
 * 3. find placeDetails of top result
 * 4. save Place to db
 * 5. update User.placeHistory with Place
 * 6. res to client
 * 
 * @param  {object} req [location and radius from client]
 * @example: POST
   {
    "user": {
      "id": "559dde0250475d85741e116e",
    },
    "place": {
      "location": {
        "type": "Point",
        "coordinates": [-118.1984241, 34.1389702]
      },
      "radius": 200
    },
    "userAtPlace": {
      "visitedAt": "2014-09-17T23:25:56.314Z"
    }
  }
 * 
 * @param  {object} res [callback]
 * @return {object}     [array of geoJSON]
 */
export function visit(req, res) {

  // find place in db or create and save place in db from the top google
  // places search result
  return _findOrCreate(req.body.place)

    // save to user.placeHistory
    .then(createdPlace => sails.controllers.user.savePlaceToHistory(req.body.user, createdPlace, req.body.userAtPlace))

    // res back to client
    .spread((user, place) => res.json({ user, place }) )
    .tap(result => sails.log(success('visit success!')))

    // res any errors to client
    .catch(err => {
      sails.log.error(failure('visit error', err))
      return res.serverError(err)
    }) // .catch
} // visit


/**
 * 1. search in db for place. if it exists, skip to step 5
 * 2. if place is not in db, find nearbyPlaces with Google Places
 * 3. find placeDetails of top result
 * 4. save Place to db
 * 5. update User.placeHistory with Place
 * 6. res to client
 * 
 * @param  {object} req [location and radius from client]
 * @example: POST
  {
    "user": {
      "id": "55a4656a079e843b621359e9"
    },
    "place": {
      "location": {
        "type": "Point",
        "coordinates": [-118.3849259, 34.0542644]
      },
      "radius": 200
    },
    "userAtPlace": {
      "visitedAt": "2015-07-14T00:34:07.673Z"
    }
  }
 * 
 * @param  {object} res [callback]
 * @return {object}     [array of geoJSON]
 */
export function vote(req, res) {

  // find place in db or create and save place in db from the top google
  // places search result
  return _findOrCreate(req.body.place)

    // save to user.placeHistory
    .then(createdPlace => sails.controllers.user.savePlaceToHistory(req.body.user, createdPlace, req.body.userAtPlace))

    // res back to client
    .spread((user, place) => res.json({ user, place }) )

    // res any errors to client
    .catch(err => {
      sails.log.error(failure('visit error', err))
      return res.serverError(err)
    }) // .catch
} // like


/**
 * find places closest to a point given a radius in radians
 * @param  {object} req [location, radius, limitResultsCnt from client]
 * @example: GET
  {
    "location": {
        "type": "Point",
        "coordinates": [
            -105.01621,
            39.57422
        ]
    },
    "radius": 200,
    "limitResultsCnt": 1000
  }  
 *
 * @param  {object} res [callback]
 * @return {array}      [array of places within the radius from point]
 */
/*
export function retrieve(req, res) {

  sails.log('req.query', req.query)
  let {location, radius, limitResultsCnt} = req.query

  // convert strings to numbers for coordinates (useful for POSTMAN testing)
  location.coordinates[0] = Number(location.coordinates[0])
  location.coordinates[1] = Number(location.coordinates[1])
  limitResultsCnt = Number(limitResultsCnt)
  sails.log('location after conversion', location)

  // search nearby in db
  return Place.findNear(location, radius, limitResultsCnt)
    .tap(result => sails.log.info(success('findNear success:'), result))

    // res results
    .then(results => res.json(results))

    .catch(err => {
      sails.log.error(failure('findNear error:', err))
      res.serverError(err)
    }) // .catch
} // export
*/

// return the place object from google with matching coordinates
export function retrieve(req, res) {

  sails.log.info('Begin place/retrieve with coordinates: ',
    req.query.location.coordinates)

  // parse the request query
  const location = req.query.location 
  const radius = req.query.radius || 2000
  const keyword = req.query.keyword || 'establishment'

  // convert the coordinates into numerals if they are strings
  location.coordinates[0] = Number(location.coordinates[0])
  location.coordinates[1] = Number(location.coordinates[1])

  // instantiate google places
  const googlePlaces = new GooglePlaces()

  // find the matching place from google's radar search 
  // type: radar search
  // max results: 200
  return findPlaceFromGoogle(location, radius, keyword)

    // the place_id returned from the search
    .then( match => {

      // ping google for the place details using the matching place_id
      if(match) {
        return googlePlaces.placeDetails(match)
        .then (placeDetailsRes => {
          const place = placeDetailsRes.body.result
          sails.log.info('success')

          // res back the place
          res.json(place)
        })
      } 

      // res back an empty array if no match was found
      else {
        sails.log('could not find a match')
        res.json({})
      }
    })

    // catch any errors
    .catch(err => {
      sails.log.error(failure('googlePlaces.nearbySearch error:', err))
      res.serverError(err)
    })
}

// find the place from google using the matching algorithm
// after using  google's radar search
function findPlaceFromGoogle(location, radius, keyword) {
  const googlePlaces = new GooglePlaces()

  return googlePlaces.nearbySearch(location, radius, 'distance', keyword)
  .then( res => {
    return findPlaceWithMatchingCoordinates(location, res.body.results)
  })
}

// the matching algorithm
function findPlaceWithMatchingCoordinates(location, results) {

  // parse lng and lat coordinates
  var lng = parseCoordinate(location.coordinates[1])
  var lat = parseCoordinate(location.coordinates[0])

  sails.log('comparing coordinates...')

  // initialize the history arrays
  var count = 0
  var distanceArray = []
  var placeArray = []

  // compare each place found from the radar search with the
  // coordinate argument
  for(var index in results) {
    count++

    const place = results[index]

    // parse the comparing place's coordiantes
    const LAT = parseCoordinate(place.geometry.location.lat)
    const LNG = parseCoordinate(place.geometry.location.lng)

    // find the distance between the comparing place's coordinates
    // and the coordinate argument using the Haversine formula
    const distance = getDistanceFromLatLonInKm(lat, lng, LAT, LNG)

    // push the distance into the distance array
    distanceArray.push(distance)

    // push the place into the placeArray along with it's matching distance
    placeArray.push({
      key: distance,
      value: place.place_id
    })

    sails.log.info('distance: ', distance, ' km')
    sails.log.debug('place_id: ', place.place_id)

    // compare the place coordinate with the coordinate argument
    if(LAT == lat && LNG == lng) {
      sails.log.info('number of comparisons: ', count)
      sails.log.info("found place with matching coordinates!")
      sails.log.info({lat, lng})
      sails.log.info({LAT, LNG})

      // return the place_id that had the matching coordinates
      return place.place_id
    }

    sails.log({lat, lng})
    sails.log({LAT, LNG}, '\n')
  }

  // if the coordinate comparison did not return any matches
  // use Haversine formula then the 'nearest neighbor' formula
  // to determine the place with the closest coordinate
  sails.log.info('number of comparisons: ', count)
  sails.log.info('did not find any matches, proceeding to use Haversine formula...')

  // sort the distance arrays into ascending order for the
  // 'closest' function to work
  const sortedDistanceArray = _.sortBy(distanceArray)

  // determine the closest distance to 0 [0 meaning a perfect match]
  const closestDistance = closest(0, sortedDistanceArray)
  sails.log.info('found closest distance: ', closestDistance)

  // find and return the place_id that is matched with the closest distance
  return parsePlaceArrayHavingDistance(placeArray, closestDistance)
}

// loop through the place_id array and return the place_id with the matching
// closest distance
function parsePlaceArrayHavingDistance(placeArray, closestDistance) {
  for(var index in placeArray) {
    if(placeArray[index].key == closestDistance) {
      sails.log.info('found place_id with closest distance: ', placeArray[index].value)
      return placeArray[index].value
    }
  }
  sails.log.error('closest distance formula has failed')
  return null
}

// formula to parse coordinate values with little to no rounding as to keep
// coordinate authenticity close to a six digit precision
function parseCoordinate(coordinate, fixed) {

  if(coordinate < 0) {
    return Number((Math.ceil(coordinate * 1000000) / 1000000).toFixed(6))
  }
  else if (coordinate >= 1) {
    return Number((Math.floor(coordinate * 1000000) / 1000000).toFixed(6))
  }
}

// Haversine formula to find the distance between two coordinate points
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1)  // deg2rad below
  var dLon = deg2rad(lon2-lon1) 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
     
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  var d = R * c // Distance in km
  return d
}

// convert coordinate degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// 'nearest neighbor' formula to find the a point in an array
// closest to a given point
function closest(num, arr) {
  var mid
  var lo = 0
  var hi = arr.length - 1
  while (hi - lo > 1) {
    mid = Math.floor ((lo + hi) / 2)
    if (arr[mid] < num) {
      lo = mid
    } else {
      hi = mid
    }
  }
  if (num - arr[lo] <= arr[hi] - num) {
    return arr[lo]
  }
  return arr[hi]
}



/**
 * GET nearby places given a lng, lat array
 * @param  {object}   req      req from client
   @example: GET
   {
    "location": {
        "type": "Point",
        "coordinates": [
            -105.01621,
            39.57422
        ]
    },
    "radius": 200
   }
 * @param  {Function} callback callback to client
 * @return {object}            res.json to client
 */
export function retrieveNearbyFromGoogle(req, res) {

  sails.log('retrieveNearbyFromGoogle query', req.query)

  // set constants to pass to findNearbyPlaces from req
  let {location, radius, rankBy, keyword} = req.query

  // convert strings to numbers (useful for Postman testing)
  location.coordinates[0] = Number(location.coordinates[0])
  location.coordinates[1] = Number(location.coordinates[1])
  radius = Number(radius)
  sails.log.info({location, radius})

  // search nearby for places
  const googlePlaces = new GooglePlaces()
  return googlePlaces.nearbySearch(location, radius, rankBy, keyword)
    .then(results => res.json(results.body.results))
    .catch(err => {
      sails.log.error(failure('googlePlaces.nearbySearch error:', err))
      return res.serverError(err)
    })
} // retrieveNearbyPlaces

/**
 * GET json from google places api
 * @param  {object}   req      req from client
 * @param  {Function} callback callback to client
 * @return {object}            res.json to client
 */
export function retrieveDetailsFromGoogle(req, res) {

  // set constants to pass to findNearbyPlaces from req
  const {placeId} = req.query

  // if no placeId passed, res error to client
  if(!placeId) {
    return res.serverError('no placeId')
  }

  // request place details
  const googlePlaces = new GooglePlaces()
  return googlePlaces.placeDetails(placeId)
    .then(results => res.json(results.body.results))
    .catch(err => {
      sails.log.error(failure('googlePlaces.placeDetails error', err))
      return res.serverError(err)
    })
} // retrievePlaceDetails


/**
 * create a record from the first result when searching google places
 * @param  {object}   req      req from client
   @example: POST
   {
    "location": {
        "type": "Point",
        "coordinates": [
            -105.01621,
            39.57422
        ]
    },
    "radius": 200
   }
 * @param  {Function} callback callback to client
 * @return {object}            res.json to client
 */
export function createFromGooglePlaces(req, res) {

  let {location, radius} = req.body

  // convert strings to numbers (useful for Postman testing)
  location.coordinates[0] = Number(location.coordinates[0])
  location.coordinates[1] = Number(location.coordinates[1])
  radius = Number(radius)
  sails.log.info({location, radius})

  return _retrieveFromGooglePlaces(location, radius)
    .tap(place => sails.log('creating place from', place))

    // save place to db
    .then(place => Place.mongoose.createAsync)
    .tap(result => sails.log.info(success('place create success:'), result))
}


/**
 * update the point score after a user visits or votes on a place
 * @help   http://amix.dk/blog/post/19588
 * @param  {object} user  [user object]
 * @param  {object} place [place object]
 * @return {float}        [new point score]
 */
export function updateScore(user, place, userAtPlace) {

  // set time since place was discovered
  // TODO: should vote time be relevant?
  let epoch = {
    place: {
      createdAt: moment(place.createdAt).fromNow()
    },
    user: {
      visitedAt: moment(userAtPlace.visitedAt).fromNow()
    }
  }

  // set epoch time of vote if user voted for place
  if (userAtPlace.votedAt) {
    epoch.user.votedAt = moment(userAtPlace.votedAt).fromNow()
  }

  sails.log({epoch})

  return score
}


/**
 * find in db or create a place from Google Places results
 * @param  {object} place  [nearbySearch inputs including {location, radius}]
 * @return {object}        [saved place]
 */
export function _findOrCreate(place) {

  const {location, radius, rankBy, options} = place
  sails.log(`finding place at [${_.get(location, 'coordinates')}] with radius of ${radius}`)

  return Place.findNear(location, radius, 1)
    .tap(result => sails.log.info(success('Place.findNear success:'), result))

    // if found in db, return place; if not, use googleNearbySearch
    .then(foundPlace => {
      if (foundPlace && is.not.empty(foundPlace)) {
        sails.log('foundPlace in db:', foundPlace)
        return foundPlace
      } else {
        sails.log('Place not found, finding nearbyPlaces from Google')
        return _retrieveFromGooglePlaces(location, radius)
          // save place to db
          .then(place => {
            sails.log('creating Place from:', place)
            return Place.mongoose.createAsync(place)
              .tap(result => sails.log.info(success('Place.create success:'), result))
          })
      } // if
    }) // .then(foundPlace => {

    .catch(err => sails.log.error(failure('_findOrCreate error', err)))
} // findOrCreate


/**
 * perform nearbySearch then retrieve placeDetails of a place. then save to db.
 * @param  {object} location [geoJson location of place]
 * @param  {float} radius    [radius to search for]
 * @return {object}          [formatted place from google]
 */
export function _retrieveFromGooglePlaces(location, radius) {

  sails.log.info(location)

  const fn = '[PlaceController._retrieveFromGooglePlaces]'

  // init GooglePlaces for nearbySearch
  const googlePlaces = new GooglePlaces()

  let basicPlace // place with basic details
  return googlePlaces.nearbySearch(location, radius)

    // get first place from results array
    .then(nearbyRes => nearbyRes.body.results[0])
    .tap(result => sails.log.info('nearbyRes result:', result))

    // set basic details
    .then(place => {
      basicPlace = Place.normalizeBasicAttributes(place)
      return basicPlace
    })
    .tap(result => sails.log.info('normalizeBasicAttributes result:', result))

    // get place details
    .then(basicPlace => googlePlaces.placeDetails(basicPlace.apiId.google))
    .then(detailsRes => detailsRes.body.result)
    .tap(result => sails.log.info('placeDetails result:', result))

    // set place details or basic if err when retrieving details
    .then(detailedPlace => Place.normalizeDetailedAttributes(detailedPlace))
    .tap(result => sails.log.info('normalizeDetailedAttributes result:', result))

    // return basicPlace if error from placeDetails
    .error(err => basicPlace)

    .catch(err => sails.log.error(failure(fn, 'error', err)))
} // function _retrieveFromGooglePlaces
