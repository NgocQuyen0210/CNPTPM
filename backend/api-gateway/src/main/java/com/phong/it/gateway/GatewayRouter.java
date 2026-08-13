package com.phong.it.gateway;

import io.quarkus.vertx.web.Route;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class GatewayRouter {

    @Inject
    Vertx vertx;

    private WebClient webClient;

    @ConfigProperty(name = "gateway.auth-service-url", defaultValue = "http://localhost:9001")
    String authServiceUrl;

    @ConfigProperty(name = "gateway.product-service-url", defaultValue = "http://localhost:9002")
    String productServiceUrl;

    @ConfigProperty(name = "gateway.order-service-url", defaultValue = "http://localhost:9003")
    String orderServiceUrl;

    @ConfigProperty(name = "gateway.payment-service-url", defaultValue = "http://localhost:9004")
    String paymentServiceUrl;

    @ConfigProperty(name = "gateway.ai-service-url", defaultValue = "http://localhost:9005")
    String aiServiceUrl;

    @PostConstruct
    void init() {
        this.webClient = WebClient.create(vertx);
    }

    @Route(path = "/*", order = 1)
    void handle(RoutingContext rc) {
        String path = rc.request().path();
        
        // Remove leading slash if present for resolution
        String checkPath = path.startsWith("/") ? path.substring(1) : path;
        String targetUrl = resolveTargetService(checkPath);
        
        if (targetUrl == null) {
            rc.response().setStatusCode(404).end("Route not found in API Gateway");
            return;
        }

        String fullUrl = targetUrl + path;
        if (rc.request().query() != null) {
            fullUrl += "?" + rc.request().query();
        }

        var clientRequest = webClient.requestAbs(rc.request().method(), fullUrl);

        // Forward headers
        for (var header : rc.request().headers().entries()) {
            if (header.getKey().equalsIgnoreCase("host")) {
                continue;
            }
            clientRequest.putHeader(header.getKey(), header.getValue());
        }

        Buffer body = rc.body() != null ? rc.body().buffer() : null;
        io.vertx.core.Future<HttpResponse<Buffer>> vertxFuture;
        if (body != null && body.length() > 0) {
            vertxFuture = clientRequest.sendBuffer(body);
        } else {
            vertxFuture = clientRequest.send();
        }

        vertxFuture.onComplete(ar -> {
            if (ar.succeeded()) {
                HttpResponse<Buffer> response = ar.result();
                rc.response().setStatusCode(response.statusCode());
                for (var header : response.headers().entries()) {
                    rc.response().putHeader(header.getKey(), header.getValue());
                }
                if (response.body() != null) {
                    rc.response().end(response.body());
                } else {
                    rc.response().end();
                }
            } else {
                rc.response().setStatusCode(502).end("Gateway Error: " + ar.cause().getMessage());
            }
        });
    }

    private String resolveTargetService(String path) {
        if (path.startsWith("api/v1/auth") || path.startsWith("api/v1/users")) {
            return authServiceUrl;
        } else if (path.startsWith("api/v1/products") || path.startsWith("api/v1/product-variants") || path.startsWith("api/v1/categories") || path.startsWith("api/v1/suppliers") || path.startsWith("api/v1/stock-movements") || path.startsWith("api/v1/reviews")) {
            return productServiceUrl;
        } else if (path.startsWith("api/v1/orders") || path.startsWith("api/v1/cart") || path.startsWith("api/v1/wishlists") || path.startsWith("api/v1/coupons")) {
            return orderServiceUrl;
        } else if (path.startsWith("api/payments")) {
            return paymentServiceUrl;
        } else if (path.startsWith("api/v1/ai")) {
            return aiServiceUrl;
        }
        return null;
    }
}
