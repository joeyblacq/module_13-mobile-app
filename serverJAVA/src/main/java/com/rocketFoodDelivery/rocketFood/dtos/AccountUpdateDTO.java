package com.rocketFoodDelivery.rocketFood.dtos;

public class AccountUpdateDTO {

    private String customerEmail;
    private String customerPhone;
    private String courierEmail;
    private String courierPhone;

    // Getters and Setters

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCourierEmail() {
        return courierEmail;
    }

    public void setCourierEmail(String courierEmail) {
        this.courierEmail = courierEmail;
    }

    public String getCourierPhone() {
        return courierPhone;
    }

    public void setCourierPhone(String courierPhone) {
        this.courierPhone = courierPhone;
    }
}
