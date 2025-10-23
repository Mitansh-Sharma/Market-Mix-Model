package com.example.onnxservice.controller;

import com.example.onnxservice.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictionResponse> predict(@RequestBody PredictionRequest req) throws Exception {
        double pred = predictionService.predict(
                req.getFacebookSpend(),
                req.getGoogleSpend(),
                req.getInfluencerSpend(),
                req.getTvSpend(),
                req.getPromoDiscountPercent()
        );
        return ResponseEntity.ok(new PredictionResponse(pred));
    }
}

class PredictionRequest {
    private double facebookSpend, googleSpend, influencerSpend, tvSpend, promoDiscountPercent;

    // getters & setters
    public double getFacebookSpend() { return facebookSpend; }
    public void setFacebookSpend(double facebookSpend) { this.facebookSpend = facebookSpend; }
    public double getGoogleSpend() { return googleSpend; }
    public void setGoogleSpend(double googleSpend) { this.googleSpend = googleSpend; }
    public double getInfluencerSpend() { return influencerSpend; }
    public void setInfluencerSpend(double influencerSpend) { this.influencerSpend = influencerSpend; }
    public double getTvSpend() { return tvSpend; }
    public void setTvSpend(double tvSpend) { this.tvSpend = tvSpend; }
    public double getPromoDiscountPercent() { return promoDiscountPercent; }
    public void setPromoDiscountPercent(double promoDiscountPercent) { this.promoDiscountPercent = promoDiscountPercent; }
}

class PredictionResponse {
    private double predictedOrders;
    public PredictionResponse(double predictedOrders) { this.predictedOrders = predictedOrders; }
    public double getPredictedOrders() { return predictedOrders; }
    public void setPredictedOrders(double predictedOrders) { this.predictedOrders = predictedOrders; }
}
