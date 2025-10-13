package com.rocketFoodDelivery.rocketFood.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rocketFoodDelivery.rocketFood.models.Address;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ApiAddressDto {
    private int id;

    @JsonProperty("street_address")
    @NotNull
    private String streetAddress;

    @NotNull
    private String city;

    @JsonProperty("postal_code")
    @NotNull
    private String postalCode;

    public ApiAddressDto(Address address) {
        this.id = address.getId();
        this.streetAddress = address.getStreetAddress();
        this.city = address.getCity();
        this.postalCode = address.getPostalCode();
    }

    // Getters et setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
}

