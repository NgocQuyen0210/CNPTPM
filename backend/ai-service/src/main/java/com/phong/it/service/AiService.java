package com.phong.it.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.phong.it.client.ProductServiceClient;
import com.phong.it.dto.AiConsultRequest;
import com.phong.it.dto.AiConsultResponse;
import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.helper.ApiResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@ApplicationScoped
public class AiService {

    private static final Logger LOG = Logger.getLogger(AiService.class);

    @Inject
    @RestClient
    ProductServiceClient productServiceClient;

    @ConfigProperty(name = "gemini.api.key", defaultValue = "")
    String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // Cache products to minimize inter-service calls
    private List<ProductResponseDTO> productsCache = null;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

    private synchronized List<ProductResponseDTO> getProductCatalog() {
        long now = System.currentTimeMillis();
        if (productsCache != null && (now - lastFetchTime < CACHE_DURATION_MS)) {
            return productsCache;
        }
        try {
            ApiResponse<List<ProductResponseDTO>> apiResponse = productServiceClient.getAllProducts();
            if (apiResponse != null && apiResponse.data() != null) {
                productsCache = apiResponse.data();
                lastFetchTime = now;
            } else {
                productsCache = Collections.emptyList();
            }
        } catch (Exception e) {
            LOG.error("Failed to load product catalog for AI service", e);
            if (productsCache == null) {
                productsCache = Collections.emptyList();
            }
        }
        return productsCache;
    }

    public AiConsultResponse consult(AiConsultRequest request) {
        List<ProductResponseDTO> catalog = getProductCatalog();
        String userMessage = request.getMessage();
        List<AiConsultRequest.ChatMessage> history = request.getHistory() != null ? request.getHistory() : Collections.emptyList();

        String activeKey = (request.getApiKey() != null && !request.getApiKey().trim().isEmpty())
                ? request.getApiKey()
                : apiKey;

        if (activeKey != null && !activeKey.trim().isEmpty() && !activeKey.equalsIgnoreCase("none")) {
            try {
                return consultWithGemini(userMessage, catalog, activeKey, history);
            } catch (Exception e) {
                LOG.warn("Failed to call Gemini API, falling back to local recommendation engine", e);
            }
        }

        return smartLocalRecommendation(userMessage, catalog);
    }

    private AiConsultResponse consultWithGemini(String userMessage, List<ProductResponseDTO> catalog, String key, List<AiConsultRequest.ChatMessage> history) throws IOException, InterruptedException {
        List<Map<String, Object>> simplifiedCatalog = catalog.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.id());
            map.put("name", p.name());
            map.put("brand", p.brand() != null ? p.brand() : "");
            map.put("price", p.price());
            map.put("category", p.categoryName() != null ? p.categoryName() : "");
            map.put("summary", p.summary() != null ? p.summary() : (p.content() != null ? p.content() : ""));
            return map;
        }).collect(Collectors.toList());

        String systemPrompt = "Bạn là Trợ lý AI Tư vấn Mua sắm chuyên nghiệp của cửa hàng Đồ Điện Tử & Phụ Kiện Công Nghệ chính hãng.\n" +
                "Shop CHỈ kinh doanh các dòng sản phẩm Đồ Điện Tử (Điện thoại/Smartphone, Laptop, Tablet, Smartwatch) và Phụ kiện công nghệ (Tai nghe, Loa, Sạc, Cáp, Bàn phím, Chuột, Ốp lưng, AirTag...).\n\n" +
                "Dưới đây là Danh sách Sản phẩm hiện có trong kho hàng của shop:\n" +
                objectMapper.writeValueAsString(simplifiedCatalog) + "\n\n" +
                "Nhiệm vụ của bạn:\n" +
                "1. Đọc và hiểu nhu cầu/yêu cầu về thiết bị điện tử & phụ kiện của khách hàng (ngân sách, tính năng camera, pin, cấu hình chơi game, mỏng nhẹ văn phòng...).\n" +
                "2. Lựa chọn các sản phẩm điện tử/phụ kiện PHÙ HỢP NHẤT từ danh sách trên để tư vấn cho khách.\n" +
                "3. Trả lời khách bằng tiếng Việt lịch sự, am hiểu công nghệ, tự nhiên. Giải thích lý do chọn sản phẩm.\n" +
                "4. Cuối phản hồi, BẮT BUỘC chèn một dòng định dạng danh sách ID sản phẩm được đề xuất chính xác theo dạng:\n" +
                "[RECOMMEND: id1, id2, id3]\n" +
                "Ví dụ: [RECOMMEND: 1, 5, 8] (nếu không có sản phẩm nào hợp, để [RECOMMEND:])";

        // Build Gemini API payload
        ObjectNode payload = objectMapper.createObjectNode();
        ArrayNode contentsNode = payload.putArray("contents");

        // System prompt as first user part
        ObjectNode systemMsg = contentsNode.addObject();
        systemMsg.put("role", "user");
        systemMsg.putArray("parts").addObject().put("text", systemPrompt);

        // Add last 6 messages of chat history
        int startIdx = Math.max(0, history.size() - 6);
        for (int i = startIdx; i < history.size(); i++) {
            AiConsultRequest.ChatMessage msg = history.get(i);
            ObjectNode histMsg = contentsNode.addObject();
            histMsg.put("role", "user".equalsIgnoreCase(msg.getSender()) ? "user" : "model");
            histMsg.putArray("parts").addObject().put("text", msg.getText());
        }

        // Current message
        ObjectNode currentMsg = contentsNode.addObject();
        currentMsg.put("role", "user");
        currentMsg.putArray("parts").addObject().put("text", userMessage);

        String requestBody = objectMapper.writeValueAsString(payload);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + key;

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() != 200) {
            throw new IOException("Gemini API HTTP " + httpResponse.statusCode() + ": " + httpResponse.body());
        }

        JsonNode rootNode = objectMapper.readTree(httpResponse.body());
        String rawText = rootNode.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");

        // Parse [RECOMMEND: id1, id2]
        List<Long> recommendedIds = new ArrayList<>();
        String cleanText = rawText;

        Pattern recommendPattern = Pattern.compile("\\[RECOMMEND:\\s*([\\d,\\s]*)\\]", Pattern.CASE_INSENSITIVE);
        Matcher matcher = recommendPattern.matcher(rawText);
        if (matcher.find()) {
            String idsStr = matcher.group(1);
            if (idsStr != null && !idsStr.trim().isEmpty()) {
                String[] idTokens = idsStr.split(",");
                for (String token : idTokens) {
                    try {
                        recommendedIds.add(Long.parseLong(token.trim()));
                    } catch (NumberFormatException ignored) {}
                }
            }
            cleanText = matcher.replaceAll("").trim();
        }

        List<ProductResponseDTO> recommendedProducts = catalog.stream()
                .filter(p -> recommendedIds.contains(p.id()))
                .collect(Collectors.toList());

        return new AiConsultResponse(cleanText, recommendedProducts);
    }

    private AiConsultResponse smartLocalRecommendation(String userMessage, List<ProductResponseDTO> catalog) {
        if (catalog == null || catalog.isEmpty()) {
            return new AiConsultResponse(
                    "Xin lỗi quý khách, hiện tại shop chưa thể truy xuất danh mục sản phẩm. Quý khách vui lòng thử lại sau giây lát!",
                    Collections.emptyList()
            );
        }

        String lowerMsg = userMessage.toLowerCase();

        Double maxPrice = null;
        Double minPrice = null;

        // Parse maximum price (e.g. "dưới 10 triệu", "duoi 15tr")
        Pattern underPattern = Pattern.compile("(dưới|nhỏ hơn|thấp hơn|<|duoi)\\s*(\\d+(\\.\\d+)?)\\s*(tr|triệu|trieu|trk|t)", Pattern.CASE_INSENSITIVE);
        Matcher underMatcher = underPattern.matcher(lowerMsg);
        if (underMatcher.find()) {
            maxPrice = Double.parseDouble(underMatcher.group(2)) * 1000000.0;
        }

        // Parse minimum price (e.g. "trên 15 triệu", "tren 5tr")
        Pattern overPattern = Pattern.compile("(trên|lớn hơn|cao hơn|>|tren)\\s*(\\d+(\\.\\d+)?)\\s*(tr|triệu|trieu|trk|t)", Pattern.CASE_INSENSITIVE);
        Matcher overMatcher = overPattern.matcher(lowerMsg);
        if (overMatcher.find()) {
            minPrice = Double.parseDouble(overMatcher.group(2)) * 1000000.0;
        }

        // Parse approximate price (e.g. "tầm 15 triệu", "khoảng 20tr")
        Pattern approxPattern = Pattern.compile("(tầm|khoảng|tam|khoang|xung quanh)\\s*(\\d+(\\.\\d+)?)\\s*(tr|triệu|trieu|trk|t)", Pattern.CASE_INSENSITIVE);
        Matcher approxMatcher = approxPattern.matcher(lowerMsg);
        if (approxMatcher.find() && maxPrice == null && minPrice == null) {
            double basePrice = Double.parseDouble(approxMatcher.group(2)) * 1000000.0;
            minPrice = basePrice * 0.7;
            maxPrice = basePrice * 1.3;
        }

        // Brands match
        List<String> knownBrands = Arrays.asList("apple", "iphone", "samsung", "dell", "asus", "lenovo", "hp", "acer", "msi", "sony", "xiaomi", "oppo");
        List<String> matchedBrands = knownBrands.stream().filter(lowerMsg::contains).collect(Collectors.toList());

        // Category keywords mapping
        Map<String, List<String>> categoryKeywords = new HashMap<>();
        categoryKeywords.put("điện thoại", Arrays.asList("điện thoại", "phone", "iphone", "smartphone", "di dien thoai", "đt"));
        categoryKeywords.put("laptop", Arrays.asList("laptop", "máy tính xách tay", "may tinh", "macbook", "pc"));
        categoryKeywords.put("tai nghe", Arrays.asList("tai nghe", "headphone", "earphone", "airpods"));
        categoryKeywords.put("đồng hồ", Arrays.asList("đồng hồ", "watch", "smartwatch"));

        // Intent keywords mapping
        Map<String, List<String>> intentKeywords = new HashMap<>();
        intentKeywords.put("gaming", Arrays.asList("game", "chơi game", "gaming", "đồ họa", "cấu hình mạnh"));
        intentKeywords.put("office", Arrays.asList("văn phòng", "học tập", "sinh viên", "mỏng nhẹ", "gọn nhẹ", "làm việc"));
        intentKeywords.put("camera", Arrays.asList("chụp ảnh", "chụp hình", "camera", "quay video", "sống ảo"));
        intentKeywords.put("battery", Arrays.asList("pin trâu", "pin khỏe", "dung lượng pin"));
        intentKeywords.put("cheap", Arrays.asList("giá rẻ", "rẻ", "tiết kiệm", "bình dân"));
        intentKeywords.put("best", Arrays.asList("nổi bật", "bán chạy", "mới nhất", "tốt nhất", "xịn nhất", "cao cấp"));

        class ScoredProduct {
            final ProductResponseDTO product;
            int score;

            ScoredProduct(ProductResponseDTO product, int score) {
                this.product = product;
                this.score = score;
            }
        }

        List<ScoredProduct> scoredProducts = new ArrayList<>();

        for (ProductResponseDTO p : catalog) {
            int score = 0;
            String pName = p.name() != null ? p.name().toLowerCase() : "";
            String pBrand = p.brand() != null ? p.brand().toLowerCase() : "";
            String pCategory = p.categoryName() != null ? p.categoryName().toLowerCase() : "";
            String pSummary = (p.summary() != null ? p.summary().toLowerCase() : "") + " " +
                    (p.content() != null ? p.content().toLowerCase() : "");
            double pPrice = p.price() != null ? p.price().doubleValue() : 0.0;

            // Price filtering
            if (maxPrice != null && pPrice > maxPrice) continue;
            if (minPrice != null && pPrice < minPrice) continue;
            if (maxPrice != null || minPrice != null) score += 20;

            // Brand matching
            for (String brand : matchedBrands) {
                if (pBrand.contains(brand) || pName.contains(brand)) {
                    score += 40;
                }
            }

            // Word matching
            String[] words = lowerMsg.split("\\s+");
            for (String w : words) {
                if (w.length() > 2) {
                    if (pName.contains(w)) score += 15;
                    if (pSummary.contains(w)) score += 5;
                }
            }

            // Category matching
            for (Map.Entry<String, List<String>> entry : categoryKeywords.entrySet()) {
                String catName = entry.getKey();
                List<String> keys = entry.getValue();
                boolean keysMatch = keys.stream().anyMatch(lowerMsg::contains);
                if (keysMatch) {
                    if (pCategory.contains(catName) || pName.contains(catName)) {
                        score += 35;
                    }
                }
            }

            // Intent matching
            for (Map.Entry<String, List<String>> entry : intentKeywords.entrySet()) {
                String intent = entry.getKey();
                List<String> keys = entry.getValue();
                boolean keysMatch = keys.stream().anyMatch(lowerMsg::contains);
                if (keysMatch) {
                    if (pSummary.contains(intent) || pName.contains(intent) || keys.stream().anyMatch(pSummary::contains) || keys.stream().anyMatch(pName::contains)) {
                        score += 25;
                    }
                }
            }

            scoredProducts.add(new ScoredProduct(p, score));
        }

        // Sort by score descending
        List<ProductResponseDTO> topProducts = scoredProducts.stream()
                .filter(item -> item.score > 0)
                .sorted((a, b) -> Integer.compare(b.score, a.score))
                .limit(4)
                .map(item -> item.product)
                .collect(Collectors.toList());

        // Fallback to random 3 products if nothing matched
        if (topProducts.isEmpty()) {
            List<ProductResponseDTO> shuffleCatalog = new ArrayList<>(catalog);
            Collections.shuffle(shuffleCatalog);
            topProducts = shuffleCatalog.stream().limit(3).collect(Collectors.toList());
        }

        // Create natural conversational advice
        String adviceText = "Dựa trên yêu cầu của bạn, shop xin gợi ý các sản phẩm phù hợp nhất dưới đây:\n";

        if (maxPrice != null) {
            adviceText = String.format("Dạ, với mức ngân sách khoảng dưới **%,.0f triệu VNĐ**, shop khuyên bạn nên tham khảo các dòng sản phẩm chất lượng cao sau:\n", maxPrice / 1000000.0);
        } else if (!matchedBrands.isEmpty()) {
            String brandStr = matchedBrands.stream().map(String::toUpperCase).collect(Collectors.joining(", "));
            adviceText = String.format("Shop xin gợi ý các sản phẩm thuộc thương hiệu **%s** được ưa chuộng nhất hiện nay:\n", brandStr);
        } else if (lowerMsg.contains("game") || lowerMsg.contains("gaming")) {
            adviceText = "Dành cho nhu cầu chơi game & giải trí hiệu năng cao, đây là những sản phẩm có cấu hình cực tốt trong tầm giá:\n";
        } else if (lowerMsg.contains("văn phòng") || lowerMsg.contains("học tập") || lowerMsg.contains("mỏng nhẹ")) {
            adviceText = "Với nhu cầu học tập, làm việc văn phòng mỏng nhẹ và thiết kế tinh tế, bạn không nên bỏ qua các lựa chọn sau:\n";
        }

        adviceText += "\n👉 *Bạn có thể bấm trực tiếp vào sản phẩm bên dưới để xem chi tiết hoặc thêm nhanh vào giỏ hàng nhé!*";

        return new AiConsultResponse(adviceText, topProducts);
    }
}
