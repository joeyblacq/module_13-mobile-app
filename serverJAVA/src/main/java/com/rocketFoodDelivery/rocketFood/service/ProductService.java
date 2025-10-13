package com.rocketFoodDelivery.rocketFood.service;

import com.rocketFoodDelivery.rocketFood.models.Product;
import com.rocketFoodDelivery.rocketFood.repository.ProductRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ProductService {
    @PersistenceContext
    private EntityManager entityManager;
    ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository){
        this.productRepository = productRepository;
    }

    // Retrieves all products from the repository.
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Retrieves products associated with a specific restaurant ID.
    public List<Product> getProductsByRestaurantId(int restaurantId) {
        return productRepository.findProductsByRestaurantId(restaurantId);
    }
}