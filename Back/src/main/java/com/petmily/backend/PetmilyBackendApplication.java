package com.petmily.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PetmilyBackendApplication {

    public static void main(String[] args) {
        try {
            Dotenv.load();
        } catch (Exception e) {
            // .env 파일이 없어도 실행되도록 예외 처리
            System.out.println("Warning: .env file not found, using default values");
        }
        SpringApplication.run(PetmilyBackendApplication.class, args);
    }
}

