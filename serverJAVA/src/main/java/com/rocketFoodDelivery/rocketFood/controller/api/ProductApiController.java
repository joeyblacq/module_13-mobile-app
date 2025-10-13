package com.rocketFoodDelivery.rocketFood.controller.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

import com.rocketFoodDelivery.rocketFood.dtos.ApiProductDTO;
import com.rocketFoodDelivery.rocketFood.models.Product;
import com.rocketFoodDelivery.rocketFood.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductApiController {
    private final ProductService productService;

    @Autowired
    public ProductApiController(ProductService productService) {
        this.productService = productService;
    }

    // Handles GET requests to retrieve a list of products
    @GetMapping
    public ResponseEntity<Object> getProducts(
            @RequestParam(value = "restaurant", required = false) Integer restaurantId) {
        List<ApiProductDTO> productDtos;

        // Check if a restaurant ID is provided
        if (restaurantId != null) {
            // Fetch products for the specified restaurant ID
            List<Product> products = productService.getProductsByRestaurantId(restaurantId);

            // Return 404 if no products are found for the given restaurant ID
            if (products.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "Resource not found",
                        "details", "No products found for restaurant ID " + restaurantId));
            }

            // Map Product entities to ApiProductDTO
            productDtos = products.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } else {
            // Fetch all products if no restaurant ID is provided
            List<Product> products = productService.getAllProducts();

            // Map Product entities to ApiProductDTO
            productDtos = products.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        // Return the list of ApiProductDTOs
        return ResponseEntity.ok(productDtos);
    }

    // Converts a Product entity
    private ApiProductDTO convertToDto(Product product) {
        ApiProductDTO dto = new ApiProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setCost(product.getCost());
        dto.setDescription(product.getDescription());
        return dto;
    }
}
