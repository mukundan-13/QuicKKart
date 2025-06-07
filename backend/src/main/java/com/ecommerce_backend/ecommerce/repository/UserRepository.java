package com.ecommerce_backend.ecommerce.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce_backend.ecommerce.model.User;

@Repository
public interface UserRepository extends JpaRepository<User,Long>{

        Optional<User> findByEmail(String email);
} 
