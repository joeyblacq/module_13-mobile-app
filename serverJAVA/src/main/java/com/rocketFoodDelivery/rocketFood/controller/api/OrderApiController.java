package com.rocketFoodDelivery.rocketFood.controller.api;

import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderDTO;
import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderRatingDTO;
import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderStatusDTO;
import com.rocketFoodDelivery.rocketFood.service.OrderService;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for Orders used by the mobile app.
 */
@RestController
@RequestMapping("/api")
public class OrderApiController {

    private static final Logger logger = LoggerFactory.getLogger(OrderApiController.class);

    @Autowired
    private OrderService orderService;

    /**
     * Handles the retrieval of orders based on user type and ID.
     * Examples:
     *   GET /api/orders                      → all orders
     *   GET /api/orders?type=courier&id=2    → orders for courier 2
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "id", required = false) Integer id) {

        List<ApiOrderDTO> orders;

        // No params → all orders
        if (type == null && id == null) {
            orders = orderService.getOrders();
        } else if (type == null || id == null) {
            // one of them missing
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error",
                            "Both 'user type' and 'id' parameters are required"));
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
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);
    }

    /**
     * Updates the status of a specific order.
     *
     * This is what the courier app calls:
     *  PUT /api/orders/{id}/status
     *  { "status": "pending" | "in progress" | "delivered" }
     */
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Object> updateOrderStatus(
            @PathVariable("id") int orderId,
            @RequestBody ApiOrderStatusDTO statusDTO) {

        logger.info("Updating status for order {} → payload: {}", orderId, statusDTO);

        // Validate body
        if (statusDTO == null || statusDTO.getStatus() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad request",
                    "details", "Status cannot be null"
            ));
        }

        // Accept upper- or lower-case and spaces, normalize
        String rawStatus = statusDTO.getStatus();
        String normalized = rawStatus.toLowerCase(Locale.ROOT).trim();

        if (!normalized.equals("pending")
                && !normalized.equals("in progress")
                && !normalized.equals("delivered")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid status",
                    "details", "Status must be 'pending', 'in progress', or 'delivered'"
            ));
        }

        // Update the DTO with normalized value (if your service expects it)
        statusDTO.setStatus(normalized);

        boolean isUpdated = orderService.updateOrderStatus(orderId, statusDTO);

        if (!isUpdated) {
            logger.warn("Order {} not found or status not updated", orderId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Resource not found",
                    "details", "Order with id " + orderId + " not found"
            ));
        }

        logger.info("Order {} status successfully updated to {}", orderId, normalized);
        return ResponseEntity.ok(Map.of("status", normalized));
    }

    /**
     * Creates an order (used by the customer app).
     */
    @PostMapping("/orders")
    public ResponseEntity<Object> createOrder(@RequestBody ApiOrderDTO apiOrderDTO) {
        try {
            // Basic validation
            if (apiOrderDTO.getCustomer_id() == 0
                    || apiOrderDTO.getRestaurant_id() == 0
                    || apiOrderDTO.getProducts() == null
                    || apiOrderDTO.getProducts().isEmpty()) {

                return new ResponseEntity<>(
                        Map.of("error", "Restaurant ID, customer ID, and products are required"),
                        HttpStatus.BAD_REQUEST);
            }

            ApiOrderDTO createdOrderDTO;
            try {
                createdOrderDTO = orderService.createOrder(apiOrderDTO);
            } catch (RuntimeException e) {
                logger.error("Error while creating order", e);
                if (e.getMessage() != null) {
                    if (e.getMessage().contains("Customer not found")
                            || e.getMessage().contains("Restaurant not found")) {
                        return new ResponseEntity<>(
                                Map.of("error", "Invalid restaurant or customer ID"),
                                HttpStatus.UNPROCESSABLE_ENTITY);
                    } else if (e.getMessage().contains("Product not found")) {
                        return new ResponseEntity<>(
                                Map.of("error", "Invalid product ID"),
                                HttpStatus.UNPROCESSABLE_ENTITY);
                    }
                }
                return new ResponseEntity<>(
                        Map.of("error", "An unexpected error occurred"),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }

            return new ResponseEntity<>(createdOrderDTO, HttpStatus.CREATED);

        } catch (Exception e) {
            logger.error("Exception occurred while creating order", e);
            return new ResponseEntity<>(
                    Map.of("error", "An error occurred while processing your request"),
                    HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Gets a single order by id.
     */
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") int orderId) {
        ApiOrderDTO orderDTO = orderService.getOrderById(orderId);

        if (orderDTO == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Order not found"));
        }

        return ResponseEntity.ok(orderDTO);
    }

    /**
     * Updates the rating of an order.
     *
     * PUT /api/orders/{id}/rating
     * { "rating": 1..5 }
     */
    @PutMapping("/orders/{id}/rating")
    public ResponseEntity<Object> updateOrderRating(
            @PathVariable("id") int orderId,
            @RequestBody ApiOrderRatingDTO ratingDTO) {

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
