package com.petmily.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PetmilyBackendApplication {

    public static void main(String[] args) {
        Dotenv.load();
        SpringApplication.run(PetmilyBackendApplication.class, args);
    }

}

