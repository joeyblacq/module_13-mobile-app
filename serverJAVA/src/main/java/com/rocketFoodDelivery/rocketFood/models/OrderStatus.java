package com.rocketFoodDelivery.rocketFood.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_statuses")
public class OrderStatus {
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private int id;

    @NotNull
    @Pattern(regexp = "^(pending|in progress|delivered)$", message = "Invalid order status")
    @Column(name = "name", nullable = false)
    private String name;

        // Getter et Setter
        public int getId() {
            return id;
        }
    
        public void setId(int id) {
            this.id = id;
        }
    
        public String getStatus() {
            return name;
        }
    
        public void setStatus(String name) {
            this.name = name;
        }
}
