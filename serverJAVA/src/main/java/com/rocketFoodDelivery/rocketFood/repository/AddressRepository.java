package com.rocketFoodDelivery.rocketFood.repository;

import com.rocketFoodDelivery.rocketFood.models.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    Optional<Address> findById(int id);

    List<Address> findAllByOrderByIdDesc();
    
    // Fait
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value =
        "INSERT INTO addresses (street_address, city, postal_code) " +
        "VALUES (:streetAddress, :city, :postalCode)")
    void saveAddress(@Param("streetAddress") String streetAddress, 
                  @Param("city") String city, 
                  @Param("postalCode") String postalCode);
    
    @Query(nativeQuery = true, value = "SELECT LAST_INSERT_ID() AS id")
    int getLastInsertedId();

    @Query("SELECT a FROM Address a WHERE a.streetAddress = :streetAddress AND a.city = :city AND a.postalCode = :postalCode")
    Optional<Address> findByStreetAddressAndCityAndPostalCode(String streetAddress, String city, String postalCode);
}
