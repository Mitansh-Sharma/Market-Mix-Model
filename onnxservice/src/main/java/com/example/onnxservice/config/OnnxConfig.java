package com.example.onnxservice.config;

import ai.onnxruntime.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Configuration
public class OnnxConfig {

    @Bean(destroyMethod = "close")
    public OrtEnvironment ortEnvironment() throws OrtException {
        return OrtEnvironment.getEnvironment();
    }

    @Bean(destroyMethod = "close")
    public OrtSession ortSession(OrtEnvironment env) throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/models/xgb_model.onnx")) {
            if (is == null) throw new IllegalStateException("ONNX model not found!");
            Path tempFile = Files.createTempFile("xgb_model", ".onnx");
            Files.copy(is, tempFile, StandardCopyOption.REPLACE_EXISTING);

            OrtSession.SessionOptions opts = new OrtSession.SessionOptions();
            return env.createSession(tempFile.toString(), opts);
        }
    }
}
