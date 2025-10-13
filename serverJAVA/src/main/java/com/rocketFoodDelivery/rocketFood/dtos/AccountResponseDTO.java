package com.rocketFoodDelivery.rocketFood.dtos;

public class AccountResponseDTO {
    private final String primaryEmail;
    private final String customerEmail;
    private final String customerPhone;
    private final String courierEmail;
    private final String courierPhone;

    public AccountResponseDTO(String primaryEmail, String customerEmail, String customerPhone, String courierEmail, String courierPhone) {
        this.primaryEmail = primaryEmail;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.courierEmail = courierEmail;
        this.courierPhone = courierPhone;
    }

    // Getters
    public String getPrimaryEmail() {
        return primaryEmail;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getCourierEmail() {
        return courierEmail;
    }

    public String getCourierPhone() {
        return courierPhone;
    }
}
