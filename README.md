## Description
Shopping cart code test

Created with [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

Install Deps

```bash
$ npm install
```

Run the migrations
```bash
$ npm run typeorm:migration:run
```

## Running the app

```bash
# development
$ npm run start
```

Visit http://127.0.0.1:3123 to see the Swagger docs

From there you can try the API

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

See [test/store-cart-discounts.e2e-spec.ts](test/store-cart-discounts.e2e-spec.ts) for tests specific to item discounts.


## Design and Implementation Notes

I worked on this project as if I would have to maintain it over time, 
so rather than a minimal codebase it is a scaffolding similar to what I would use starting a new project.
This means that it has the ability to read environment variables for configuration. It persists things to a sqlite db, 
which could easily changed for any other since it is using `typeorm`. I included `Swagger` documentation so it 
would be easier to take it for a test drive.

### API Details
API endpoints are created for each of the following:
 - Getting all store items since their ids' are used to add the cart
 - Creating a new Cart
 - Getting an existing cart by id
 - adding an item to the cart
 - removing an item from the cart


#### Important notes

The add and remove endpoints could be updated to include a quantity to make adding multiple of the same item easier, 
most of the logic is in place to allow that.
It may have been better to just do a single `PATCH` endpoint to set the quantity, the requirement specified 
and add and remove, I went with that. It wouldn't be very hard to update logic to include this.

The controllers are very lean, passing the information directly to service that manages the entities.
The services were designed to be as simple as possible to keep them easy to understand, and to allow easier mocking and testing.

I went way overboard with the testing, it has unit tests for nearly everything as well as e2e tests.
