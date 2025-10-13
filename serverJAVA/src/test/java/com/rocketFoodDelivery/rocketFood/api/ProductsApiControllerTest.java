// package com.rocketFoodDelivery.rocketFood.api;

// import com.rocketFoodDelivery.rocketFood.controller.api.OrderApiController;
// import com.rocketFoodDelivery.rocketFood.models.Product;
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

// import java.util.Arrays;
// import java.util.List;

// import static org.mockito.ArgumentMatchers.anyInt;
// import static org.mockito.Mockito.when;

// @SpringBootTest
// @AutoConfigureMockMvc(addFilters = false)
// public class ProductsApiControllerTest {
    
//         @Autowired
//     private MockMvc mockMvc;

//     @InjectMocks
//     private OrderApiController orderApiController;

//     @MockBean
//     private com.rocketFoodDelivery.rocketFood.service.ProductService productService;

//     @Mock
//     private OrderService orderService;


//     @Test
//     public void testGetProductsByRestaurant_Success() throws Exception {
//         // Create sample products
//         Product product1 = new Product();
//         product1.setId(1);
//         product1.setName("Meatballs with Sauce");
//         product1.setCost(0);
    
//         Product product2 = new Product();
//         product2.setId(10);
//         product2.setName("Vegetable Soup");
//         product2.setCost(200);
    
//         // Mock service behavior
//         List<Product> productList = Arrays.asList(product1, product2);
//         when(productService.getProductsByRestaurantId(anyInt())).thenReturn(productList);
    
//         // Perform the request and validate the response
//         mockMvc.perform(MockMvcRequestBuilders.get("/api/products")
//                 .param("restaurant", "1")
//                 .contentType(MediaType.APPLICATION_JSON))
//                 .andExpect(MockMvcResultMatchers.status().isOk())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(product1.getId()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value(product1.getName()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[0].cost").value(product1.getCost()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[1].id").value(product2.getId()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[1].name").value(product2.getName()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$[1].cost").value(product2.getCost()));
//     }

//     // Test to get products by restaurants (not found)
//     @Test
//     public void testGetProductsByRestaurant_NotFound() throws Exception {
//     // Mock service behavior to return an empty list when no products are found
//     when(productService.getProductsByRestaurantId(anyInt())).thenReturn(Arrays.asList());

//     // Perform the request with a restaurant ID that has no products
//     mockMvc.perform(MockMvcRequestBuilders.get("/api/products")
//             .param("restaurant", "100")
//             .contentType(MediaType.APPLICATION_JSON))
//             .andExpect(MockMvcResultMatchers.status().isNotFound())
//             .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Resource not found"))
//             .andExpect(MockMvcResultMatchers.jsonPath("$.details").value("No products found for restaurant ID 100"));
//     }

// }
