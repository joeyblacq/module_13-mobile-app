// package com.rocketFoodDelivery.rocketFood.api;

// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.Mockito.*;

// import java.util.Optional;

// import org.junit.jupiter.api.Test;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.Mockito;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
// import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.rocketFoodDelivery.rocketFood.controller.api.RestaurantApiController;
// import com.rocketFoodDelivery.rocketFood.dtos.ApiAddressDto;
// import com.rocketFoodDelivery.rocketFood.dtos.ApiCreateRestaurantDto;
// import com.rocketFoodDelivery.rocketFood.models.Restaurant;
// import com.rocketFoodDelivery.rocketFood.repository.UserRepository;
// import com.rocketFoodDelivery.rocketFood.service.RestaurantService;

// import jakarta.transaction.Transactional;

// @SpringBootTest
// @AutoConfigureMockMvc(addFilters = false)
// public class RestaurantApiControllerTest {

//     @InjectMocks
//     private RestaurantApiController restaurantController;

//     @Mock
//     private RestaurantService restaurantService;

//     @Mock
//     private UserRepository userRepository;
    
//     @Autowired
//     private MockMvc mockMvc;

//     @Test
//     @Transactional
//     public void testCreateRestaurant_Success() throws Exception {
//         ApiAddressDto inputAddress = new ApiAddressDto(500, "test 123", "montreal", "g0sg0s");
//         ApiCreateRestaurantDto inputRestaurant = new ApiCreateRestaurantDto(1000, 41, 0, "VilleCool", 2, "5144155519", "ttttttt@villawellington.com", inputAddress, null);

//         // Mock service behavior
//         when(restaurantService.createRestaurant(any())).thenReturn(Optional.of(inputRestaurant));

//         // Validate response code and content
//         mockMvc.perform(MockMvcRequestBuilders.post("/api/restaurants")
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(new ObjectMapper().writeValueAsString(inputRestaurant)))
//                 .andExpect(MockMvcResultMatchers.status().isCreated())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Success"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").exists())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value(inputRestaurant.getName()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.phone").value(inputRestaurant.getPhone()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.email").value(inputRestaurant.getEmail()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.address.id").exists())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.address.city").value(inputRestaurant.getAddress().getCity()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.address.street_address").value(inputRestaurant.getAddress().getStreetAddress()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.address.postal_code").value(inputRestaurant.getAddress().getPostalCode()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.user_id").value(inputRestaurant.getUserId()))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.price_range").value(inputRestaurant.getPriceRange()));
//     }

//     @Test
//     public void testUpdateRestaurant_Success() throws Exception {
//         // Mock data
//         int restaurantId = 1;
//         ApiCreateRestaurantDto updatedData = new ApiCreateRestaurantDto();
//         updatedData.setName("Updated Name");
//         updatedData.setPriceRange(2);
//         updatedData.setPhone("555-1234");

//         // Mock service behavior
//         when(restaurantService.updateRestaurant(restaurantId, updatedData))
//                 .thenReturn(Optional.of(updatedData));

//         // Validate response code and content
//         mockMvc.perform(MockMvcRequestBuilders.put("/api/restaurants/{id}", restaurantId)
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(new ObjectMapper().writeValueAsString(updatedData)))
//                 .andExpect(MockMvcResultMatchers.status().isOk())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Success"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").exists())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("Updated Name"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.price_range").value(2))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.phone").value("555-1234"));
//     }

//     @Test
//     public void testDeleteRestaurant_Success() throws Exception {

//         Restaurant restaurant = new Restaurant();
//         restaurant.setId(8);
//         restaurant.setName("Schumm and Sons");
//         restaurant.setPriceRange(1);
        
//          // Mock the service method
//         Mockito.when(restaurantService.findById(8)).thenReturn(Optional.of(restaurant));

//         // Perform DELETE request
//         mockMvc.perform(MockMvcRequestBuilders.delete("/api/restaurants/8")
//                 .contentType(MediaType.APPLICATION_JSON))
//                 .andExpect(MockMvcResultMatchers.status().isOk())
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Success"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").value(8))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("Schumm and Sons"))
//                 .andExpect(MockMvcResultMatchers.jsonPath("$.data.price_range").value(1));
//     }

//     @Test
//     public void testDeleteRestaurantNotFound() throws Exception {
//     // Mock the service method to return empty
//     Mockito.when(restaurantService.findById(942)).thenReturn(Optional.empty());

//     // Perform DELETE request
//     mockMvc.perform(MockMvcRequestBuilders.delete("/api/restaurants/942")
//             .contentType(MediaType.APPLICATION_JSON))
//             .andExpect(MockMvcResultMatchers.status().isNotFound())
//             .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Resource not found"))
//             .andExpect(MockMvcResultMatchers.jsonPath("$.details").value("Restaurant with id 942 not found"));
// }

// }