package com.rocketFoodDelivery.rocketFood.controller.api;

import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderDTO;
import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderRatingDTO;
import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderStatusDTO;
import com.rocketFoodDelivery.rocketFood.service.OrderService;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class OrderApiController {
 
    private static final Logger logger = LoggerFactory.getLogger(OrderApiController.class);

    
    @Autowired
    private OrderService orderService;

    // Handles the retrieval of orders based on user type and ID
    @GetMapping("/api/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "id", required = false) Integer id) {
    
        List<ApiOrderDTO> orders;
    
        // Check if both 'type' and 'id' parameters are provided
        if (type == null && id == null) {
            orders = orderService.getOrders(); // Retrieve all orders
        } else if (type == null || id == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Both 'user type' and 'id' parameters are required"));
        } else {
            // Validate user type and fetch orders accordingly
            switch (type.toLowerCase()) {
                case "customer":
                    if (!orderService.customerExists(id)) {
                        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                                .body(Collections.singletonMap("error", "Invalid user id"));
                    }
                    orders = orderService.getOrdersByCustomerId(id);
                    break;
                case "restaurant":
                    if (!orderService.restaurantExists(id)) {
                        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                                .body(Collections.singletonMap("error", "Invalid user id"));
                    }
                    orders = orderService.getOrdersByRestaurantId(id);
                    break;
                case "courier":
                    if (!orderService.courierExists(id)) {
                        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                                .body(Collections.singletonMap("error", "Invalid user id"));
                    }
                    orders = orderService.getOrdersByCourierId(id);
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                            .body(Collections.singletonMap("error", "Invalid user type"));
            }
        }
    
        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build(); // No orders found
        }
    
        return ResponseEntity.ok(orders); // Return orders with a 200 OK status
    }

    // Updates the status of a specific order
    @PutMapping("api/order/{id}/status")
    public ResponseEntity<Object> updateOrderStatus(
            @PathVariable("id") int orderId,
            @RequestBody ApiOrderStatusDTO statusDTO) {
    
        // Validate statusDTO
        if (statusDTO == null || statusDTO.getStatus() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Bad request",
                "details", "Status cannot be null"
            ));
        }
    
        // Validate if the status is one of the allowed values
        String status = statusDTO.getStatus();
        if (!status.equals("pending") && !status.equals("in progress") && !status.equals("delivered")) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid status",
                "details", "Status must be 'pending', 'in progress', or 'delivered'"
            ));
        }
    
        // Attempt to update the order status
        boolean isUpdated = orderService.updateOrderStatus(orderId, statusDTO);
    
        // Handle cases where the order wasn't found or status wasn't updated
        if (!isUpdated) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Resource not found",
                "details", "Order with id " + orderId + " not found"
            ));
        }
    
        // Return a successful response with the updated status
        return ResponseEntity.ok(Map.of("status", statusDTO.getStatus()));
    }
    
  
    // Create an order
    @PostMapping("/api/orders")
    public ResponseEntity<Object> createOrder(@RequestBody ApiOrderDTO apiOrderDTO) {
        try {
            // Validate the request body to ensure necessary fields are present
            if (apiOrderDTO.getCustomer_id() == 0 || 
                apiOrderDTO.getRestaurant_id() == 0 || 
                apiOrderDTO.getProducts() == null || 
                apiOrderDTO.getProducts().isEmpty()) {
                
                // Return a 400 Bad Request with a specific error message
                return new ResponseEntity<>(Map.of("error", "Restaurant ID, customer ID, and products are required"), HttpStatus.BAD_REQUEST);
            }

            // Call the service to create the order
            ApiOrderDTO createdOrderDTO;
            try {
                createdOrderDTO = orderService.createOrder(apiOrderDTO);
            } catch (RuntimeException e) {
                // Handle specific exceptions from the service layer
                if (e.getMessage().contains("Customer not found") || e.getMessage().contains("Restaurant not found")) {
                    return new ResponseEntity<>(Map.of("error", "Invalid restaurant or customer ID"), HttpStatus.UNPROCESSABLE_ENTITY);
                } else if (e.getMessage().contains("Product not found")) {
                    return new ResponseEntity<>(Map.of("error", "Invalid product ID"), HttpStatus.UNPROCESSABLE_ENTITY);
                } else {
                    // Log the exception and return a 500 Internal Server Error
                    logger.error("Unexpected error occurred while creating order", e);
                    return new ResponseEntity<>(Map.of("error", "An unexpected error occurred"), HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }



            // Return the ApiOrderDTO in the response with a 201 Created status
            return new ResponseEntity<>(createdOrderDTO, HttpStatus.CREATED);

        } catch (Exception e) {
            // Log the exception and return a 400 Bad Request as a fallback
            logger.error("Exception occurred while creating order", e);
            return new ResponseEntity<>(Map.of("error", "An error occurred while processing your request"), HttpStatus.BAD_REQUEST);
        }
    }
    


    @GetMapping("/api/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") int orderId) {
    // Appeler le service pour récupérer les détails de la commande
    ApiOrderDTO orderDTO = orderService.getOrderById(orderId);
    
    // Vérifier si la commande existe
    if (orderDTO == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body(Collections.singletonMap("error", "Order not found"));
    }

    // Retourner les détails de la commande
    return ResponseEntity.ok(orderDTO);
    }

    @PutMapping("api/order/{id}/rating")
    public ResponseEntity<Object> updateOrderRating(
            @PathVariable("id") int orderId,
            @RequestBody ApiOrderRatingDTO ratingDTO) {

        // Valider ratingDTO
        if (ratingDTO == null || ratingDTO.getRating() < 1 || ratingDTO.getRating() > 5) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Bad request",
                "details", "Rating must be between 1 and 5"
            ));
        }

        boolean isUpdated = orderService.updateOrderRating(orderId, ratingDTO.getRating());

        if (!isUpdated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Resource not found",
                "details", "Order with id " + orderId + " not found"
            ));
        }

        return ResponseEntity.ok(Map.of("rating", ratingDTO.getRating()));
    }
}

