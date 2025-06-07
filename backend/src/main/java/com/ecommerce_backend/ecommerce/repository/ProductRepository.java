package com.ecommerce_backend.ecommerce.repository;

import com.ecommerce_backend.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    List<Product> findByIsActive(boolean isActive);

    List<Product> findByStockQuantityLessThan(Integer threshold);
}
