package com.rocketFoodDelivery.rocketFood.controller.api;

import com.rocketFoodDelivery.rocketFood.dtos.AccountUpdateDTO;
import com.rocketFoodDelivery.rocketFood.dtos.AccountResponseDTO;
import com.rocketFoodDelivery.rocketFood.dtos.AuthRequestDto;
import com.rocketFoodDelivery.rocketFood.dtos.AuthResponseErrorDTO;
import com.rocketFoodDelivery.rocketFood.dtos.AuthResponseSuccessDTO;
import com.rocketFoodDelivery.rocketFood.models.Courier;
import com.rocketFoodDelivery.rocketFood.models.Customer;
import com.rocketFoodDelivery.rocketFood.models.UserEntity;
import com.rocketFoodDelivery.rocketFood.repository.CourierRepository;
import com.rocketFoodDelivery.rocketFood.repository.CustomerRepository;
import com.rocketFoodDelivery.rocketFood.repository.UserRepository;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
public class AuthController {
    private final CourierRepository courierRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Autowired
    AuthenticationManager authManager;

    public AuthController(CourierRepository courierRepository, CustomerRepository customerRepository, UserRepository userRepository){
        this.courierRepository = courierRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/api/auth")
    public ResponseEntity<?> authenticate(@RequestBody @Valid AuthRequestDto request){
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword())
            );
            UserEntity user = (UserEntity) authentication.getPrincipal();
            Optional<Courier> courier = courierRepository.findByUserEntityId(user.getId());
            Optional<Customer> customer = customerRepository.findByUserEntityId(user.getId());

            AuthResponseSuccessDTO response = new AuthResponseSuccessDTO();
            if(courier.isPresent()){
                response.setCourier_id(courier.get().getId());
            }
            if (customer.isPresent()){
                response.setCustomer_id(customer.get().getId());
            }
            response.setSuccess(true);
            response.setUser_id(user.getId());
            return ResponseEntity.ok().body(response);
        } catch (BadCredentialsException e) {
            AuthResponseErrorDTO response = new AuthResponseErrorDTO();
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/api/account/{id}")
    public ResponseEntity<?> getAccount(@PathVariable int id) {
        Optional<UserEntity> userOptional = userRepository.findById(id);

        if (!userOptional.isPresent()) {
            return ResponseEntity.status(422).body("Invalid ID");
        }

        UserEntity user = userOptional.get();
        String primaryEmail = user.getEmail();

        // Récupérer les informations du client et du coursier
        Optional<Customer> customerOptional = customerRepository.findByUserEntityId(id);
        Optional<Courier> courierOptional = courierRepository.findByUserEntityId(id);

        AccountResponseDTO response = new AccountResponseDTO(
            primaryEmail,
            customerOptional.map(Customer::getEmail).orElse(null),
            customerOptional.map(Customer::getPhone).orElse(null),
            courierOptional.map(Courier::getEmail).orElse(null),
            courierOptional.map(Courier::getPhone).orElse(null)
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/account/{id}")
    public ResponseEntity<?> updateAccount(
        @PathVariable int id,
        @RequestBody AccountUpdateDTO accountUpdateDTO
    ) {
        Optional<UserEntity> userOptional = userRepository.findById(id);

        if (!userOptional.isPresent()) {
            return ResponseEntity.status(422).body("Invalid ID");
        }

        // Mise à jour des informations du client
        if (accountUpdateDTO.getCustomerEmail() != null || accountUpdateDTO.getCustomerPhone() != null) {
            Optional<Customer> customerOptional = customerRepository.findByUserEntityId(id);
            if (customerOptional.isPresent()) {
                Customer customer = customerOptional.get();
                customer.setEmail(accountUpdateDTO.getCustomerEmail());
                customer.setPhone(accountUpdateDTO.getCustomerPhone());
                customerRepository.save(customer);
            }
        }

        // Mise à jour des informations du coursier
        if (accountUpdateDTO.getCourierEmail() != null || accountUpdateDTO.getCourierPhone() != null) {
            Optional<Courier> courierOptional = courierRepository.findByUserEntityId(id);
            if (courierOptional.isPresent()) {
                Courier courier = courierOptional.get();
                courier.setEmail(accountUpdateDTO.getCourierEmail());
                courier.setPhone(accountUpdateDTO.getCourierPhone());
                courierRepository.save(courier);
            }
        }

        return ResponseEntity.ok("Account updated successfully");
    }

}
