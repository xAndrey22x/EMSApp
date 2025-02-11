package com.energyMonitoring.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    private final Dotenv dotenv = Dotenv.load();

    @Bean
    public CachingConnectionFactory connectionFactory() {
        CachingConnectionFactory connectionFactory = new CachingConnectionFactory();
        connectionFactory.setHost(dotenv.get("RABBITMQ_HOST"));
        connectionFactory.setUsername(dotenv.get("RABBITMQ_USERNAME"));
        connectionFactory.setPassword(dotenv.get("RABBITMQ_PASSWORD"));
        connectionFactory.setVirtualHost(dotenv.get("RABBITMQ_VHOST"));
        connectionFactory.setPort(5671);
        try {
            connectionFactory.getRabbitConnectionFactory().useSslProtocol();
        } catch (Exception e) {
            throw new RuntimeException("Failed to configure SSL for RabbitMQ connection", e);
        }
        return connectionFactory;
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }

    @Bean
    public Queue myQueue() {
        return new Queue("sensor_data_queue", false);
    }
}
