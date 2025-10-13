package com.rocketFoodDelivery.rocketFood.service;

import com.rocketFoodDelivery.rocketFood.dtos.ApiAddressDto;
import com.rocketFoodDelivery.rocketFood.dtos.ApiCreateRestaurantDto;
import com.rocketFoodDelivery.rocketFood.dtos.ApiRestaurantDto;
import com.rocketFoodDelivery.rocketFood.models.Address;
import com.rocketFoodDelivery.rocketFood.models.Restaurant;
import com.rocketFoodDelivery.rocketFood.models.UserEntity;
import com.rocketFoodDelivery.rocketFood.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import java.util.Optional;


@Service
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductOrderRepository productOrderRepository;
    private final UserRepository userRepository;
    private final AddressService addressService;
    private final AddressRepository addressRepository;

    @Autowired
    public RestaurantService(
        RestaurantRepository restaurantRepository,
        ProductRepository productRepository,
        OrderRepository orderRepository,
        ProductOrderRepository productOrderRepository,
        UserRepository userRepository,
        AddressService addressService,
        AddressRepository addressRepository
        ) {
        this.restaurantRepository = restaurantRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.productOrderRepository = productOrderRepository;
        this.userRepository = userRepository;
        this.addressService = addressService;
        this.addressRepository = addressRepository;
    }

    public List<Restaurant> findAllRestaurants() {
        return restaurantRepository.findAll();
    }

    /**
     * Retrieves a restaurant with its details, including the average rating, based on the provided restaurant ID.
     *
     * @param id The unique identifier of the restaurant to retrieve.
     * @return An Optional containing a RestaurantDTO with details such as id, name, price range, and average rating.
     *         If the restaurant with the given id is not found, an empty Optional is returned.
     *
     * @see RestaurantRepository#findRestaurantWithAverageRatingById(int) for the raw query details from the repository.
     */
    public Optional<ApiRestaurantDto> findRestaurantWithAverageRatingById(int id) {
        List<Object[]> restaurant = restaurantRepository.findRestaurantWithAverageRatingById(id);
    
        if (!restaurant.isEmpty()) {
            Object[] row = restaurant.get(0);
    
            // Utiliser les indices corrects pour chaque colonne
            int restaurantId = (int) row[0];
            String name = (String) row[1];
            int priceRange = (int) row[2];
            boolean active = (boolean) row[3];
            double rating = (row[4] != null && row[4] instanceof BigDecimal) ? 
                            ((BigDecimal) row[4]).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0;
            int roundedRating = (int) Math.ceil(rating);
            
            ApiRestaurantDto restaurantDto = new ApiRestaurantDto(restaurantId, name, priceRange, roundedRating, active);
            return Optional.of(restaurantDto);
        } else {
            return Optional.empty();
        }
    }
    
    
    

    /**
     * Finds restaurants based on the provided rating and price range.
     *
     * @param rating     The rating for filtering the restaurants.
     * @param priceRange The price range for filtering the restaurants.
     * @return A list of ApiRestaurantDto objects representing the selected restaurants.
     *         Each object contains the restaurant's ID, name, price range, and a rounded-up average rating.
     */
    public List<ApiRestaurantDto> findRestaurantsByRatingAndPriceRange(Integer rating, Integer priceRange) {
        // Execute the query and retrieve the results
        List<Object[]> restaurants = restaurantRepository.findRestaurantsByRatingAndPriceRange(rating, priceRange);
    
        // Initialize a list to hold the result DTOs
        List<ApiRestaurantDto> restaurantDtos = new ArrayList<>();
    
        // Iterate through each row of the result set
        for (Object[] row : restaurants) {
            // Map each column to the appropriate type and variable
            int restaurantId = (int) row[0];
            String name = (String) row[1];
            int range = (int) row[2];
            boolean active = (boolean) row[3]; // Ensure the correct index is used for the boolean value
    
            // Handle the rating column, which may be null, by casting to BigDecimal
            double avgRating = (row[4] != null) ? ((BigDecimal) row[4]).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0;
            int roundedAvgRating = (int) Math.ceil(avgRating);
    
            // Create a DTO for the restaurant and add it to the list
            restaurantDtos.add(new ApiRestaurantDto(restaurantId, name, range, roundedAvgRating, active));
        }
    
        // Return the list of DTOs
        return restaurantDtos;
    }

    // Fait

    /**
     * Creates a new restaurant and returns its information.
     *
     * @param restaurant The data for the new restaurant.
     * @return An Optional containing the created restaurant's information as an ApiCreateRestaurantDto,
     *         or Optional.empty() if the user with the provided user ID does not exist or if an error occurs during creation.
     */
    @Transactional
    public Optional<ApiCreateRestaurantDto> createRestaurant(ApiCreateRestaurantDto restaurantDto) {
        // Validate if the user exists
        Optional<UserEntity> existingUser = userRepository.findById(restaurantDto.getUserId());
        if (existingUser.isEmpty()) {
            return Optional.empty(); // User not found
        }
    
        // Validate if the address exists
        Optional<Address> existingAddress = addressRepository.findById(restaurantDto.getAddressId());
        if (existingAddress.isEmpty()) {
            return Optional.empty(); // Address not found
        }
    
        // Create and save the restaurant entity
        Restaurant restaurant = new Restaurant();
        restaurant.setUserEntity(existingUser.get());
        restaurant.setAddress(existingAddress.get());
        restaurant.setName(restaurantDto.getName());
        restaurant.setPhone(restaurantDto.getPhone());
        restaurant.setEmail(restaurantDto.getEmail());
        restaurant.setPriceRange(restaurantDto.getPriceRange());
        restaurant.setActive(restaurantDto.getActive());
    
        restaurantRepository.save(restaurant);
    
        // Map the saved entity back to the DTO
        ApiCreateRestaurantDto resultDto = new ApiCreateRestaurantDto();
        resultDto.setId(restaurant.getId());
        resultDto.setUserId(restaurant.getUserEntity().getId());
        resultDto.setAddressId(restaurant.getAddress().getId());
        resultDto.setName(restaurant.getName());
        resultDto.setPhone(restaurant.getPhone());
        resultDto.setEmail(restaurant.getEmail());
        resultDto.setPriceRange(restaurant.getPriceRange());
        resultDto.setActive(restaurant.getActive());
    
        System.out.println(restaurant.getUserEntity().getId());
        System.out.println(restaurant.getAddress().getId());



        return Optional.of(resultDto);
    }
    

    // Fait

    /**
     * Finds a restaurant by its ID.
     *
     * @param id The ID of the restaurant to retrieve.
     * @return An Optional containing the restaurant with the specified ID,
     *         or Optional.empty() if no restaurant is found.
     */
    public Optional<Restaurant> findById(int id) {
        return restaurantRepository.findById(id);
    }

    // Fait

    /**
     * Updates an existing restaurant by ID with the provided data.
     *
     * @param id                  The ID of the restaurant to update.
     * @param updatedRestaurantDto The updated data for the restaurant.
     * @return An Optional containing the updated restaurant's information as an ApiCreateRestaurantDto,
     *         or Optional.empty() if the restaurant with the specified ID is not found or if an error occurs during the update.
     */
    @Transactional
    public Optional<ApiCreateRestaurantDto> updateRestaurant(int id, ApiCreateRestaurantDto updatedRestaurantDto) {
        // Retrieve the restaurant by ID
        Optional<Restaurant> restaurantOptional = restaurantRepository.findById(id);

        if (restaurantOptional.isEmpty()) {
            return Optional.empty();
        }

        // Check if the restaurant exists
        Restaurant restaurant = restaurantOptional.get();

        // Update restaurant fields with the provided data
        restaurant.setName(updatedRestaurantDto.getName());
        restaurant.setPriceRange(updatedRestaurantDto.getPriceRange());
        restaurant.setPhone(updatedRestaurantDto.getPhone());

        // Save the updated restaurant to the database
        restaurantRepository.save(restaurant);

        // Create and populate the response DTO with updated restaurant details
        ApiCreateRestaurantDto restaurantDto = new ApiCreateRestaurantDto();
        restaurantDto.setName(restaurant.getName());
        restaurantDto.setPriceRange(restaurant.getPriceRange());
        restaurantDto.setPhone(restaurant.getPhone());
        restaurantDto.setEmail(restaurant.getEmail());

        // Convert the associated address to ApiAddressDto and add to the response DTO
        Address address = restaurant.getAddress();
        if (address != null) {
            ApiAddressDto addressDto = new ApiAddressDto(address);
            restaurantDto.setAddress(addressDto);
        }
        return Optional.of(restaurantDto);
    }
    

    // Fait

    /**
     * Deletes a restaurant along with its associated data, including its product orders, orders and products.
     *
     * @param restaurantId The ID of the restaurant to delete.
     */
    @Transactional
    public Optional<Restaurant> deleteRestaurant(int restaurantId) {
        // Retrieve the restaurant before deleting
        Optional<Restaurant> restaurantOptional = restaurantRepository.findById(restaurantId);

        if (restaurantOptional.isPresent()) {
            // Delete associated product orders
            productOrderRepository.deleteProductOrdersByOrderId(restaurantId);

            // Delete associated orders
            orderRepository.deleteOrderById(restaurantId);

            // Delete associated products
            productRepository.deleteProductsByRestaurantId(restaurantId);

            // Delete the restaurant
            restaurantRepository.deleteById(restaurantId);

            return restaurantOptional;
        } else {
            return Optional.empty();
        }
    }
}