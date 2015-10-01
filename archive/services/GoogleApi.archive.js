/**
 * GoogleApi
 *
 * @description :: Server-side logic for using Google APIs
 * @help        :: See http://links.sailsjs.org/docs/services
 */

import Promise from 'bluebird'
import is from 'is_js'
import changeCase from 'change-case'
import geojsonhint from 'geojsonhint'
import {Validate} from './Utils'
const request = require('superagent-promise')(require('superagent'), Promise);

// TODO: ask austin for the /.env file to put in your root folder. it's
// currently in the .gitignore so will not be transferred for security
// reasons!
// const apiKey = process.env.GOOGLE_PLACES_API_KEY
const apiKey = 'AIzaSyDUeX1c27pvw1KL_ay6uoAo-gXijSESATE'
const defaults = {
  radius: 500,
  rankBy: false
}

/**
 * use the google api
 * @function .nearbySearch: retrieve nearby places
 * @function .placeDetails: retrieve details of a poi
 */
export class GooglePlaces {
  constructor() {
    // set apiKey to default
    this.apiKey = apiKey
    this.nearbySearchUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    this.placeDetailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
    this.radarSearchUrl = 'https://maps.googleapis.com/maps/api/place/radarsearch/json'
  }


  /**
   * request nearby places
   * @param  {object}   location [geoJSON object of where to search]
   * @param  {float}    radius   [radius to search by]
   * @param  {string}   rankBy   [how to rank search results]
   * @return {function}          [superagent promise]
   */
  nearbySearch(location, radius, rankBy, keyword) {

    const fn = '[GoogleApi.nearbySearch]'
    sails.log.info(fn, location, radius, rankBy, keyword)

    // validate location
    const isValid = new Validate(location)
    const geoJsonErr = geojsonhint.hint(location)

    // reverse geoJson coordinates from [lng, lat] to [lat, lng]
    if (is.empty(geoJsonErr)) {
      location = location.coordinates.reverse()
    }

    // if no location, throw error
    if (!location) {
      let err = 'no location passed'
      sails.log.error(err)
      throw new Error(err)
    }

    // construct google nearbySearch query
    const query = {
      key: this.apiKey,
      location: location.toString(),
      radius: radius || defaults.radius, // set to defaults if no radius
      // rankBy: rankBy || 'distance',
      keyword: keyword || ''
    }

    sails.log.info('searching nearby at:', this.nearbySearchUrl, 'with query', query)
    return request.get(this.radarSearchUrl)
      .query(query)
      // if invalid request from google, throw error
      .then(results => {
        if (results.body.status != 'OK') {
          throw new Promise.OperationalError(fn, 'error:', results.body.status)
        } else {
          return results
        } // if
      }) // .then
  } // nearbySearch


  /**
   * request place details
   * @param  {string} placeId [google place id]
   * @return {function}       [superagent promise]
   */
  placeDetails(placeId) {

    const fn = '[placeDetails]'

    const query = {
      key: this.apiKey,
      placeid: placeId
    }

    sails.log.info('getting place detail at:', this.placeDetailsUrl, 'with query', query)
    return request.get(this.placeDetailsUrl)
      .query(query)
      // if invalid request from google, throw error
      .then(results => {
        if (results.body.status !== 'OK') {
          throw new Promise.OperationalError(fn, 'error:', results.body.status)
        } else {
          return results
        } // if
      }) // .then
  } // placeDetails
} // class
