// package com.rocketFoodDelivery.rocketFood.api;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.rocketFoodDelivery.rocketFood.controller.api.OrderApiController;
// import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderDTO;
// import com.rocketFoodDelivery.rocketFood.dtos.ApiProductForOrderApiDTO;
// import com.rocketFoodDelivery.rocketFood.service.OrderService;

// import org.junit.jupiter.api.Test;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.boot.test.mock.mockito.MockBean;
// import org.springframework.http.MediaType;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
// import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

// import java.util.Collections;

// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyInt;
// import static org.mockito.Mockito.when;

// @SpringBootTest
// @AutoConfigureMockMvc(addFilters = false)
// public class ProductsOrdersApiControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @InjectMocks
//     private OrderApiController orderApiController;

//     @MockBean
//     private com.rocketFoodDelivery.rocketFood.service.ProductService productService;

//     @Mock
//     private OrderService orderService;


//     // Test to get orders (success)
//     @Test
//     void testGetOrders_Success() throws Exception {

//         // Create a single product
//         ApiProductForOrderApiDTO product = new ApiProductForOrderApiDTO();
//         product.setId(29);
//         product.setProduct_name("Chicken Fajitas");
//         product.setQuantity(1);
//         product.setUnit_cost(600);
//         product.setTotal_cost(600);

//         // Create a sample order with a single product
//         ApiOrderDTO order = new ApiOrderDTO();
//         order.setId(1);
//         order.setCustomer_id(10);
//         order.setCustomer_name("Kum Schmitt");
//         order.setCustomer_address("764 Daugherty Center, Yajairaton, 59313-9193");
//         order.setRestaurant_id(7);
//         order.setRestaurant_name("Robel, Crona and Waters");
//         order.setRestaurant_address("38118 Fredericka Island, North Trevamouth, 54474");
//         order.setCourier_id(0);
//         order.setCourier_name("Unknown");
//         order.setStatus("delivered");
//         order.setProducts(Collections.singletonList(product));
//         order.setTotal_cost(600);

//         when(orderService.getOrders()).thenReturn(Collections.singletonList(order));

//         mockMvc.perform(MockMvcRequestBuilders.get("/api/orders")
//                 .contentType(MediaType.APPLICATION_JSON))
//                 .andExpect(MockMvcResultMatchers.status().isOk())
//                 .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(1))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].customer_id").value(10))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].customer_name").value("Kum Schmitt"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].customer_address").value("764 Daugherty Center, Yajairaton, 59313-9193"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].restaurant_id").value(7))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].restaurant_name").value("Robel, Crona and Waters"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].restaurant_address").value("38118 Fredericka Island, North Trevamouth, 54474"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].courier_id").value(0))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].courier_name").value("Unknown"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value("delivered"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].total_cost").value(3600))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].products[0].product_name").value("Chicken Fajitas"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].products[0].quantity").value(1))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].products[0].unit_cost").value(600))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].products[0].total_cost").value(600));
//     }

//     // Test to get orders (invalid user type)
//     @Test
//     public void testGetOrders_InvalidUserType() throws Exception {
//         // Perform the request with an invalid user type
//         mockMvc.perform(MockMvcRequestBuilders.get("/api/orders")
//                 .param("type", "invalidType")
//                 .param("id", "1")
//                 .contentType(MediaType.APPLICATION_JSON))
//                 .andExpect(MockMvcResultMatchers.status().isUnprocessableEntity())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Invalid user type"));
//     }

//     // Test to get orders (invalid user id)
//     @Test
//     public void testGetOrders_InvalidUserId() throws Exception {
//     // Mock service behavior for a valid type but invalid ID
//     when(orderService.customerExists(anyInt())).thenReturn(false);
    
//     // Perform the request with a valid user type but invalid ID
//     mockMvc.perform(MockMvcRequestBuilders.get("/api/orders")
//             .param("type", "customer")
//             .param("id", "999") // Assume 999 is an invalid ID
//             .contentType(MediaType.APPLICATION_JSON))
//             .andExpect(MockMvcResultMatchers.status().isUnprocessableEntity())
//             .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Invalid user id"));
//     }

//     // Test to get orders (missing parametters)
//     @Test
//     public void testGetOrders_MissingParameters() throws Exception {
//         mockMvc.perform(MockMvcRequestBuilders.get("/api/orders")
//         .param("id", "1")
//         .contentType(MediaType.APPLICATION_JSON))
//         .andExpect(MockMvcResultMatchers.status().isBadRequest())
//         .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Both 'user type' and 'id' parameters are required"));
//     }

//     // Test to create an Order (201 status)
//     @Test
//     void testCreateOrder_Success() throws Exception {

//     // Create a single product for the order
//     ApiProductForOrderApiDTO product = new ApiProductForOrderApiDTO();
//     product.setId(1);
//     product.setQuantity(2);

//     // Create a sample ApiOrderDTO with the necessary details
//     ApiOrderDTO orderDTO = new ApiOrderDTO();
//     orderDTO.setCustomer_id(1);
//     orderDTO.setRestaurant_id(1);
//     orderDTO.setProducts(Collections.singletonList(product));


//     // Perform the POST request and verify the status and response
//     mockMvc.perform(MockMvcRequestBuilders.post("/api/orders")
//             .contentType(MediaType.APPLICATION_JSON)
//             .content(asJsonString(orderDTO))) // Convert the request body to JSON
//             .andExpect(MockMvcResultMatchers.status().isCreated()) // Check for 201 Created status
//             .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(70))
//             .andExpect(MockMvcResultMatchers.jsonPath("$.customer_id").value(1))
//             .andExpect(MockMvcResultMatchers.jsonPath("$.customer_name").value("Melisa Collier"))
//             .andExpect(MockMvcResultMatchers.jsonPath("$.restaurant_id").value(1))
//             .andExpect(MockMvcResultMatchers.jsonPath("$.restaurant_name").value("Updated Name"))
//             .andExpect(MockMvcResultMatchers.jsonPath("$.courier_name").value("Unknown"));
//     }

//     // Test to create an Order with missing required filds
//     @Test
//     void testCreateOrder_MissingRequiredFields() throws Exception {
//         // Créer un ApiOrderDTO avec des champs manquants
//         ApiOrderDTO orderDTO = new ApiOrderDTO();
//         orderDTO.setCustomer_id(0); // ID client manquant
//         orderDTO.setRestaurant_id(0); // ID restaurant manquant
//         orderDTO.setProducts(null); // Produits manquants
    
//         // Effectuer une requête POST et vérifier que le statut est 400 Bad Request
//         mockMvc.perform(MockMvcRequestBuilders.post("/api/orders")
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(asJsonString(orderDTO)))
//                 .andExpect(MockMvcResultMatchers.status().isBadRequest()) // Vérifie que le statut est 400
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Restaurant ID, customer ID, and products are required"));
//     }
    
//     // Test to create an Order with an Invalid restaurant ID/customer ID
//     @Test
//     void testCreateOrder_InvalidRestaurantOrCustomerId() throws Exception {
//         // Créer un ApiOrderDTO avec des IDs invalides
//         ApiProductForOrderApiDTO product = new ApiProductForOrderApiDTO();
//         product.setId(1);
//         product.setQuantity(2);

//         ApiOrderDTO orderDTO = new ApiOrderDTO();
//         orderDTO.setCustomer_id(999); // ID client invalide
//         orderDTO.setRestaurant_id(999); // ID restaurant invalide
//         orderDTO.setProducts(Collections.singletonList(product));

//         // Simuler le comportement du service pour lever une exception
//         when(orderService.createOrder(any(ApiOrderDTO.class)))
//                 .thenThrow(new RuntimeException("Customer not found for ID: 999"));

//         // Effectuer une requête POST et vérifier que le statut est 422 Unprocessable Entity
//         mockMvc.perform(MockMvcRequestBuilders.post("/api/orders")
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(asJsonString(orderDTO)))
//                 .andExpect(MockMvcResultMatchers.status().isUnprocessableEntity()) // Vérifie que le statut est 422
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Invalid restaurant or customer ID"));
//     }

//     // Test to create an Order with an Invalid product ID
//     @Test
//     void testCreateOrder_InvalidProductId() throws Exception {
//     // Créer un ApiProductForOrderApiDTO avec un ID de produit invalide
//     ApiProductForOrderApiDTO product = new ApiProductForOrderApiDTO();
//     product.setId(999); // ID produit invalide
//     product.setQuantity(2);

//     ApiOrderDTO orderDTO = new ApiOrderDTO();
//     orderDTO.setCustomer_id(1);
//     orderDTO.setRestaurant_id(1);
//     orderDTO.setProducts(Collections.singletonList(product));

//     // Simuler le comportement du service pour lever une exception
//     when(orderService.createOrder(any(ApiOrderDTO.class)))
//             .thenThrow(new RuntimeException("Product not found for ID: 999"));

//     // Effectuer une requête POST et vérifier que le statut est 422 Unprocessable Entity
//     mockMvc.perform(MockMvcRequestBuilders.post("/api/orders")
//             .contentType(MediaType.APPLICATION_JSON)
//             .content(asJsonString(orderDTO)))
//             .andExpect(MockMvcResultMatchers.status().isUnprocessableEntity()) // Vérifie que le statut est 422
//             .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Invalid product ID"));
//     }

//     // Utility method to convert an object to a JSON string
//     private static String asJsonString(final Object obj) {
//         try {
//             return new ObjectMapper().writeValueAsString(obj);
//         } catch (Exception e) {
//             throw new RuntimeException(e);
//         }
//     }

// }
