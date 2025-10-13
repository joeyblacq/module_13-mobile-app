package com.rocketFoodDelivery.rocketFood.controller.api;

import com.rocketFoodDelivery.rocketFood.dtos.ApiCreateRestaurantDto;
import com.rocketFoodDelivery.rocketFood.dtos.ApiRestaurantDto;
import com.rocketFoodDelivery.rocketFood.service.RestaurantService;
import com.rocketFoodDelivery.rocketFood.util.ResponseBuilder;
import com.rocketFoodDelivery.rocketFood.exception.*;
import com.rocketFoodDelivery.rocketFood.models.Restaurant;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;


import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class RestaurantApiController {
    private RestaurantService restaurantService;

    @Autowired
    public RestaurantApiController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }
    
    // Fait

    /**
     * Creates a new restaurant.
     *
     * @param restaurant The data for the new restaurant.
     * @return ResponseEntity with the created restaurant's data, or a BadRequestException if creation fails.
     */
    @PostMapping("/api/restaurants")
    public ResponseEntity<Object> createRestaurant(@RequestBody @Valid ApiCreateRestaurantDto restaurantDto) {
        try {
            Optional<ApiCreateRestaurantDto> createdRestaurant = restaurantService.createRestaurant(restaurantDto);
            
            if (createdRestaurant.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID or address ID"));
            }
    
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Restaurant created successfully",
                "data", createdRestaurant.get()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred"));
        }
    }
    
    
    // Fait

    /**
     * Deletes a restaurant by ID.
     *
     * @param id The ID of the restaurant to delete.
     * @return ResponseEntity with a success message, or a ResourceNotFoundException if the restaurant is not found.
         */
    @DeleteMapping("/api/restaurants/{id}")
    public ResponseEntity<Object> deleteRestaurant(@PathVariable int id) {
        // Call the service to delete the restaurant
        Optional<Restaurant> deletedRestaurant = restaurantService.deleteRestaurant(id);

        if (deletedRestaurant.isEmpty()) {
            // Return HTTP 404 Not Found if the restaurant does not exist
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Resource not found",
                "details", "Restaurant with id " + id + " not found"
            ));
        }

        // Create the response with the deleted restaurant details
        Restaurant restaurant = deletedRestaurant.get();
        Map<String, Object> response = Map.of(
            "message", "Success",
            "data", Map.of(
                "id", restaurant.getId(),
                "name", restaurant.getName(),
                "price_range", restaurant.getPriceRange(),
                "rating", 4 
            )
        );

        // Return HTTP 200 OK with the success message and restaurant details
        return ResponseEntity.ok(response);
    }

        // Fait

    /**
     * Updates an existing restaurant by ID.
     *
     * @param id                    The ID of the restaurant to update.
     * @param restaurantUpdateData  The updated data for the restaurant.
     * @param result                BindingResult for validation.
     * @return ResponseEntity with the updated restaurant's data
     */
    @PutMapping("/api/restaurants/{id}")
    public ResponseEntity<Object> updateRestaurant(@PathVariable("id") int id, @Valid @RequestBody ApiCreateRestaurantDto restaurantUpdateData, BindingResult result) {
        
        // Check for validation errors in the request body
        if (result.hasErrors()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Validation failed",
                "details", result.getFieldErrors().stream()
                    .map(fieldError -> fieldError.getField() + " " + fieldError.getDefaultMessage())
                    .collect(Collectors.joining(", "))
            ));
        }
    
        // Attempt to update the restaurant using the service
        Optional<ApiCreateRestaurantDto> updatedRestaurant = restaurantService.updateRestaurant(id, restaurantUpdateData);
    
        // Check if the restaurant was found and updated
        if (updatedRestaurant.isEmpty()) {
            // Return HTTP 404 Not Found if the restaurant was not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Resource not found",
                "details", "Restaurant with id " + id + " not found"
            ));
        }
    
        // Return HTTP 200 OK with the updated restaurant data
        return ResponseEntity.ok(Map.of(
            "message", "Success",
            "data", updatedRestaurant.get()
        ));
    }

    /**
     * Retrieves details for a restaurant, including its average rating, based on the provided restaurant ID.
     *
     * @param id The unique identifier of the restaurant to retrieve.
     * @return ResponseEntity with HTTP 200 OK if the restaurant is found, HTTP 404 Not Found otherwise.
     *
     * @see RestaurantService#findRestaurantWithAverageRatingById(int) for details on retrieving restaurant information.
     */
    @GetMapping("/api/restaurants/{id}")
    public ResponseEntity<Object> getRestaurantById(@PathVariable int id) {
        Optional<ApiRestaurantDto> restaurantWithRatingOptional = restaurantService.findRestaurantWithAverageRatingById(id);
        if (!restaurantWithRatingOptional.isPresent()) throw new ResourceNotFoundException(String.format("Restaurant not found", id));
        return ResponseBuilder.buildOkResponse(restaurantWithRatingOptional.get());
    }

    /**
     * Returns a list of restaurants given a rating and price range
     *
     * @param rating integer from 1 to 5 (optional)
     * @param priceRange integer from 1 to 3 (optional)
     * @return A list of restaurants that match the specified criteria
     * 
     * @see RestaurantService#findRestaurantsByRatingAndPriceRange(Integer, Integer) for details on retrieving restaurant information.
     */

    @GetMapping("/api/restaurants")
    public ResponseEntity<Object> getAllRestaurants(
        @RequestParam(name = "rating", required = false) Integer rating,
        @RequestParam(name = "price_range", required = false) Integer priceRange) {
        return ResponseBuilder.buildOkResponse(restaurantService.findRestaurantsByRatingAndPriceRange(rating, priceRange));
    }
}

