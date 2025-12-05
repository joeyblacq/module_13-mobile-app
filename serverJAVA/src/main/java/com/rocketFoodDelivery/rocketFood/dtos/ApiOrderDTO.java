package com.rocketFoodDelivery.rocketFood.dtos;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO used by the mobile API for orders (create + read).
 */
@Getter
@Setter
public class ApiOrderDTO {

    // ----- Identifiers -----
    private int id;
    private int customer_id;
    private int restaurant_id;
    private int courier_id;     // 0 if not assigned

    // ----- Names / Contact info -----
    private String customer_name;
    private String customer_address;
    private String customer_phone;

    private String restaurant_name;
    private String restaurant_address;

    private String courier_name;

    // ----- Status & timing -----
    private String status;          // "pending", "in progress", "delivered"
    private LocalDateTime timestamp;

    // ----- Products in this order -----
    // This MUST match what OrderService uses
    private List<ApiProductForOrderApiDTO> products;

    // ----- Price -----
    private long total_cost;        // e.g. in cents (depends on your model)

    // ----- Notification options from mobile app -----
    private boolean sendEmail;      // true = send email confirmation
    private boolean sendSMS;        // true = send SMS confirmation
}
 