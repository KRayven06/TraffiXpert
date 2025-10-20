package com.traffixpert.TraffiXpert; // Adjust if your package name is different

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // Import this

@EnableScheduling // Add this annotation
@SpringBootApplication
public class TraffiXpertApplication {

    public static void main(String[] args) {
        SpringApplication.run(TraffiXpertApplication.class, args);
    }

}
