# GET Endpoints

Get all restaurants

http://localhost:1337/restaurants/

Get favorite restaurants

http://localhost:1337/restaurants/?is_favorite=true

Get a restaurant by id

http://localhost:1337/restaurants/<restaurant_id>

Get all reviews for a restaurant

http://localhost:1337/reviews/?restaurant_id=<restaurant_id>

Get all restaurant reviews

http://localhost:1337/reviews/

Get a restaurant review by id

http://localhost:1337/reviews/<review_id>

Get all reviews for a restaurant

http://localhost:1337/reviews/?restaurant_id=<restaurant_id>

# POST Endpoints

Create a new restaurant review

http://localhost:1337/reviews/

Parameters

{
"restaurant_id": <restaurant_id>,
"name": <reviewer_name>,
"rating": <rating>,
"comments": <comment_text>
}

# PUT Endpoints

Favorite a restaurant

http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true

Unfavorite a restaurant

http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false

Update a restaurant review

http://localhost:1337/reviews/<review_id>

Parameters

{
"name": <reviewer_name>,
"rating": <rating>,
"comments": <comment_text>
}

DELETE Endpoints
Delete a restaurant review

http://localhost:1337/reviews/<review_id>
