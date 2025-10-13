package com.rocketFoodDelivery.rocketFood.service;

import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderDTO;
import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderStatusDTO;
import com.rocketFoodDelivery.rocketFood.dtos.ApiProductForOrderApiDTO;
import com.rocketFoodDelivery.rocketFood.exception.ResourceNotFoundException;
import com.rocketFoodDelivery.rocketFood.models.*;
import com.rocketFoodDelivery.rocketFood.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderStatusRepository orderStatusRepository;
    
    @Autowired
    private CourierRepository courierRepository;

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductOrderRepository productOrderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        ProductOrderRepository productOrderRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productOrderRepository = productOrderRepository;
    }

    // Updates the status of an order
    public boolean updateOrderStatus(int orderId, ApiOrderStatusDTO statusDTO) {
        // Trouver la commande par ID
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return false; // Commande non trouvée
        }
    
        // Trouver le statut par nom (au lieu de par ID)
        OrderStatus newStatus = orderStatusRepository.findByName(statusDTO.getStatus()).orElse(null);
        if (newStatus == null) {
            return false; // Statut non trouvé
        }
    
        // Mettre à jour le statut de la commande
        order.setOrderStatus(newStatus);
        orderRepository.save(order);
    
        return true;
    }
    
    // Retrieves all orders and converts them to DTOs
    public List<ApiOrderDTO> getOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::convertToApiOrderDTO)
                .collect(Collectors.toList());
    }

    // Converts an Order entity to an ApiOrderDTO
    private ApiOrderDTO convertToApiOrderDTO(Order order) {
        ApiOrderDTO dto = new ApiOrderDTO();
        dto.setId(order.getId());
        dto.setCustomer_id(order.getCustomer().getId());
        dto.setCustomer_name(getUserNameByCustomerId(order.getCustomer().getId()));
        dto.setCustomer_address(formatAddress(order.getCustomer().getAddress()));
    
        // Set courier details if available
        if (order.getCourier() != null) {
            dto.setCourier_id(order.getCourier().getId());
            dto.setCourier_name(getUserNameByCourierId(order.getCourier().getId()));
        } else {
            dto.setCourier_id(0); // Default value for orders without an assigned courier
            dto.setCourier_name("Unknown"); // Default value for orders without an assigned courier
        }
    
        dto.setRestaurant_id(order.getRestaurant().getId());
        dto.setRestaurant_name(order.getRestaurant().getName());
        dto.setRestaurant_address(formatAddress(order.getRestaurant().getAddress()));
        dto.setStatus(order.getOrderStatus().getStatus());
    
        // Retrieve and calculate the cost of products for the order
        List<ApiProductForOrderApiDTO> productsForOrder = getProductsForOrder(order);
        dto.setProducts(productsForOrder);
    
        long totalCost = productsForOrder.stream()
                .mapToLong(ApiProductForOrderApiDTO::getTotal_cost)
                .sum();
        dto.setTotal_cost(totalCost);

        dto.setTimestamp(order.getTimestamp());
    
        return dto;
    }
    
    // Retrieves products for a specific order
    private List<ApiProductForOrderApiDTO> getProductsForOrder(Order order) {
        List<ProductOrder> productOrders = productOrderRepository.findByOrderId(order.getId());
        return productOrders.stream()
                .map(this::convertToApiProductForOrderApiDTO)
                .collect(Collectors.toList());
    }

    // Converts a ProductOrder entity to an ApiProductForOrderApiDTO
    private ApiProductForOrderApiDTO convertToApiProductForOrderApiDTO(ProductOrder productOrder) {
        ApiProductForOrderApiDTO dto = new ApiProductForOrderApiDTO();
        Product product = productRepository.findById(productOrder.getProduct().getId()).orElse(null);

        if (product != null) {
            dto.setId(product.getId());
            dto.setProduct_name(product.getName());
            dto.setQuantity(productOrder.getProductQuantity());
            dto.setUnit_cost(productOrder.getProductUnitCost());
            dto.setTotal_cost(productOrder.getProductQuantity() * productOrder.getProductUnitCost());
        } else {
            // Handle case where the product is not found
            dto.setProduct_name("Unknown Product");
            dto.setQuantity(0);
            dto.setUnit_cost(0);
            dto.setTotal_cost(0);
        }

        return dto;
    }

    // Retrieves the username for a given customer ID
    private String getUserNameByCustomerId(int customerId) {
        return userRepository.findById(customerId)
                .map(UserEntity::getName)
                .orElse("Unknown");
    }

    // Formats an address into a string
    private String formatAddress(com.rocketFoodDelivery.rocketFood.models.Address address) {
        if (address == null) {
            return "Address not available"; // Address is null
        }
        return address.getStreetAddress() + ", " + address.getCity() + ", " + address.getPostalCode();
    }

    // Retrieves the username for a given courier ID
    private String getUserNameByCourierId(int courierId) {
        return userRepository.findById(courierId)
                .map(UserEntity::getName)
                .orElse("Unknown");
    }

    // Retrieves orders by customer ID
    public List<ApiOrderDTO> getOrdersByCustomerId(int customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        return orders.stream()
                .map(this::convertToApiOrderDTO)
                .collect(Collectors.toList());
    }

    // Retrieves orders by restaurant ID
    public List<ApiOrderDTO> getOrdersByRestaurantId(int restaurantId) {
        List<Order> orders = orderRepository.findByRestaurantId(restaurantId);
        return orders.stream()
                .map(this::convertToApiOrderDTO)
                .collect(Collectors.toList());
    }

    // Retrieves orders by courier ID
    public List<ApiOrderDTO> getOrdersByCourierId(int courierId) {
        List<Order> orders = orderRepository.findByCourierId(courierId);
        return orders.stream()
                .map(this::convertToApiOrderDTO)
                .collect(Collectors.toList());
    }
    
    // Checks if a customer with the given ID exists
    public boolean customerExists(Integer customerId) {
        return customerRepository.existsById(customerId);
    }
    
    // Checks if a restaurant with the given ID exists
    public boolean restaurantExists(Integer restaurantId) {
        return restaurantRepository.existsById(restaurantId);
    }
    
    // Checks if a courier with the given ID exists
    public boolean courierExists(Integer courierId) {
        return courierRepository.existsById(courierId);
    }

    public ApiOrderDTO createOrder(ApiOrderDTO apiOrderDTO) {
        try {
            // Create a new Order entity
            Order order = new Order();
            
            // Fetch Customer and Restaurant entities from the database
            Customer customer = customerRepository.findById(apiOrderDTO.getCustomer_id()).orElseThrow(
                () -> new RuntimeException("Customer not found for ID: " + apiOrderDTO.getCustomer_id())
            );
            Restaurant restaurant = restaurantRepository.findById(apiOrderDTO.getRestaurant_id()).orElseThrow(
                () -> new RuntimeException("Restaurant not found for ID: " + apiOrderDTO.getRestaurant_id())
            );
            
            // Fetch OrderStatus from the database or set a default one
            OrderStatus status = orderStatusRepository.findById(1).orElseThrow(
                () -> new RuntimeException("Order status not found for ID: " + 1)
            );
        
            // Set the customer and restaurant details in the Order entity
            order.setCustomer(customer);
            order.setRestaurant(restaurant);
        
            // Set default or valid restaurant rating
            order.setRestaurant_rating(1); // Adjust this as needed
        
            // Set the initial status of the order
            order.setOrderStatus(status); // Default status, could be updated later
        
            // Process the products
            List<ProductOrder> productOrders = apiOrderDTO.getProducts().stream()
                .map(productDto -> {
                    // Fetch the product entity from the database using the product ID
                    Product product = productRepository.findById(productDto.getId()).orElseThrow(
                        () -> new RuntimeException("Product not found for ID: " + productDto.getId())
                    );
                
                    // Create a ProductOrder
                    return ProductOrder.builder()
                        .order(order)
                        .product(product)
                        .product_quantity(productDto.getQuantity())
                        .product_unit_cost(product.getCost()) // Use the cost from the Product entity
                        .build();
                })
                .collect(Collectors.toList());
            
            // Set the products in the Order entity
            order.setProductOrders(productOrders);
            
            // Save the order in the database
            orderRepository.save(order);
            
            // Convert the saved order to ApiOrderDTO for the response
            ApiOrderDTO createdOrderDTO = convertToApiOrderDTO(order);
            
            // Send a notification email-
            if (apiOrderDTO.isSendEmail()) {
                notificationService.sendEmailNotification(
                    customer.getEmail(),
                    createdOrderDTO
                );
            }
        
            // Send an SMS notification if requested
            if (apiOrderDTO.isSendSMS()) {
                String message = "Thank you, " + customer.getUserEntity().getName() + "!\n" + "We have received your Order (ID: #" + createdOrderDTO.getId() + ") for the restaurant: " + createdOrderDTO.getRestaurant_name() + " and with a total cost of " + createdOrderDTO.getTotal_cost() + "$. We are currently processing your order and will soon be on our way to deliver to you."; // Customize the message
                notificationService.sendSmsNotification(
                    customer.getPhone(),
                    message
                );
            }
        
        
            return createdOrderDTO;
        
        } catch (RuntimeException e) {
            // Log the exception and rethrow or handle as needed
            System.err.println("Error creating order: " + e.getMessage());
            throw e; // Or handle the exception as needed
        }
    }

    public ApiOrderDTO getOrderById(int orderId) {
        // Récupérer la commande depuis le repository
        Order order = orderRepository.findById(orderId).orElse(null);
        
        // Vérifier si la commande existe
        if (order == null) {
            return null;
        }
        
        // Convertir l'entité Order en DTO et retourner
        return convertToApiOrderDTO(order);
    }

    public String getCustomerEmail(int customerId) {
        return userRepository.findById(customerId)
                .map(UserEntity::getEmail)
                .orElse(null);
        
    }

    public boolean updateOrderRating(int orderId, int newRating) {
        // Trouver l'ordre par ID
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        // Mettre à jour le rating
        order.setRestaurant_rating(newRating);
        orderRepository.save(order);
        return true;
    }

}
    
    

