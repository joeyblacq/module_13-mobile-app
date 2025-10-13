package com.rocketFoodDelivery.rocketFood;

import com.rocketFoodDelivery.rocketFood.models.*;
import com.rocketFoodDelivery.rocketFood.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final ProductOrderRepository productOrderRepository;
    private final ProductRepository productRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final OrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final CourierStatusRepository courierStatusRepository;
    private final CourierRepository courierRepository;

    @Autowired
    public DataSeeder(UserRepository userRepository,
                      RestaurantRepository restaurantRepository,
                      ProductOrderRepository productOrderRepository,
                      ProductRepository productRepository,
                      OrderStatusRepository orderStatusRepository,
                      OrderRepository orderRepository,
                      EmployeeRepository employeeRepository,
                      CustomerRepository customerRepository,
                      AddressRepository addressRepository,
                      CourierStatusRepository courierStatusRepository,
                      CourierRepository courierRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.productOrderRepository = productOrderRepository;
        this.productRepository = productRepository;
        this.orderStatusRepository = orderStatusRepository;
        this.orderRepository = orderRepository;
        this.employeeRepository = employeeRepository;
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.courierStatusRepository = courierStatusRepository;
        this.courierRepository = courierRepository;
    }

    @PostConstruct
    @Transactional
    public void seedData() {
        if (userRepository.count() > 0) {
            System.out.println("Data already seeded, skipping...");
            return;
        }
        System.out.println("Starting data seeding...");
        seedAddresses();
        seedUsers();
        seedRestaurants();
        seedOrderStatuses();
        seedEmployees();
        seedCustomers();
        seedProducts();
        seedOrdersAndProductOrders();
        seedCourierStatuses();
        seedCouriers();
        System.out.println("Data seeding completed!");
    }

    @Transactional
    private void seedUsers() {
        List<UserEntity> users = Arrays.asList(
            UserEntity.builder().name("Erica Ger").email("erica.ger@gmail.com").password("password").build(),
            UserEntity.builder().name("John Doe").email("john.doe@example.com").password("password").build(),
            UserEntity.builder().name("Jane Doe").email("jane.doe@example.com").password("password").build()
        );
        userRepository.saveAll(users);
        System.out.println("Seeded " + users.size() + " users");
    }

    private void seedAddresses() {
        List<Address> addresses = Arrays.asList(
            Address.builder().streetAddress("123 Main St").city("Anytown").postalCode("12345").build(),
            Address.builder().streetAddress("456 Elm St").city("Othertown").postalCode("67890").build(),
            Address.builder().streetAddress("1 Main St").city("t1").postalCode("12345").build(),
            Address.builder().streetAddress("3 Main St").city("t2").postalCode("12345").build(),
            Address.builder().streetAddress("4 Main St").city("t3").postalCode("12345").build(),
            Address.builder().streetAddress("4 Main St").city("t4").postalCode("12345").build()

        );
        addressRepository.saveAll(addresses);
    }

    private void seedRestaurants() {
        List<UserEntity> users = userRepository.findAll();
        List<Address> addresses = addressRepository.findAll();
        List<Restaurant> restaurants = Arrays.asList(
            Restaurant.builder().userEntity(users.get(1)).address(addresses.get(0)).name("Greek").phone("+1 555-1234").email("contact@restaurantA.com").priceRange(2).active(true).build(),
            Restaurant.builder().userEntity(users.get(1)).address(addresses.get(1)).name("Japanese").phone("+1 555-1234").email("contact@restaurantA.com").priceRange(2).active(true).build(),
            Restaurant.builder().userEntity(users.get(1)).address(addresses.get(2)).name("Pasta").phone("+1 555-1234").email("contact@restaurantA.com").priceRange(2).active(true).build(),
            Restaurant.builder().userEntity(users.get(1)).address(addresses.get(3)).name("Pizza").phone("+1 555-1234").email("contact@restaurantA.com").priceRange(2).active(true).build(),
            Restaurant.builder().userEntity(users.get(1)).address(addresses.get(4)).name("Southeast").phone("+1 555-1234").email("contact@restaurantA.com").priceRange(2).active(true).build(),
            Restaurant.builder().userEntity(users.get(2)).address(addresses.get(5)).name("Viet").phone("+1 555-5678").email("contact@restaurantB.com").priceRange(3).active(true).build()
        );
        restaurantRepository.saveAll(restaurants);
    }

    private void seedProducts() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<Product> products = Arrays.asList(
            Product.builder().restaurant(restaurants.get(0)).name("Burger").description("Delicious beef burger").cost(11).build(),
            Product.builder().restaurant(restaurants.get(1)).name("Pizza").description("Cheese and tomato pizza").cost(13).build(),
            Product.builder().restaurant(restaurants.get(2)).name("Wrap").description("description1").cost(7).build(),
            Product.builder().restaurant(restaurants.get(3)).name("Poutine").description("description2").cost(12).build(),
            Product.builder().restaurant(restaurants.get(4)).name("Spag").description("description3").cost(14).build(),
            Product.builder().restaurant(restaurants.get(5)).name("Sandwich").description("description4").cost(10).build()
        );
        productRepository.saveAll(products);
    }

    private void seedOrderStatuses() {
        List<OrderStatus> orderStatuses = Arrays.asList(
            OrderStatus.builder().name("pending").build(),
            OrderStatus.builder().name("in progress").build(),
            OrderStatus.builder().name("delivered").build()
        );
        orderStatusRepository.saveAll(orderStatuses);
    }

    private void seedOrdersAndProductOrders() {
        List<Order> orders = Arrays.asList(
            Order.builder().restaurant(restaurantRepository.findAll().get(0)).customer(customerRepository.findAll().get(0)).order_status(orderStatusRepository.findAll().get(0)).restaurant_rating(4).build(),
            Order.builder().restaurant(restaurantRepository.findAll().get(1)).customer(customerRepository.findAll().get(1)).order_status(orderStatusRepository.findAll().get(1)).restaurant_rating(5).build(),
            Order.builder().restaurant(restaurantRepository.findAll().get(2)).customer(customerRepository.findAll().get(0)).order_status(orderStatusRepository.findAll().get(0)).restaurant_rating(1).build(),
            Order.builder().restaurant(restaurantRepository.findAll().get(3)).customer(customerRepository.findAll().get(1)).order_status(orderStatusRepository.findAll().get(0)).restaurant_rating(2).build(),
            Order.builder().restaurant(restaurantRepository.findAll().get(4)).customer(customerRepository.findAll().get(0)).order_status(orderStatusRepository.findAll().get(0)).restaurant_rating(3).build(),
            Order.builder().restaurant(restaurantRepository.findAll().get(5)).customer(customerRepository.findAll().get(1)).order_status(orderStatusRepository.findAll().get(0)).restaurant_rating(5).build()

        );
        orders.forEach(order -> {
            orderRepository.save(order);
            List<Product> products = productRepository.findByRestaurantId(order.getRestaurant().getId());
            products.forEach(product -> {
                ProductOrder productOrder = ProductOrder.builder()
                    .product(product)
                    .order(order)
                    .product_quantity(2)
                    .product_unit_cost(product.getCost())
                    .build();
                productOrderRepository.save(productOrder);
            });
        });
    }

    private void seedEmployees() {
        List<UserEntity> users = userRepository.findAll();
        List<Address> addresses = addressRepository.findAll();
        List<Employee> employees = Arrays.asList(
            Employee.builder().userEntity(users.get(0)).address(addresses.get(0)).email("employeeA@example.com").phone("+1 555-1111").build(),
            Employee.builder().userEntity(users.get(1)).address(addresses.get(1)).email("employeeB@example.com").phone("+1 555-2222").build()
        );
        employeeRepository.saveAll(employees);
    }

    private void seedCustomers() {
        List<UserEntity> users = userRepository.findAll();
        List<Address> addresses = addressRepository.findAll();
        List<Customer> customers = Arrays.asList(
            Customer.builder().userEntity(users.get(0)).address(addresses.get(0)).email("customerA@example.com").phone("+1 555-3333").build(),
            Customer.builder().userEntity(users.get(1)).address(addresses.get(1)).email("customerB@example.com").phone("+1 555-4444").build()

        );
        customerRepository.saveAll(customers);
    }

    private void seedCourierStatuses() {
        List<CourierStatus> courierStatuses = Arrays.asList(
            CourierStatus.builder().name("free").build(),
            CourierStatus.builder().name("busy").build(),
            CourierStatus.builder().name("full").build(),
            CourierStatus.builder().name("offline").build()
        );
        courierStatusRepository.saveAll(courierStatuses);
    }

    private void seedCouriers() {
        List<UserEntity> users = userRepository.findAll();
        List<Address> addresses = addressRepository.findAll();
        List<CourierStatus> statuses = courierStatusRepository.findAll();
        List<Courier> couriers = Arrays.asList(
            Courier.builder().userEntity(users.get(0)).address(addresses.get(0)).email("courierA@example.com").phone("+1 555-5555").courierStatus(statuses.get(2)).build(),
            Courier.builder().userEntity(users.get(2)).address(addresses.get(1)).email("courierB@example.com").phone("+1 555-6666").courierStatus(statuses.get(1)).build()
        );
        courierRepository.saveAll(couriers);
    }
}
