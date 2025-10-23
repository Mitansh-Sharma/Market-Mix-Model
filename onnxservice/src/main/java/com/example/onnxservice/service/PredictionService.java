package com.example.onnxservice.service;

import ai.onnxruntime.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
public class PredictionService {

    private final OrtEnvironment env;
    private final OrtSession session;
    private final String inputName;
    private final int nFeatures;

    public PredictionService(OrtEnvironment env, OrtSession session) throws OrtException {
        this.env = env;
        this.session = session;

        Map<String, NodeInfo> inputInfo = session.getInputInfo();
        if (inputInfo.isEmpty()) throw new IllegalStateException("ONNX model has no inputs");

        this.inputName = inputInfo.keySet().iterator().next();

        NodeInfo inNode = inputInfo.get(inputName);
        TensorInfo tinfo = (TensorInfo) inNode.getInfo();
        long[] shape = tinfo.getShape();
        this.nFeatures = (shape.length == 2 && shape[1] > 0) ? (int) shape[1] : 5;
    }

    public double predict(double facebookSpend, double googleSpend,
                          double influencerSpend, double tvSpend,
                          double promoDiscountPercent) throws OrtException {

        float[][] input = new float[1][nFeatures];
        input[0][0] = (float) facebookSpend;
        input[0][1] = (float) googleSpend;
        input[0][2] = (float) influencerSpend;
        input[0][3] = (float) tvSpend;
        input[0][4] = (float) promoDiscountPercent;

        OnnxTensor tensor = OnnxTensor.createTensor(env, input);
        try {
            Map<String, OnnxTensor> inputs = Collections.singletonMap(inputName, tensor);
            try (OrtSession.Result results = session.run(inputs)) {
                Object value = results.get(0).getValue();
                if (value instanceof float[][]) return ((float[][]) value)[0][0];
                if (value instanceof double[][]) return ((double[][]) value)[0][0];
                if (value instanceof float[]) return ((float[]) value)[0];
                if (value instanceof double[]) return ((double[]) value)[0];
                throw new IllegalStateException("Unexpected ONNX output type: " + value.getClass());
            }
        } finally {
            tensor.close();
        }
    }
}
