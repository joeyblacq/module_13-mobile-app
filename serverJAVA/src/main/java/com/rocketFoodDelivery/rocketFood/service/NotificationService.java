package com.rocketFoodDelivery.rocketFood.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.rocketFoodDelivery.rocketFood.dtos.ApiOrderDTO;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class NotificationService {


    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String phoneNumber;

    @Value("${notify.secret.key}")
    private String notifySecretKey;

    @Value("${notify.client.id}")
    private String notifyClientId;

    @Value("${notify.template.id}")
    private String notifyTemplateId;


    public void sendSmsNotification(String to, String message) {
        // Twilio.init(accountSid, authToken);
    
        // Message.creator(
        //     new PhoneNumber(to),
        //     new PhoneNumber(phoneNumber),
        //     message
        // ).create();
    }

    public void sendEmailNotification(String customerEmail, ApiOrderDTO orderDTO) {
        // HttpClient client = HttpClient.newHttpClient();
        // String url = "https://api.notify.eu/notification/send";
        
        // String payload = String.format(
        //     "{ \"message\": { \"notificationType\": \"%s\", \"language\": \"en\", \"params\": { \"order_id\": \"%d\", \"customer_name\": \"%s\", \"restaurant_name\": \"%s\", \"order_total_cost\": \"%s\" }, \"transport\": [{ \"type\": \"SMTP\", \"recipients\": { \"to\": [{ \"name\": \"%s\", \"recipient\": \"%s\" }] } }] } }",
        //     notifyTemplateId, 
        //     orderDTO.getId(), 
        //     orderDTO.getCustomer_name(), 
        //     orderDTO.getRestaurant_name(), 
        //     formatCentsToCurrency(orderDTO.getTotal_cost()), 
        //     orderDTO.getCustomer_name(), 
        //     customerEmail
            
        // );

        // HttpRequest request = HttpRequest.newBuilder()
        //     .uri(URI.create(url))
        //     .header("Content-Type", "application/json")
        //     .header("X-ClientId", notifyClientId)
        //     .header("X-SecretKey", notifySecretKey)
        //     .POST(HttpRequest.BodyPublishers.ofString(payload))
        //     .build();


        // try {
        //     HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        //     if (response.statusCode() != 200) {
        //         throw new RuntimeException("Failed to send email notification");
        //     }
        // } catch (Exception e) {
        //     throw new RuntimeException("Failed to send email notification", e);
        // }
    }

    private String formatCentsToCurrency(long cents) {
        // Convertir les cents en dollars en divisant par 100.0 pour obtenir un double
        double dollars = cents / 100.0 * 100.0;
        // Utiliser String.format pour formater le double en une chaîne avec deux décimales
        return String.format("$%.2f", dollars);
    }
}