package com.ecommerce_backend.ecommerce.repository;

import com.ecommerce_backend.ecommerce.model.Order;
import com.ecommerce_backend.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByOrderDateDesc(User user);
}