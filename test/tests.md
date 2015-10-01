# Models

## User

1. Create unique User from Facebook [no mongo id in request]
..1. POST to /user with unique Facebook auth
..2. Expect: res to client with new user

2. Do not create duplicate User with same Facebook credentials [no mongo id in request]
..1. POST to /user with duplicate Facebook auth
..2. Expect: Update existing User with new attributes
..3. Expect: res to client with existing user

3. Update unique User [mongo id in request]
..1. POST/PUT /user/id 
..2. Expect: update user object with matching id
..3. Expect: res to client the updated user

## Place

1. Create unique Place from GooglePlaces [server side]
..1. GET from Google Places API
..2. Expect: a normalized + detailed place parsed from results

2. Create a unique Place from GooglePlaces and add into db [server side]
..1. Parse Google Places results and add to server
..2. Expect: successful add

3. Do not create duplicate Place  [server side]
..1. Parse Google Places results and add to server
..2. Expect: update existing place with possibly new attributes 

4. Get a unique place from db using place id [client request]
..1. GET request to /place/{id}
..2. Expect: res to client with place

## UserAtPlace

1. Create a history between user and place [client request]
..1. POST to /place/visit [User, Place, UserAtPlace]
..2. Expect: res to client -> user [with place added into their history], place

# Controllers

## User

1. Get all places user has been to [client request]
..1. GET request to /user/{id}
..2. Expect: res to client -> array of places from the user's place history

## Place

..* *geojson coordinates are google map's viewport and not actualy earth coordinates*

1. Get all places withing range of this geojson from GooglePlaces [server side]
..1. GET from Google Places API
..2. Expect: an array of places that are actually within bounds

2. Get all places within range of this geojson location [client side]
..1. GET request to /place/nearbyPlaces
..2. Expect: res to client -> Array of places
