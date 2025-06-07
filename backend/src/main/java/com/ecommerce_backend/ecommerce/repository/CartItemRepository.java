package com.ecommerce_backend.ecommerce.repository;

import com.ecommerce_backend.ecommerce.model.Cart;
import com.ecommerce_backend.ecommerce.model.CartItem;
import com.ecommerce_backend.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    void deleteByCartAndProduct(Cart cart, Product product);
}