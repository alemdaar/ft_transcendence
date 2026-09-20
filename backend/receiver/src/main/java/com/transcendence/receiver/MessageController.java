package com.transcendence.receiver;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final ObjectMapper objectMapper;
    private final Path outputFile;

    public MessageController(ObjectMapper objectMapper,
                             @Value("${message.output-file:/app/data/received-message.json}") String outputFile) {
        this.objectMapper = objectMapper;
        this.outputFile = Path.of(outputFile);
    }

    @PostMapping
    public ResponseEntity<ReceiveResponse> receive(@RequestBody JsonNode message) throws IOException {
        Files.createDirectories(outputFile.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(outputFile.toFile(), message);
        return ResponseEntity.ok(new ReceiveResponse("received", outputFile.toString()));
    }

    public record ReceiveResponse(String status, String file) {
    }
}