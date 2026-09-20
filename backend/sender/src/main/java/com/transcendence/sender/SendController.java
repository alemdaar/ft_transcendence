package com.transcendence.sender;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/send")
public class SendController {
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final Path inputFile = Path.of("/app/data/message.json");

    public SendController(ObjectMapper objectMapper,
                          @Value("${receiver.url:http://localhost:8080}") String receiverUrl) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(5000);
        this.restClient = RestClient.builder()
            .baseUrl(receiverUrl)
            .requestFactory(requestFactory)
            .build();
    }

    @PostMapping
    public ResponseEntity<JsonNode> send() throws IOException {
        JsonNode message = objectMapper.readTree(inputFile.toFile());
        JsonNode response = restClient.post()
                .uri("/api/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .body(message)
                .retrieve()
                .body(JsonNode.class);
        return ResponseEntity.ok(response);
    }
}