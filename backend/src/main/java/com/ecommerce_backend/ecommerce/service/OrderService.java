package com.ecommerce_backend.ecommerce.service;

import com.ecommerce_backend.ecommerce.dto.CheckoutRequest;
import com.ecommerce_backend.ecommerce.dto.OrderItemResponse;
import com.ecommerce_backend.ecommerce.dto.OrderResponse;
import com.ecommerce_backend.ecommerce.model.*;
import com.ecommerce_backend.ecommerce.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService; 

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName(); 
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProduct().getName())
                .productImageUrl(orderItem.getProduct().getImageUrl())
                .price(orderItem.getPrice())
                .quantity(orderItem.getQuantity())
                .subtotal(orderItem.getPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())))
                .build();
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> orderItemResponses = order.getOrderItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddress(order.getShippingAddress())
                .orderItems(orderItemResponses)
                .build();
    }

    @Transactional
    public OrderResponse placeOrder(CheckoutRequest request) {
        User currentUser = getCurrentAuthenticatedUser();
        Cart cart = cartRepository.findByUser(currentUser)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user"));

        if (cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot place order for an empty cart.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStockQuantity() + ", Requested: " + item.getQuantity());
            }
            totalAmount = totalAmount.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        Order order = Order.builder()
                .user(currentUser)
                .orderDate(LocalDateTime.now())
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING) 
                .paymentStatus(PaymentStatus.PENDING) 
                .shippingAddress(request.getShippingAddress())
                .build();

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice()) 
                    .build();
            order.addOrderItem(orderItem); 
            
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product); 

            if (product.getStockQuantity() <= 10) { 
                emailService.sendLowStockAlert(product.getName(), product.getStockQuantity(), 10);
            }
        }

        Order savedOrder = orderRepository.save(order); 

        cartItemRepository.deleteAll(cart.getCartItems());
        cart.getCartItems().clear(); 
        cartRepository.save(cart); 

        emailService.sendSimpleEmail(
                currentUser.getEmail(),
                "Order Confirmation #" + savedOrder.getId(),
                String.format("Dear %s,\n\nYour order #%d for a total of %.2f has been placed successfully.\nShipping to: %s\n\nThank you for shopping with us!\n\nYour E-commerce Team",
                        currentUser.getFirstName(), savedOrder.getId(), savedOrder.getTotalAmount(), savedOrder.getShippingAddress())
        );

        return mapToOrderResponse(savedOrder);
    }

    public List<OrderResponse> getUserOrders() {
        User currentUser = getCurrentAuthenticatedUser();
        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(currentUser);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + orderId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        boolean isAdmin = authentication.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized access to order.");
        }

        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + orderId));
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        emailService.sendSimpleEmail(
                updatedOrder.getUser().getEmail(),
                "Order Status Update: #" + updatedOrder.getId(),
                String.format("Dear %s,\n\nYour order #%d has been updated to: %s\n\nThank you!\nYour E-commerce Team",
                        updatedOrder.getUser().getFirstName(), updatedOrder.getId(), newStatus.name())
        );

        return mapToOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long orderId, PaymentStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + orderId));
        order.setPaymentStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }
}


